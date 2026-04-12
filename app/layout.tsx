import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "AmuletsOrder",
  description: "E-commerce store for Amulets",
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
