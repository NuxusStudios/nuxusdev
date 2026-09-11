"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Palette } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useBrandPreview } from "@/components/site/brand-preview-context"
import { THEMES } from "@/lib/data/themes"
import { cn } from "@/lib/utils"

/**
 * Re-skins every preview on the page.
 *
 * The point of "My theme" is to answer the question a screenshot can't: what
 * does this component look like in the product I'm actually building?
 */
export function PreviewThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme, hasBrandTheme } = useBrandPreview()

  const active = theme === "mine" ? "My theme" : THEMES.find((t) => t.slug === theme)?.name

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2 text-muted-foreground hover:text-foreground", className)}
          aria-label="Preview theme"
        >
          <Palette className="size-4" />
          <span className="hidden sm:inline">{active ?? "Preview theme"}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="max-h-[70vh] w-56 overflow-y-auto">
        <DropdownMenuLabel>Render previews in</DropdownMenuLabel>

        <DropdownMenuItem onSelect={() => setTheme(null)}>
          <Check className={cn("size-4", theme !== null && "opacity-0")} />
          Site default
        </DropdownMenuItem>

        {hasBrandTheme ? (
          <DropdownMenuItem onSelect={() => setTheme("mine")}>
            <Check className={cn("size-4", theme !== "mine" && "opacity-0")} />
            My theme
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/settings#brand-theme">
              <Palette className="size-4" />
              Add my theme…
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Catalogue</DropdownMenuLabel>

        {THEMES.map((catalogue) => (
          <DropdownMenuItem key={catalogue.slug} onSelect={() => setTheme(catalogue.slug)}>
            <Check className={cn("size-4", theme !== catalogue.slug && "opacity-0")} />
            {catalogue.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
