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
