import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "@fontsource-variable/teko";
import "./globals.css";
import Header from "./components/header";

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-roboto-flex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AmuletsOrder",
  description: "E-commerce store for Amulets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${robotoFlex.variable} font-sans antialiased overflow-x-hidden m-0 p-0`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
