import { StackSpread } from "@/registry/components/stack-spread"

/**
 * No height wrapper here on purpose: the cards are positioned in vw/vh, so the
 * component has to own the viewport. The preview frame is already its own
 * viewport, and constraining it inside a scroll box puts every card off-screen.
 */
export default function DemoStackSpread() {
  return <StackSpread scrollLength={300} />
}
