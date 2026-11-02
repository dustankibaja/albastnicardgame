import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "sw";

/**
 * All user-facing copy lives here. Add a key to both `en` and `sw`.
 * Kiswahili strings added or changed in Phase 1 should get a native review.
 */
const dict = {
  en: {
    "nav.play": "Play",
    "nav.howto": "How to play",
    "nav.tournaments": "Tournaments",
    "nav.cards": "Physical cards",
    "nav.menu": "Open menu",
    "nav.closeMenu": "Close menu",
    "nav.primary": "Main",

    "lang.label": "Language",

    "brand.name": "Albastini",
    "brand.tagline": "INGIA UWANJANI. TUCHEZE.",

    "cta.app": "Download the app",
    "cta.appShort": "Get the app",
    "cta.cards": "Card availability",
    "cta.playApp": "Play on the app",

    "hero.eyebrow": "Albastini",
    "hero.title": "The game is on.",
    "hero.sub": "Play. Compete. Win. The Albastini card game — on your phone and on your table.",

    "game.eyebrow": "Two ways to play",
    "game.title": "Pick your table.",
    "game.app.tag": "Mobile app",
    "game.app.t": "The Albastini app",
    "game.app.b": "Play Albastini digitally wherever you are.",
    "game.phys.tag": "Physical cards",
    "game.phys.t": "Physical Albastini",
    "game.phys.b": "Bring the game to the table with physical Albastini cards.",

    "how.eyebrow": "How to play",
    "how.title": "Learn the game.",
    "how.body":
      "The official How to Play guide is inside the Albastini app. Download the app, then tap How to Play on the home screen.",

    "tour.eyebrow": "Tournaments",
    "tour.title": "Play for the win.",
    "tour.body": "Albastini tournaments bring players together to compete for the top spot.",
    "tour.next": "Next tournament",
    "tour.numbered": "Tournament #{n}",
    "tour.detailsSoon": "Start time and details coming soon.",
    "tour.none": "The next tournament will be announced soon.",
    "tour.live": "In progress now",
    "tour.ended": "This tournament has ended.",
    "tour.startsIn": "Starts in",
    "tour.days": "Days",
    "tour.hours": "Hours",
    "tour.minutes": "Minutes",
    "tour.seconds": "Seconds",
    "tour.timeTz": "{time} (Tanzania time)",
    "tour.mode.app": "In the Albastini app",
    "tour.mode.in_person": "In person",
    "tour.mode.hybrid": "In the app and in person",

    "win.eyebrow": "Winners",
    "win.title": "They played. They won.",
    "win.p1": "First place",
    "win.p2": "Second place",
    "win.p3": "Third place",
    "win.place": "Place {n}",
    "win.prize": "Prize",
    "win.location": "From",

    "phys.eyebrow": "Physical cards",
    "phys.title": "Take the game to the table.",
    "phys.body":
      "Physical Albastini cards are made for real tables, real friends and one more game.",
    "phys.status": "Card availability updates coming soon.",

    "form.title": "Get card updates",
    "form.closed": "Sign-up isn't open yet. It will open once updates can be sent to you.",
    "form.name": "Name",
    "form.phone": "Phone number",
    "form.email": "Email (optional)",
    "form.submit": "Notify me",
    "form.sending": "Sending…",
    "form.success": "You're on the list. We'll let you know when cards are available.",
    "form.failed": "Your details weren't saved. Try again.",
    "form.err.name": "Enter your name.",
    "form.err.phone": "Enter a phone number, for example 0712 345 678.",
    "form.err.email": "Enter a valid email address, or leave it empty.",

    "modal.title": "Choose your device",
    "modal.body": "Pick your platform to download Albastini from the official store.",
    "modal.ios": "Download for iOS",
    "modal.android": "Download for Android",
    "modal.close": "Close",

    "final.title": "Ready to play?",

    "footer.tagline": "The Tanzanian card game.",
    "footer.rights": "All rights reserved.",
  },
  sw: {
    "nav.play": "Cheza",
    "nav.howto": "Jinsi ya kucheza",
    "nav.tournaments": "Mashindano",
    "nav.cards": "Karata halisi",
    "nav.menu": "Fungua menyu",
    "nav.closeMenu": "Funga menyu",
    "nav.primary": "Kuu",

    "lang.label": "Lugha",

    "brand.name": "Albastini",
    "brand.tagline": "INGIA UWANJANI. TUCHEZE.",

    "cta.app": "Pakua app",
    "cta.appShort": "Pakua app",
    "cta.cards": "Upatikanaji wa karata",
    "cta.playApp": "Cheza kwenye app",

    "hero.eyebrow": "Albastini",
    "hero.title": "Mchezo umeanza.",
    "hero.sub": "Cheza. Shindana. Shinda. Mchezo wa karata Albastini — simuni na mezani.",

    "game.eyebrow": "Njia mbili za kucheza",
    "game.title": "Chagua meza yako.",
    "game.app.tag": "App ya simu",
    "game.app.t": "App ya Albastini",
    "game.app.b": "Cheza Albastini kidijitali ulipo popote.",
    "game.phys.tag": "Karata halisi",
    "game.phys.t": "Karata za Albastini",
    "game.phys.b": "Leta mchezo mezani na karata halisi za Albastini.",

    "how.eyebrow": "Jinsi ya kucheza",
    "how.title": "Jifunze mchezo.",
    "how.body":
      "Mwongozo rasmi wa jinsi ya kucheza uko ndani ya app ya Albastini. Pakua app, kisha bonyeza How to Play kwenye skrini ya mwanzo.",

    "tour.eyebrow": "Mashindano",
    "tour.title": "Cheza kwa ushindi.",
    "tour.body": "Mashindano ya Albastini yanawakutanisha wachezaji kushindania nafasi ya juu.",
    "tour.next": "Mashindano yajayo",
    "tour.numbered": "Mashindano #{n}",
    "tour.detailsSoon": "Muda wa kuanza na maelezo zaidi yatatangazwa hivi karibuni.",
    "tour.none": "Mashindano yajayo yatatangazwa hivi karibuni.",
    "tour.live": "Yanaendelea sasa",
    "tour.ended": "Mashindano haya yamekwisha.",
    "tour.startsIn": "Yanaanza baada ya",
    "tour.days": "Siku",
    "tour.hours": "Saa",
    "tour.minutes": "Dakika",
    "tour.seconds": "Sekunde",
    "tour.timeTz": "{time} (saa za Tanzania)",
    "tour.mode.app": "Ndani ya app ya Albastini",
    "tour.mode.in_person": "Ana kwa ana",
    "tour.mode.hybrid": "Kwenye app na ana kwa ana",

    "win.eyebrow": "Washindi",
    "win.title": "Walicheza. Walishinda.",
    "win.p1": "Nafasi ya kwanza",
    "win.p2": "Nafasi ya pili",
    "win.p3": "Nafasi ya tatu",
    "win.place": "Nafasi ya {n}",
    "win.prize": "Zawadi",
    "win.location": "Kutoka",

    "phys.eyebrow": "Karata halisi",
    "phys.title": "Leta mchezo mezani.",
    "phys.body":
      "Karata halisi za Albastini ni kwa ajili ya meza halisi, marafiki halisi na mchezo mmoja zaidi.",
    "phys.status": "Taarifa za upatikanaji wa karata zinakuja hivi karibuni.",

    "form.title": "Pata taarifa za karata",
    "form.closed":
      "Usajili bado haujafunguliwa. Utafunguliwa pindi tutakapoweza kukutumia taarifa.",
    "form.name": "Jina",
    "form.phone": "Namba ya simu",
    "form.email": "Barua pepe (si lazima)",
    "form.submit": "Nitaarifu",
    "form.sending": "Inatuma…",
    "form.success": "Umo kwenye orodha. Tutakujulisha karata zikipatikana.",
    "form.failed": "Taarifa zako hazijahifadhiwa. Jaribu tena.",
    "form.err.name": "Weka jina lako.",
    "form.err.phone": "Weka namba ya simu, kwa mfano 0712 345 678.",
    "form.err.email": "Weka barua pepe sahihi, au iache wazi.",

    "modal.title": "Chagua kifaa chako",
    "modal.body": "Chagua jukwaa lako ili kupakua Albastini kutoka kwenye duka rasmi.",
    "modal.ios": "Pakua kwa iOS",
    "modal.android": "Pakua kwa Android",
    "modal.close": "Funga",

    "final.title": "Uko tayari kucheza?",

    "footer.tagline": "Mchezo wa karata wa Tanzania.",
    "footer.rights": "Haki zote zimehifadhiwa.",
  },
} as const;

export type TKey = keyof (typeof dict)["en"];

type Vars = Record<string, string | number>;
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey, vars?: Vars) => string };

function interpolate(s: string, vars?: Vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

const LanguageContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k, vars) => interpolate(dict.en[k], vars),
});

const STORAGE_KEY = "albastini-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "sw") setLangState(saved);
    } catch {
      /* storage unavailable: keep English */
    }
  }, []);

  // Keep <html lang> in sync on load (saved preference) and on every change.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (k: TKey, vars?: Vars) => interpolate(dict[lang][k] ?? dict.en[k], vars),
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}
