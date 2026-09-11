/**
 * Registry items that can't run in this project. Kept explicit so a re-import
 * doesn't silently reintroduce a broken preview.
 */
export const DENYLIST = {
  "magic-ui": [
    "globe",              // pinned cobe version has a different COBEOptions shape
    "tweet-card",         // react-tweet needs a server fetch we don't proxy
    "client-tweet-card",
    "code-comparison",    // imports an app route from the upstream project
  ],
  "kokonut-ui": [
    "social-button",      // lucide-react dropped its brand icons
  ],
}
