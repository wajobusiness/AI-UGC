import "./globals.css";
import { Providers } from "@/components/Providers";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "UGC Creator - Professional Content Studio",
  description: "Create stunning user-generated content with AI.",
};

export default function RootLayout({ children }) {
  const theme = 'light';

  return (
    <html lang="en" className="h-dvh w-full transition-colors duration-500" data-theme={theme}>
      <body className={`${inter.className} h-full w-full flex flex-col antialiased transition-colors duration-500`}>
        <Providers>
          <NavbarWrapper />
          <div className="flex-1 flex flex-col overflow-y-auto">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
