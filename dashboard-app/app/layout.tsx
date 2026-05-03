import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Timeless Hadith - Reader",
  description: "Your personal Hadith reading dashboard.",
};

const themeBootstrap = `
(function () {
  try {
    var saved = localStorage.getItem('th-theme');
    var theme = (saved === 'dark' || saved === 'light')
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}}
