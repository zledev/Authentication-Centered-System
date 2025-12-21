import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "ACS",
	description: "A random project nobody cares about",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
