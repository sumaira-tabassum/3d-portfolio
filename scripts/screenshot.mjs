/**
 * Ad-hoc visual verification helper — not part of the app or its build.
 * Launches Chromium, waits for the frame preloader to finish (so we're
 * looking at the real rendered hero, not the loading screen), and saves a
 * screenshot for inspection.
 *
 * Usage: node scripts/screenshot.mjs [url] [outfile] [scrollFraction]
 */
import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:3001'
const outfile = process.argv[3] ?? 'screenshot.png'
const scrollFraction = Number(process.argv[4] ?? 0)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })

await page.goto(url, { waitUntil: 'networkidle' })

// Wait for the loading screen to fully dismiss (it removes itself from the
// DOM once every frame is preloaded).
await page.waitForSelector('[role="status"]', { state: 'detached', timeout: 60000 })

if (scrollFraction > 0) {
  await page.evaluate((frac) => {
    // Scroll relative to the canvas stage's own scrollable range, not the
    // whole page — that's what "progress" 0..1 means to the overlay/canvas.
    const stage = document.querySelector('.scroll-stage')
    const rect = stage.getBoundingClientRect()
    const stageTop = rect.top + window.scrollY
    const max = rect.height - window.innerHeight
    window.scrollTo(0, stageTop + max * frac)
  }, scrollFraction)
  await page.waitForTimeout(400) // let the canvas repaint at the new frame
}

await page.screenshot({ path: outfile })
await browser.close()

console.log(`Saved ${outfile}`)
