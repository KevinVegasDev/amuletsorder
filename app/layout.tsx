import type { Metadata, Viewport } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/Footer";
import { Providers } from "./providers";
import { getAnnouncementMessage } from "./lib/wordpress-api";

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "AmuletsOrder",
  description: "Store for Amulets",
  manifest: "/favicons/manifest.json",
  icons: {
    icon: [
      { url: "/favicons/favicon.ico" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/favicons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const announcementMessage = await getAnnouncementMessage();

  return (
    <html lang="en">
      <body className={`${robotoFlex.className} antialiased overflow-x-hidden m-0 p-0`}>
        <Providers>
          <Header announcementMessage={announcementMessage} />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
