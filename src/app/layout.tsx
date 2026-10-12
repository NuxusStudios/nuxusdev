import type { Metadata } from "next"
import { headers } from "next/headers"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BookmarkProvider } from "@/components/site/bookmark-store"
import { CopyGateProvider } from "@/components/site/copy-gate"
import { BrandPreviewProvider } from "@/components/site/brand-preview-context"
import { getCurrentUser } from "@/server/session"
import { getBrandTheme } from "@/server/brand-theme"
import "./globals.css"
import { BRAND } from "@/lib/brand"
import { GA_MEASUREMENT_ID, analyticsEnabled } from "@/lib/analytics"

export const metadata: Metadata = {
  title: {
    default: `${BRAND.tagline} | ${BRAND.name}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined

  // only used to decide whether to offer "my theme" in the preview switcher
  const user = await getCurrentUser()
  const brandTheme = user ? await getBrandTheme(user.id) : null

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{var t=localStorage.getItem("theme")||"dark";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.classList.toggle("light",!d)}catch(e){}})()`,
          }}
        />

        {/*
          Google Analytics.

          Both tags carry the nonce. `script-src` is nonce-based with
          'strict-dynamic', so an un-nonced tag is refused outright and the
          loader's own injected scripts inherit trust from the nonced one —
          which is why no googletagmanager entry is needed in a modern browser,
          though proxy.ts names it anyway for those that ignore strict-dynamic.

          `connect-src` has to name the collection hosts separately. Without
          them gtag loads, runs, and every beacon is blocked — analytics that
          look installed and record nothing.
        */}
        {analyticsEnabled && (
          <>
            <script
              async
              nonce={nonce}
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <script
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen antialiased">
        <TooltipProvider delayDuration={200}>
          <CopyGateProvider>
            <BrandPreviewProvider hasBrandTheme={Boolean(brandTheme)}>
              <BookmarkProvider>{children}</BookmarkProvider>
            </BrandPreviewProvider>
          </CopyGateProvider>
        </TooltipProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.181 0.004 285.824)",
              border: "1px solid oklch(1 0 0 / 12%)",
              color: "oklch(0.968 0.001 286.375)",
            },
          }}
        />
      </body>
    </html>
  )
}
