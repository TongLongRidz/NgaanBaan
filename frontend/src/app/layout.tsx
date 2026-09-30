import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider } from "@/hooks/useTheme";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
	subsets: ["thai", "latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-ibm-plex-sans-thai",
	display: "swap",
});

export const metadata: Metadata = {
	title: "NgaanBaan",
	description: "",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const themeCookie = cookieStore.get("theme")?.value;
	const initialTheme =
		themeCookie === "dark" || themeCookie === "light" ? themeCookie : "light";
	const langCookie = cookieStore.get("language")?.value;
	const initialLang =
		langCookie === "en" || langCookie === "th" ? langCookie : "th";

	return (
		<html
			lang={initialLang}
			className={initialTheme === "dark" ? "dark" : ""}
			suppressHydrationWarning
		>
			<body
				className={`${ibmPlexSansThai.variable} ${ibmPlexSansThai.className}`}
			>
				<ThemeProvider initialTheme={initialTheme}>
					<LanguageProvider initialLanguage={initialLang}>
						{children}
						<Toaster richColors position="bottom-right" />
					</LanguageProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
