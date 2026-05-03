import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Timeless Hadith — Reader",
  description:
    "Your personal Hadith reading dashboard — track progress, bookmarks, notes, and personalised recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
