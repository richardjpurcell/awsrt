// frontend/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import NavClient from "./nav.client";

export const metadata = {
  title: "AWSRT",
  description: "Adaptive Wildfire Sensing Research Tool (v0)",
  icons: {
    icon: "/favicon-32x32.png",         // expects public/icon.png
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavClient />
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
