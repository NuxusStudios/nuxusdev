"use client"

import { Book, ChevronRight, FileText, Hash, Search } from "lucide-react"
import { FileTree, type TreeNode } from "@/registry/components/file-tree"
import { StatusBadge } from "@/registry/components/status-badge"

const nodes: TreeNode[] = [
  { type: "folder", name: "Getting started", defaultOpen: true, children: [
    { type: "file", name: "Installation" },
    { type: "file", name: "Quick start" },
    { type: "file", name: "Project structure" },
  ]},
  { type: "folder", name: "Guides", defaultOpen: true, children: [
    { type: "file", name: "Authentication" },
    { type: "file", name: "Data fetching" },
    { type: "file", name: "Deployment" },
  ]},
  { type: "folder", name: "API reference", children: [
    { type: "file", name: "Client" },
    { type: "file", name: "Server" },
  ]},
]

const onThisPage = ["Overview", "Install the package", "Configure the client", "Your first request", "Next steps"]

export default function DocsPortalTemplate() {
  return (
    <div className="flex min-h-[820px] bg-zinc-950 text-white">
      <aside className="hidden w-64 shrink-0 border-r border-white/10 p-5 lg:block">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">D</span>
          <span className="text-sm font-semibold">Docs</span>
        </div>
        <div className="mb-5 flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-[13px] text-white/30">
          <Search className="size-3.5" /> Search docs
          <kbd className="ml-auto rounded border border-white/10 px-1.5 text-[10px]">⌘K</kbd>
        </div>
        <FileTree nodes={nodes} className="border-0 bg-transparent p-0" />
      </aside>

      <main className="min-w-0 flex-1 px-8 py-10">
        <nav className="flex items-center gap-1.5 text-[13px] text-white/40">
          Guides <ChevronRight className="size-3.5" /> <span className="text-white/70">Authentication</span>
        </nav>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">Authentication</h1>
          <StatusBadge tone="beta" pulse={false} />
        </div>

        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/55">
          Add sign-in to your app in about ten minutes. This guide covers email and password,
          social providers, and how sessions are stored.
        </p>

        <div className="mt-8 flex gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-black">
            <Book className="size-4" /> Read the guide
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium">
            <FileText className="size-4" /> API reference
          </button>
        </div>

        <div className="mt-10 rounded-xl border border-white/10 bg-[#0b0b0e] p-4 font-mono text-[12.5px] leading-relaxed">
          <p className="text-white/35"># install</p>
          <p className="text-emerald-400">npm install @acme/auth</p>
          <p className="mt-3 text-white/35"># configure</p>
          <p className="text-sky-300">export const auth = createAuth({"{"} secret: process.env.SECRET {"}"})</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {["Email & password", "Social providers", "Sessions", "Middleware"].map((item) => (
            <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/25">
              <p className="text-sm font-medium">{item}</p>
              <p className="mt-1 text-[13px] text-white/45">Read more →</p>
            </div>
          ))}
        </div>
      </main>

      <aside className="hidden w-56 shrink-0 border-l border-white/10 p-6 xl:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">On this page</p>
        <ul className="mt-3 space-y-2">
          {onThisPage.map((item, i) => (
            <li key={item}>
              <span className={`flex items-start gap-1.5 text-[13px] ${i === 0 ? "text-white" : "text-white/45"}`}>
                <Hash className="mt-0.5 size-3 shrink-0 opacity-50" />
                {item}
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
