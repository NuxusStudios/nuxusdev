/**
 * Verifies every catalogue component has readable source and demo.
 *
 * readComponentSource falls back to a comment when the file isn't found, so a
 * mis-named previewKey doesn't throw — it silently sells someone a prompt
 * containing "// Source is not available." This catches that.
 *
 *   npm run registry:sources
 */
import { COMPONENTS } from "../src/lib/data/components"
import { readComponentSource, readDemoSource } from "../src/lib/source"
import { buildPrompt } from "../src/lib/prompt"

async function main() {
  const problems: string[] = []

  for (const component of COMPONENTS) {
    const [code, demo] = await Promise.all([
      readComponentSource(component.previewKey),
      readDemoSource(component.previewKey),
    ])

    if (code.startsWith("// Source for")) problems.push(`${component.id} ${component.slug}: no source`)
    if (demo.startsWith("// Demo for")) problems.push(`${component.id} ${component.slug}: no demo`)

    // the prompt is what people actually pay for, so check it builds and
    // carries the real code rather than an empty shell
    const prompt = buildPrompt({ component, code, demoCode: demo })
    if (prompt.length < 300) problems.push(`${component.id} ${component.slug}: prompt suspiciously short`)
    if (!prompt.includes("Version:")) problems.push(`${component.id} ${component.slug}: prompt missing version`)
    if (component.dependencies.length && !prompt.includes(component.dependencies[0])) {
      problems.push(`${component.id} ${component.slug}: prompt omits dependency ${component.dependencies[0]}`)
    }
  }

  console.log(`checked ${COMPONENTS.length} components`)

  if (problems.length) {
    console.log(`\nFAILED ${problems.length}:`)
    for (const problem of problems) console.log(`   ${problem}`)
    process.exit(1)
  }

  console.log("every component has source, a demo and a complete prompt")
}

void main()
