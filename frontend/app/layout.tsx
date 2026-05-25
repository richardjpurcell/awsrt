// frontend/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import NavClient from "./nav.client";

export const metadata = {
  title: "AWSRT — Adaptive Wildfire Sensing Research Tool",
  description:
    "A research tool for adaptive sensing, belief maintenance, information impairment, and usefulness under wildfire-like dynamic fields.",
  icons: {
    icon: "/favicon-32x32.png",
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
