import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,

    // Language detection options
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },

    // Supported languages
    supportedLngs: ["en", "fr", "rw"],

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    // Default namespace
    defaultNS: "common",
    ns: ["common", "auth", "dashboard", "landing", "components"],

    react: {
      useSuspense: true,
    },
  });

export default i18n;
