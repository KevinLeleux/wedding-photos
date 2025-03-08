import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "Emilie et Kevin - 17.05.2025",
  description: "Emilie et Kevin se marient le 17.05.2025",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <SessionProvider>
          <SpeedInsights />
          <MantineProvider>{children}</MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
