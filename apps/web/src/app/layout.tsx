import type { Metadata } from "next";
import Script from "next/script";
import { M_PLUS_Rounded_1c } from "next/font/google";
import localFont from "next/font/local";
import "../index.css";
import Providers from "@/components/providers";

const mPlusRounded = M_PLUS_Rounded_1c({
  variable: "--font-mPlusRounded",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["100", "300", "400", "500", "700", "800", "900"],
});

const sfProRounded = localFont({
  variable: "--font-sf-pro-rounded",
  src: [
    {
      path: "../../public/fonts/SF_Pro_Rounded/SF-Pro-Rounded-Ultralight.otf",
      weight: "100",
    },
    {
      path: "../../public/fonts/SF_Pro_Rounded/SF-Pro-Rounded-Thin.otf",
      weight: "200",
    },
    {
      path: "../../public/fonts/SF_Pro_Rounded/SF-Pro-Rounded-Light.otf",
      weight: "300",
    },
    {
      path: "../../public/fonts/SF_Pro_Rounded/SF-Pro-Rounded-Regular.otf",
      weight: "400",
    },
    {
      path: "../../public/fonts/SF_Pro_Rounded/SF-Pro-Rounded-Medium.otf",
      weight: "500",
    },
    {
      path: "../../public/fonts/SF_Pro_Rounded/SF-Pro-Rounded-Semibold.otf",
      weight: "600",
    },
    {
      path: "../../public/fonts/SF_Pro_Rounded/SF-Pro-Rounded-Bold.otf",
      weight: "700",
    },
    {
      path: "../../public/fonts/SF_Pro_Rounded/SF-Pro-Rounded-Heavy.otf",
      weight: "800",
    },
    {
      path: "../../public/fonts/SF_Pro_Rounded/SF-Pro-Rounded-Black.otf",
      weight: "900",
    },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "benkyou",
  description: "benkyou",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <>
            <Script
              src="//unpkg.com/react-grab/dist/index.global.js"
              strategy="beforeInteractive"
            />
            <Script
              src="//unpkg.com/@react-grab/cursor/dist/client.global.js"
              strategy="lazyOnload"
            />
          </>
        )}
      </head>
      <body
        className={`${mPlusRounded.variable} ${sfProRounded.variable} font-sf-pro-rounded antialiased`}
      >
        <Providers>
          <div className="flex flex-col h-svh min-h-0 isolate">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
