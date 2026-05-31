import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "NEXWAVE | The Next Generation of Creatives",
  description:
    "A cinematic creative collective for emerging creators, actors, filmmakers, storytellers and visionaries.",
  openGraph: {
    title: "NEXWAVE",
    description: "The next generation of creatives.",
    images: ["/nexwave-logo.svg"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
