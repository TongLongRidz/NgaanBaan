"use client";

import {
	ThemeProvider as NextThemesProvider,
	useTheme as useNextTheme,
} from "next-themes";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
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

function getInitialTheme(): Theme {
	if (typeof window !== "undefined") {
		const cookieMatch = document.cookie.match(/(?:^|; )theme=([^;]*)/);
		if (cookieMatch) {
			const cookieTheme = decodeURIComponent(cookieMatch[1]);
			if (cookieTheme === "dark" || cookieTheme === "light") {
				return cookieTheme as Theme;
			}
		}
		if (document.documentElement.classList.contains("dark")) {
			return "dark";
		}
	}
	return "light";
}

function InternalThemeProvider({
	children,
	initialTheme,
}: {
	children: React.ReactNode;
	initialTheme?: Theme;
}) {
	const {
		theme: nextTheme,
		setTheme: setNextTheme,
		resolvedTheme,
	} = useNextTheme();
	const [mounted, setMounted] = useState(false);
	const [currentTheme, setCurrentThemeState] = useState<Theme>(
		initialTheme || getInitialTheme,
	);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const active = (resolvedTheme || nextTheme) as Theme;
		if (active && (active === "dark" || active === "light")) {
			setCurrentThemeState(active);
		}
	}, [nextTheme, resolvedTheme]);

	const setTheme = (newTheme: Theme) => {
		setNextTheme(newTheme);
		if (typeof window !== "undefined") {
			document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
		}
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
			Math.max(y, window.innerHeight - y),
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
				},
			);
		});
	};

	const colors = themeConfig[currentTheme]?.colors || themeConfig.light.colors;

	return (
		<ThemeContext.Provider
			value={{ theme: currentTheme, toggleTheme, setTheme, colors }}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function ThemeProvider({
	children,
	initialTheme,
}: {
	children: React.ReactNode;
	initialTheme?: Theme;
}) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme={initialTheme || "light"}
			enableSystem={false}
			storageKey="theme"
			scriptProps={{ id: "next-theme-script" }}
		>
			<InternalThemeProvider initialTheme={initialTheme}>
				{children}
			</InternalThemeProvider>
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
