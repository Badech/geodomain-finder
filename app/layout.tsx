import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/index.css";

export const metadata: Metadata = {
  title: "Lovable App",
  description: "Lovable Generated Project",
  authors: [{ name: "Lovable" }],
  openGraph: {
    type: "website",
    title: "Lovable App",
    description: "Lovable Generated Project",
    images: [
      {
        url: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7c04f1d7-2c8e-4c91-a46b-d87e58d384f6/id-preview-82956a65--ff8c8eba-7267-48de-8360-350df2171582.lovable.app-1775324728964.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Lovable",
    title: "Lovable App",
    description: "Lovable Generated Project",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7c04f1d7-2c8e-4c91-a46b-d87e58d384f6/id-preview-82956a65--ff8c8eba-7267-48de-8360-350df2171582.lovable.app-1775324728964.png",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
