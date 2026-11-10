import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listTutorials,
  saveTutorialRecord,
  type TutorialRow,
} from "@/lib/admin/tutorials.functions";
import { tutorialSchema } from "@/lib/admin/schemas";
import { AlbaButton } from "@/components/site/AlbaButton";
import { SaveStatus, type SaveState } from "./SaveStatus";

export function TutorialEditor() {
  const list = useServerFn(listTutorials);
  const save = useServerFn(saveTutorialRecord);
  const [rows, setRows] = useState<TutorialRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function load() {
    const r = await list();
    if (!r.ok) {
      setLoadError(r.error);
      return;
    }
    setRows(r.data);
  }
  useEffect(() => {
    void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  if (loadError)
    return (
      <p role="alert" className="border-l-4 border-alba-ink bg-alba-gold/30 p-4 text-sm">
        {loadError}
      </p>
    );
  if (rows === null)
    return (
      <p role="status" className="text-sm">
        Loading tutorials…
      </p>
    );
  if (rows.length === 0) return <p className="text-sm">No tutorials exist yet.</p>;

  return (
    <div className="grid gap-10">
      {rows.map((row) => (
        <TutorialForm
          key={row.id}
          row={row}
          onSave={async (values) => {
            setErrors({});
            setState({ kind: "saving" });
            const r = await save({ data: { id: row.id, values } });
            if (!r.ok) {
              setState({ kind: "error", message: r.error });
              return;
            }
            setState({ kind: "saved" });
            await load();
          }}
          errors={errors}
          setErrors={setErrors}
          state={state}
        />
      ))}
      <p className="text-sm">
        Only English tutorials are shown on the website today. A Kiswahili tutorial can be added
        here once an official video exists.
      </p>
    </div>
  );
}

function TutorialForm({
  row,
  onSave,
  errors,
  setErrors,
  state,
}: {
  row: TutorialRow;
  onSave: (values: {
    language: "en" | "sw";
    title: string;
    youtubeUrl: string;
    published: boolean;
    active: boolean;
  }) => Promise<void>;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  state: SaveState;
}) {
  const [title, setTitle] = useState(row.title);
  const [url, setUrl] = useState(`https://youtu.be/${row.youtubeId}`);
  const [published, setPublished] = useState(row.published);
  const [active, setActive] = useState(row.active);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate = { language: row.language, title, youtubeUrl: url, published, active };
    const parsed = tutorialSchema.safeParse(candidate);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0] ?? "form")] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    await onSave({ ...candidate, youtubeUrl: url });
  }

  const idBase = `tut-${row.id}`;
  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid max-w-2xl gap-5 border-t-2 border-alba-ink pt-8"
      aria-label={`${row.language === "en" ? "English" : "Kiswahili"} tutorial`}
    >
      <p className="label">{row.language === "en" ? "English" : "Kiswahili"} tutorial</p>
      <div className="grid gap-2">
        <label htmlFor={`${idBase}-title`} className="label">
          Title
        </label>
        <input
          id={`${idBase}-title`}
          className="alba-field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors["title"]}
        />
        {errors["title"] ? (
          <p role="alert" className="text-sm font-bold">
            {errors["title"]}
          </p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <label htmlFor={`${idBase}-url`} className="label">
          YouTube link
        </label>
        <input
          id={`${idBase}-url`}
          type="url"
          className="alba-field"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-invalid={!!errors["youtubeUrl"]}
          aria-describedby={`${idBase}-help`}
        />
        <p id={`${idBase}-help`} className="text-sm">
          Paste a YouTube link. Iframe code is not accepted.
        </p>
        {errors["youtubeUrl"] ? (
          <p role="alert" className="text-sm font-bold">
            {errors["youtubeUrl"]}
          </p>
        ) : null}
      </div>
      <label className="flex min-h-11 items-center gap-3 font-bold">
        <input
          type="checkbox"
          className="size-5"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Published
      </label>
      <label className="flex min-h-11 items-center gap-3 font-bold">
        <input
          type="checkbox"
          className="size-5"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active for this language
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <AlbaButton type="submit" size="lg" disabled={state.kind === "saving"}>
          Save tutorial
        </AlbaButton>
        <SaveStatus state={state} />
      </div>
    </form>
  );
}
