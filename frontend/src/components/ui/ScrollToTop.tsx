"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export function ScrollToTop() {
	const { t } = useLanguage();
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			const windowHeight = window.innerHeight;
			const fullHeight = document.documentElement.scrollHeight;
			const scrollTop = window.scrollY || document.documentElement.scrollTop;

			// Show button when user has scrolled near the bottom of the page (within 150px of the end)
			const isNearBottom = scrollTop + windowHeight >= fullHeight - 150;

			if (isNearBottom && scrollTop > 300) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		window.addEventListener("scroll", toggleVisibility, { passive: true });
		toggleVisibility();

		return () => {
			window.removeEventListener("scroll", toggleVisibility);
		};
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	if (!isVisible) return null;

	return (
		<button
			type="button"
			onClick={scrollToTop}
			className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)] hover:opacity-90 border border-[var(--card-border)] shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer animate-in fade-in slide-in-from-bottom-3"
			title={t("common.scroll_to_top") || "Scroll to Top"}
			aria-label="Scroll to Top"
		>
			<ArrowUp className="h-4 w-4 stroke-[2.5] text-[var(--primary-btn-text)]" />
		</button>
	);
}
