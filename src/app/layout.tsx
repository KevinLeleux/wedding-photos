import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import { Providers } from "./providers";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galerie de Photos de Mariage",
  description: "Galerie de photos de mariage hébergée sur Cloudflare R2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body style={{ backgroundColor: "#f8f9fa" }}>
        <Providers>
          <MantineProvider
            theme={{
              primaryColor: "pink",
              fontFamily: "Inter, sans-serif",
            }}>
            {children}
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}
