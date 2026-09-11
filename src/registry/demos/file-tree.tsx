import { FileTree, type TreeNode } from "@/registry/components/file-tree"

const nodes: TreeNode[] = [
  {
    type: "folder",
    name: "src",
    defaultOpen: true,
    children: [
      {
        type: "folder",
        name: "components",
        defaultOpen: true,
        children: [
          { type: "folder", name: "ui", children: [{ type: "file", name: "button.tsx" }, { type: "file", name: "card.tsx" }] },
          { type: "file", name: "header.tsx" },
        ],
      },
      { type: "folder", name: "lib", children: [{ type: "file", name: "utils.ts" }] },
      { type: "file", name: "app.tsx" },
    ],
  },
  { type: "file", name: "package.json" },
  { type: "file", name: "tsconfig.json" },
]

export default function DemoFileTree() {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-8">
      <FileTree nodes={nodes} />
    </div>
  )
}
