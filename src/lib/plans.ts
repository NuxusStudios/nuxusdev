/**
 * Plan definitions, shared by the pricing page and the entitlement checks.
 * Pure data — no server imports — so the UI can describe plans it can't grant.
 */

export type PlanId = "free" | "builder" | "builder_ai" | "team" | "team_ai"

export interface Plan {
  id: PlanId
  name: string
  /** can copy source, prompts and CLI commands */
  canCopy: boolean
  /** can retrieve components through MCP / the CLI */
  canUseRegistryApi: boolean
  aiCredits: number
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    canCopy: false,
    canUseRegistryApi: false,
    aiCredits: 0,
  },
  builder: {
    id: "builder",
    name: "Builder",
    canCopy: true,
    canUseRegistryApi: true,
    aiCredits: 0,
  },
  builder_ai: {
    id: "builder_ai",
    name: "Builder + AI",
    canCopy: true,
    canUseRegistryApi: true,
    aiCredits: 500,
  },
  team: {
    id: "team",
    name: "Team Builder",
    canCopy: true,
    canUseRegistryApi: true,
    aiCredits: 0,
  },
  team_ai: {
    id: "team_ai",
    name: "Team Builder + AI",
    canCopy: true,
    canUseRegistryApi: true,
    aiCredits: 500,
  },
}

export const isPlanId = (value: string): value is PlanId => value in PLANS

/** What a signed-out or free visitor gets. */
export const FREE_PLAN = PLANS.free
