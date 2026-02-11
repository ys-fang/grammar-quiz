/**
 * Extract quiz data from scraped HTML files and produce normalized JSON.
 *
 * Usage: npx tsx scripts/extract-quiz-data.ts
 *
 * Reads: scraped/*.html (55 topic files + index.html)
 * Writes: public/data/topics/*.json + public/data/manifest.json
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { join, basename } from 'path'

const ROOT = join(import.meta.dirname, '..')
const SCRAPED_DIR = join(ROOT, 'scraped')
const DATA_DIR = join(ROOT, 'public', 'data')
const TOPICS_DIR = join(DATA_DIR, 'topics')

// Ensure output dirs exist
mkdirSync(TOPICS_DIR, { recursive: true })

// ── HTML entity decoder ───────────────────────────────────────────
function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

// ── Normalize a raw question to the unified format ────────────────
interface RawQ {
  q: string
  options: string[]
  a?: string
  correct?: number
  trans?: string
  translation?: string
  grammar?: string
  gram?: string
  ana?: string
  vocab?: string
  restore?: string
  orig?: string
}

interface NormalizedQ {
  q: string
  options: string[]
  correctAnswer: string
  correctIndex: number
  explanation: {
    translation: string
    grammar: string
    vocab?: string
    restore?: string
  }
}

function normalize(raw: RawQ): NormalizedQ {
  let correctAnswer: string
  let correctIndex: number

  if (raw.a !== undefined) {
    correctAnswer = raw.a
    correctIndex = raw.options.indexOf(raw.a)
  } else {
    correctIndex = raw.correct!
    correctAnswer = raw.options[correctIndex]
  }

  const translation = raw.translation ?? raw.trans ?? ''
  const grammar = raw.grammar ?? raw.gram ?? raw.ana ?? ''
  const restore = raw.restore ?? raw.orig

  const explanation: NormalizedQ['explanation'] = { translation, grammar }
  if (raw.vocab !== undefined) explanation.vocab = raw.vocab
  if (restore !== undefined) explanation.restore = restore

  return { q: raw.q, options: raw.options, correctAnswer, correctIndex, explanation }
}

// ── Extract data from a topic HTML file ───────────────────────────
function extractTopicData(html: string): {
  questions: NormalizedQ[]
  currentTopic: string
  gasUrl: string
} {
  // Decode HTML entities in script blocks
  const decoded = decodeHtmlEntities(html)

  // Extract CURRENT_TOPIC
  const topicMatch = decoded.match(/const\s+CURRENT_TOPIC\s*=\s*"([^"]+)"/)
  const currentTopic = topicMatch?.[1] ?? ''

  // Extract GAS_URL
  const gasMatch = decoded.match(/const\s+GAS_URL\s*=\s*"([^"]+)"/)
  const gasUrl = gasMatch?.[1] ?? ''

  // Extract fullQuizData array
  const dataMatch = decoded.match(/const\s+fullQuizData\s*=\s*(\[[\s\S]*?\n\s*\]);/)
  if (!dataMatch) {
    throw new Error('Could not find fullQuizData in HTML')
  }

  // Evaluate the array (it's valid JS)
  // We use Function constructor to safely evaluate the array literal
  const rawArray: RawQ[] = new Function(`return ${dataMatch[1]}`)()

  const questions = rawArray.map(normalize)

  return { questions, currentTopic, gasUrl }
}

// ── Extract category structure from index.html ────────────────────
interface CategoryGroup {
  categoryTitle: string
  topics: { name: string; slug: string }[]
}

function extractCategories(html: string): CategoryGroup[] {
  const decoded = decodeHtmlEntities(html)

  const dataMatch = decoded.match(/const\s+grammarData\s*=\s*(\[[\s\S]*?\n\s*\]);/)
  if (!dataMatch) {
    throw new Error('Could not find grammarData in index.html')
  }

  return new Function(`return ${dataMatch[1]}`)()
}

// ── Slug-to-filename mapping from scrape.mjs ──────────────────────
const PAGES = readdirSync(SCRAPED_DIR)
  .filter(f => f.endsWith('.html') && f !== 'index.html')
  .sort()

// Build slug→filename map from actual file names
// File format: "01-不定詞與v-ing.html" → topicId: "01-不定詞與v-ing"
function filenameToTopicId(filename: string): string {
  return basename(filename, '.html')
}

// ── Main ──────────────────────────────────────────────────────────
function main() {
  console.log(`Found ${PAGES.length} topic HTML files`)

  let gasUrl = ''
  const topicMap = new Map<string, string>() // slug → topicId

  // Process each topic file
  for (const file of PAGES) {
    const topicId = filenameToTopicId(file)
    const filepath = join(SCRAPED_DIR, file)
    const html = readFileSync(filepath, 'utf-8')

    try {
      const { questions, currentTopic, gasUrl: fileGasUrl } = extractTopicData(html)

      if (fileGasUrl && !gasUrl) gasUrl = fileGasUrl

      const topicData = {
        topicId,
        currentTopic,
        questions,
      }

      writeFileSync(
        join(TOPICS_DIR, `${topicId}.json`),
        JSON.stringify(topicData, null, 2),
        'utf-8'
      )

      console.log(`  ✓ ${topicId}: ${questions.length} questions`)
    } catch (err) {
      console.error(`  ✗ ${topicId}: ${(err as Error).message}`)
    }
  }

  // Process index.html for categories
  const indexHtml = readFileSync(join(SCRAPED_DIR, 'index.html'), 'utf-8')
  const categories = extractCategories(indexHtml)

  // Build slug→topicId mapping from filenames
  // The slug in index.html may be longer than the filename slug.
  // e.g., index slug: "集合名詞-people-family-class-team-police"
  //        filename:   "39-集合名詞"
  // Strategy: map both exact and prefix-based matches
  for (const file of PAGES) {
    const topicId = filenameToTopicId(file)
    const slugPart = topicId.replace(/^\d+-/, '')
    topicMap.set(slugPart, topicId)
  }

  // Helper: find topicId for an index slug (try exact, then prefix)
  function findTopicId(slug: string): string {
    if (topicMap.has(slug)) return topicMap.get(slug)!
    // Try prefix match: slug starts with a known filename slug
    for (const [key, val] of topicMap) {
      if (slug.startsWith(key)) return val
    }
    return ''
  }

  // Enrich categories with topicId
  const enrichedCategories = categories.map(cat => ({
    categoryTitle: cat.categoryTitle,
    topics: cat.topics.map(t => {
      // Try to find matching topicId
      const matched = findTopicId(t.slug)
      if (!matched) {
        console.warn(`  ⚠ No file match for slug: ${t.slug}`)
      }
      return { name: t.name, slug: t.slug, topicId: matched }
    }),
  }))

  // Write manifest
  const manifest = {
    gasUrl,
    categories: enrichedCategories,
  }

  writeFileSync(
    join(DATA_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  )

  console.log(`\n✓ manifest.json written with ${categories.length} categories`)
  console.log(`✓ ${PAGES.length} topic JSONs written`)
}

main()
