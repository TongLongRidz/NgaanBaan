"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import themeConfig from "../locales/theme.json";

export type Theme = "light" | "dark";
export type ThemePalette = typeof themeConfig.light.colors;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
  setTheme: (theme: Theme) => void;
  colors: ThemePalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function InternalThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentThemeState] = useState<Theme>("light");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const active = (resolvedTheme || nextTheme) as Theme;
    if (active && (active === "dark" || active === "light")) {
      setCurrentThemeState(active);
    }
  }, [nextTheme, resolvedTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setNextTheme(newTheme);
  };

  const toggleTheme = (e?: React.MouseEvent) => {
    const targetTheme = currentTheme === "dark" ? "light" : "dark";

    if (
      typeof document === "undefined" ||
      !(document as any).startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(targetTheme);
      return;
    }

    const x = e?.clientX ?? window.innerWidth - 40;
    const y = e?.clientY ?? 40;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      setTheme(targetTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath,
        },
        {
          duration: 400,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const colors = themeConfig[currentTheme]?.colors || themeConfig.light.colors;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="theme"
    >
      <InternalThemeProvider>{children}</InternalThemeProvider>
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
