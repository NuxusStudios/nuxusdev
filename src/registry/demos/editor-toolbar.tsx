import {
  AlignCenter, AlignLeft, AlignRight, Bold, Italic, Link2, Underline,
} from "lucide-react"
import { Toolbar } from "@/registry/components/editor-toolbar"

const groups = [
  {
    id: "style",
    mode: "multiple" as const,
    items: [
      { id: "bold", label: "Bold", icon: <Bold className="size-4" /> },
      { id: "italic", label: "Italic", icon: <Italic className="size-4" /> },
      { id: "underline", label: "Underline", icon: <Underline className="size-4" /> },
    ],
  },
  {
    id: "align",
    mode: "single" as const,
    items: [
      { id: "left", label: "Align left", icon: <AlignLeft className="size-4" /> },
      { id: "center", label: "Align centre", icon: <AlignCenter className="size-4" /> },
      { id: "right", label: "Align right", icon: <AlignRight className="size-4" /> },
    ],
  },
  {
    id: "insert",
    mode: "multiple" as const,
    items: [{ id: "link", label: "Insert link", icon: <Link2 className="size-4" /> }],
  },
]

export default function DemoToolbar() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <Toolbar groups={groups} />
    </div>
  )
}
