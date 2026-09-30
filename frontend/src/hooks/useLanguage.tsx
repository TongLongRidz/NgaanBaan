"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import en from "../locales/en.json";
import th from "../locales/th.json";

type Language = "en" | "th";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (keyPath: string) => string;
}

const translationsMap: Record<Language, any> = {
  en,
  th
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window !== "undefined") {
    const cookieMatch = document.cookie.match(/(?:^|; )language=([^;]*)/);
    if (cookieMatch) {
      const cookieLang = decodeURIComponent(cookieMatch[1]);
      if (cookieLang === "en" || cookieLang === "th") {
        return cookieLang as Language;
      }
    }
    const savedLang = localStorage.getItem("language");
    if (savedLang === "en" || savedLang === "th") {
      return savedLang as Language;
    }
  }
  return "th";
}

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage?: Language }) {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguageState] = useState<Language>(initialLanguage || getInitialLanguage);

  useEffect(() => {
    setMounted(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && (e.newValue === "en" || e.newValue === "th")) {
        setLanguageState(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
      document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "th" : "en";
    setLanguage(nextLang);
  };

  // Support dot-notation keys like t("common.brand") or t("landing.hero_title_1")
  const t = (keyPath: string): string => {
    const keys = keyPath.split(".");
    let current: any = translationsMap[language];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return keyPath;
      }
    }

    return typeof current === "string" ? current : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
