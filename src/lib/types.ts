export type TagGroup = "marketing" | "ui"

export interface Tag {
  slug: string
  name: string
  group: TagGroup
  count: number
  badge?: "new"
  /** some categories live on their own route (e.g. /community/shaders) */
  href?: string
}

export interface Author {
  handle: string
  name: string
  avatar?: string
  bio?: string
  website?: string
  twitter?: string
  github?: string
  componentCount: number
  followers: number
  location?: string
  pro?: boolean
}

export interface Library {
  slug: string
  name: string
  authorHandle: string
  description: string
  website?: string
  componentCount: number
  logoText?: string
  accent?: string
}

export interface ComponentRecord {
  id: string
  slug: string
  name: string
  description: string
  authorHandle: string
  librarySlug?: string
  tags: string[]
  /** key into the live preview registry */
  previewKey: string
  fileName: string
  demoFileName: string
  dependencies: string[]
  registryDependencies?: string[]
  license: string
  source?: string
  createdAt: string
  updatedAt?: string
  bookmarks: number
  views: number
  installs: number
  featured?: boolean
  previewBg?: "dark" | "light" | "grid" | "none"
  /** layout width of the preview iframe; smaller = component renders larger in the card */
  previewWidth?: number
  /** taller preview card in the grid */
  span?: "wide" | "tall" | "normal"
  /** pulled in from an upstream registry rather than authored here */
  imported?: boolean
}

export interface TemplateRecord {
  id: string
  slug: string
  name: string
  description: string
  authorHandle: string
  price: number
  tags: string[]
  previewKey: string
  pages: number
  bookmarks: number
  demoUrl?: string
}

export interface ThemeRecord {
  id: string
  slug: string
  name: string
  authorHandle: string
  description: string
  colors: { name: string; value: string }[]
  radius: string
  font: string
  bookmarks: number
  cssVars: Record<string, string>
}

export interface CollectionRecord {
  id: string
  name: string
  ownerHandle: string
  componentIds: string[]
  shared?: boolean
}
