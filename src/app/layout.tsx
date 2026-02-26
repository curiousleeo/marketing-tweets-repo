import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Content Vault",
  description:
    "Real advice from real builders. Marketing wisdom and vibe coding insights, curated by the community. Filter, search, upvote.",
  keywords: [
    "marketing",
    "web3 marketing",
    "vibe coding",
    "AI tools",
    "prompting tips",
    "tweets",
    "instagram reels",
    "community",
    "personal branding",
    "copywriting",
    "growth",
    "content strategy",
  ],
  authors: [{ name: "The Content Vault" }],
  openGraph: {
    title: "The Content Vault",
    description: "Real advice from real builders. Marketing wisdom and vibe coding insights, curated by the community.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Content Vault",
    description: "Real advice from real builders. Marketing wisdom and vibe coding insights, curated by the community.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
