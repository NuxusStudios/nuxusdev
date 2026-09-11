export interface Post {
  slug: string
  title: string
  excerpt: string
  date: string
  authorHandle: string
  readingTime: string
  body: string[]
}

export const POSTS: Post[] = [
  {
    slug: "introducing-design-bug-bot",
    title: "Introducing Design Bug Bot",
    excerpt:
      "Code review caught your logic bugs years ago. Design bugs still ship. Bug Bot reviews the design of every pull request and hands you the fix.",
    date: "2026-08-19T09:00:00Z",
    authorHandle: "nova",
    readingTime: "5 min read",
    body: [
      "Every team has the same story. A pull request passes review, tests are green, and a week later someone notices the focus ring disappeared on the primary button — on the checkout page, on mobile, for keyboard users only.",
      "Design bugs are hard to catch in review because reviewing design means rendering the thing. Nobody checks out a branch to look at a button. So the checks that could be mechanical — is this on the spacing scale, does this pass contrast, is there a visible focus state — quietly never happen.",
      "Bug Bot renders every changed route at three breakpoints, compares what it sees to the tokens already in your repository, and comments with findings ranked by severity. Each finding carries a diff. You accept it or you don't.",
      "It is deliberately narrow. It does not have opinions about your visual language, it does not suggest a redesign, and it does not comment on files it could not render. When it has nothing to say it says nothing.",
      "Every paid plan gets five free successful reviews in the first week. After that it runs on AI credits, and a review costs about what a screenshot costs. Install it from the pricing page and open a pull request.",
    ],
  },
  {
    slug: "why-every-component-ships-as-a-prompt",
    title: "Why every component ships as a prompt",
    excerpt:
      "Copying code is a solved problem. Getting code to land correctly in someone else's codebase is not. That's what the prompt is for.",
    date: "2026-06-04T09:00:00Z",
    authorHandle: "kaito",
    readingTime: "4 min read",
    body: [
      "A component in a registry is not a package. It is a suggestion that has to survive contact with someone else's Tailwind config, someone else's tokens, and someone else's folder conventions.",
      "When you copy raw source you inherit all of that friction. The colours are hard-coded to the author's palette, the import paths assume their aliases, and the demo pulls in data you don't have.",
      "A prompt carries the same source plus the context needed to adapt it: where the files go, which helper it expects, which parts are safe to change. The tool on the other end does the adaptation, because that part was always mechanical.",
      "This is also why the prompt is generated rather than written. It is derived from the same source the preview renders, so it cannot drift from the component it describes.",
    ],
  },
  {
    slug: "the-case-for-live-previews",
    title: "The case for live previews",
    excerpt:
      "A screenshot tells you what a component looked like once, on someone else's machine. A live preview tells you what it does.",
    date: "2026-03-28T09:00:00Z",
    authorHandle: "lumen",
    readingTime: "3 min read",
    body: [
      "Static thumbnails are cheap and they lie. Half the components worth having are interactive: they respond to a cursor, they animate on scroll, they change under a keyboard.",
      "Rendering every card in its own sandboxed iframe costs more, but it means what you scroll past is the actual component, running, at a real breakpoint.",
      "It also keeps authors honest. A component that only looks good in a hand-cropped screenshot has nowhere to hide when the frame renders it live at 1200 pixels wide.",
    ],
  },
]

export const POST_MAP = new Map(POSTS.map((p) => [p.slug, p]))
