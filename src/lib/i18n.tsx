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
    "nav.home": "Albastini home",

    "lang.label": "Language",

    "brand.name": "Albastini",
    "brand.tagline": "INGIA UWANJANI. TUCHEZE.",

    "cta.app": "Download the app",
    "cta.appShort": "Get the app",
    "cta.cards": "Card availability",
    "cta.playApp": "Play on the app",

    "hero.title1": "Two ways",
    "hero.title2": "to play.",
    "hero.one": "One Albastini.",
    "hero.sub": "Cards around the table. Albastini on your phone.",
    "hero.physical": "Physical cards",
    "hero.digital": "Mobile app",

    "two.title1": "From the table.",
    "two.title2": "To the screen.",
    "two.tabs": "What Albastini feels like",
    "two.hint": "Choose a card",
    "two.play.t": "Play",
    "two.play.b":
      "Pick up the cards and you're in. Every round is a new chance — and someone always asks for one more game.",
    "two.friends.t": "Friendship",
    "two.friends.b":
      "Albastini brings people to the same table: jokes, rivalries and conversation between turns.",
    "two.compete.t": "Competition",
    "two.compete.b":
      "When friends aren't around, the app keeps the game going — and tournaments show who plays best.",
    "two.app": "The Albastini app on your phone",

    "how.title1": "Your next move",
    "how.title2": "starts here.",
    "how.body": "The official How to Play guide is inside the Albastini app.",
    "how.step1": "Download the Albastini app.",
    "how.step2": "Tap How to Play on the home screen.",
    "how.callout": "How to Play, on the app's home screen",

    "tour.title1": "Play for",
    "tour.title2": "the win.",
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

    "win.title1": "They played.",
    "win.title2": "They won.",
    "win.p1": "1st place",
    "win.p2": "2nd place",
    "win.p3": "3rd place",
    "win.place": "Place {n}",
    "win.prize": "Prize",
    "win.location": "From",

    "phys.title1": "Take the game",
    "phys.title2": "to the table.",
    "phys.body":
      "Physical Albastini cards are made for real tables, real friends and one more game.",
    "phys.status": "Card availability updates coming soon.",

    "form.toggle": "Get card updates",
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

    "final.title1": "Ready to",
    "final.title2": "play?",

    "footer.tagline": "The Tanzanian card game.",
    "footer.rights": "All rights reserved.",

    "alt.aceRed": "Red ace card from the Albastini deck",
    "alt.aceBlack": "Black ace card from the Albastini deck",
    "alt.aceBlue": "Blue ace card from the Albastini deck",
    "alt.app":
      "Albastini app home screen with Practice Mode, Head to Head, Tournament and How to Play",
    "alt.appHow": "Albastini app home screen, How to Play button highlighted",
    "alt.boxSafari": "Albastini Safari Edition card box",
    "alt.boxExpansion": "Albastini Safari Edition Expansion Pack box",
    "alt.david": "David Sanya, Albastini first-place winner",
    "alt.table": "Albastini cards spread across a wooden table",
    "alt.fronts": "Nine Albastini card fronts in different colours, laid out on white",
  },
  sw: {
    "nav.play": "Cheza",
    "nav.howto": "Jinsi ya kucheza",
    "nav.tournaments": "Mashindano",
    "nav.cards": "Karata halisi",
    "nav.menu": "Fungua menyu",
    "nav.closeMenu": "Funga menyu",
    "nav.primary": "Kuu",
    "nav.home": "Albastini mwanzo",

    "lang.label": "Lugha",

    "brand.name": "Albastini",
    "brand.tagline": "INGIA UWANJANI. TUCHEZE.",

    "cta.app": "Pakua app",
    "cta.appShort": "Pakua app",
    "cta.cards": "Upatikanaji wa karata",
    "cta.playApp": "Cheza kwenye app",

    "hero.title1": "Njia mbili",
    "hero.title2": "za kucheza.",
    "hero.one": "Albastini moja.",
    "hero.sub": "Karata mezani. Albastini simuni mwako.",
    "hero.physical": "Karata halisi",
    "hero.digital": "App ya simu",

    "two.title1": "Kutoka mezani.",
    "two.title2": "Hadi kwenye skrini.",
    "two.tabs": "Ladha ya Albastini",
    "two.hint": "Chagua karata",
    "two.play.t": "Cheza",
    "two.play.b":
      "Shika karata na uko ndani ya mchezo. Kila raundi ni nafasi mpya — na daima kuna mtu anayeomba mchezo mmoja zaidi.",
    "two.friends.t": "Urafiki",
    "two.friends.b":
      "Albastini inawaleta watu kwenye meza moja: utani, ushindani na mazungumzo kati ya zamu.",
    "two.compete.t": "Ushindani",
    "two.compete.b":
      "Marafiki wasipokuwepo, app inaendeleza mchezo — na mashindano yanaonyesha nani anacheza vizuri zaidi.",
    "two.app": "App ya Albastini kwenye simu yako",

    "how.title1": "Hatua yako inayofuata",
    "how.title2": "inaanzia hapa.",
    "how.body": "Mwongozo rasmi wa jinsi ya kucheza uko ndani ya app ya Albastini.",
    "how.step1": "Pakua app ya Albastini.",
    "how.step2": "Bonyeza How to Play kwenye skrini ya mwanzo.",
    "how.callout": "How to Play, kwenye skrini ya mwanzo ya app",

    "tour.title1": "Cheza kwa",
    "tour.title2": "ushindi.",
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

    "win.title1": "Walicheza.",
    "win.title2": "Walishinda.",
    "win.p1": "Nafasi ya kwanza",
    "win.p2": "Nafasi ya pili",
    "win.p3": "Nafasi ya tatu",
    "win.place": "Nafasi ya {n}",
    "win.prize": "Zawadi",
    "win.location": "Kutoka",

    "phys.title1": "Leta mchezo",
    "phys.title2": "mezani.",
    "phys.body":
      "Karata halisi za Albastini ni kwa ajili ya meza halisi, marafiki halisi na mchezo mmoja zaidi.",
    "phys.status": "Taarifa za upatikanaji wa karata zinakuja hivi karibuni.",

    "form.toggle": "Pata taarifa za karata",
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

    "final.title1": "Uko tayari",
    "final.title2": "kucheza?",

    "footer.tagline": "Mchezo wa karata wa Tanzania.",
    "footer.rights": "Haki zote zimehifadhiwa.",

    "alt.aceRed": "Karata ya ace nyekundu ya Albastini",
    "alt.aceBlack": "Karata ya ace nyeusi ya Albastini",
    "alt.aceBlue": "Karata ya ace ya bluu ya Albastini",
    "alt.app":
      "Skrini ya mwanzo ya app ya Albastini yenye Practice Mode, Head to Head, Tournament na How to Play",
    "alt.appHow": "Skrini ya mwanzo ya app ya Albastini, kitufe cha How to Play kimeangaziwa",
    "alt.boxSafari": "Boksi la karata la Albastini Safari Edition",
    "alt.boxExpansion": "Boksi la Albastini Safari Edition Expansion Pack",
    "alt.david": "David Sanya, mshindi wa nafasi ya kwanza wa Albastini",
    "alt.table": "Karata za Albastini zimetandazwa juu ya meza ya mbao",
    "alt.fronts":
      "Sura tisa za karata za Albastini za rangi tofauti, zimepangwa juu ya rangi nyeupe",
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
