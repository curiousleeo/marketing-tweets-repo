import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://thecontent-vault.vercel.app"),
  title: {
    default: "The Content Vault",
    template: "%s | The Content Vault",
  },
  description:
    "Real advice from real builders. Marketing wisdom and vibe coding insights — curated by the community. Browse tweets and reels on content strategy, growth, AI tools, prompting, and more.",
  keywords: [
    "marketing",
    "web3 marketing",
    "crypto marketing",
    "vibe coding",
    "AI coding tools",
    "prompting tips",
    "cursor AI",
    "windsurf",
    "claude",
    "tweets",
    "instagram reels",
    "community",
    "personal branding",
    "copywriting",
    "growth",
    "content strategy",
    "community building",
    "developer productivity",
  ],
  authors: [{ name: "The Content Vault", url: "https://thecontent-vault.vercel.app" }],
  creator: "The Content Vault",
  openGraph: {
    title: "The Content Vault",
    description: "Real advice from real builders. Marketing wisdom and vibe coding insights, curated by the community.",
    type: "website",
    url: "https://thecontent-vault.vercel.app",
    siteName: "The Content Vault",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Content Vault",
    description: "Real advice from real builders. Marketing wisdom and vibe coding insights, curated by the community.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: "https://thecontent-vault.vercel.app",
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
