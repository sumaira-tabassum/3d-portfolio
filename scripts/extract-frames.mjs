/**
 * Extract scroll-animation frames from the source video into /public/frames.
 *
 * Uses the `ffmpeg-static` dev dependency so no system-wide FFmpeg install is
 * required. Run with `npm run extract`.
 *
 * Source video verified as: 1924x1076, 30fps exactly, 302 frames, 10.067s.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ffmpegPath from 'ffmpeg-static'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, 'hero-animation.mp4')
const OUT_DIR = join(ROOT, 'public', 'frames')

/** Expected frame count, derived from the source video's stts atom (302 samples). */
const EXPECTED_FRAMES = 302

/** WebP quality. Lower this to ~72 if the total payload runs heavy. */
const QUALITY = 82

if (!ffmpegPath) {
  console.error('ffmpeg-static did not resolve a binary path for this platform.')
  process.exit(1)
}

if (!existsSync(SOURCE)) {
  console.error(`Source video not found: ${SOURCE}`)
  process.exit(1)
}

// Start clean so a re-run with different settings can never leave stale frames
// behind and silently inflate the count.
if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })

const args = [
  '-hide_banner',
  '-loglevel', 'error',
  '-stats',
  '-i', SOURCE,
  // 1924x1076 -> 1920x1074. `-2` keeps height even, which the encoder requires.
  '-vf', 'fps=30,scale=1920:-2',
  '-c:v', 'libwebp',
  '-quality', String(QUALITY),
  '-compression_level', '6',
  '-preset', 'picture',
  '-an',
  '-vsync', '0',
  join(OUT_DIR, 'frame_%04d.webp'),
]

console.log(`Extracting frames with ffmpeg-static...\n  ${ffmpegPath}\n`)

const result = spawnSync(ffmpegPath, args, { stdio: 'inherit' })

if (result.error) {
  console.error('Failed to run ffmpeg:', result.error.message)
  process.exit(1)
}
if (result.status !== 0) {
  console.error(`ffmpeg exited with code ${result.status}`)
  process.exit(result.status ?? 1)
}

const files = readdirSync(OUT_DIR).filter((f) => f.endsWith('.webp'))
const totalBytes = files.reduce((sum, f) => sum + statSync(join(OUT_DIR, f)).size, 0)
const totalMB = totalBytes / 1024 / 1024

console.log('')
console.log(`  frames written : ${files.length}`)
console.log(`  total size     : ${totalMB.toFixed(1)} MB`)
console.log(`  average frame  : ${(totalBytes / files.length / 1024).toFixed(1)} KB`)

if (files.length !== EXPECTED_FRAMES) {
  console.warn(
    `\n  WARNING: expected ${EXPECTED_FRAMES} frames, got ${files.length}.` +
      `\n  Update FRAME_COUNT in lib/site.ts to match.`
  )
}
if (totalMB > 30) {
  console.warn(
    `\n  WARNING: payload is ${totalMB.toFixed(1)} MB. Every byte is preloaded before` +
      `\n  the site renders. Lower QUALITY in this script and re-run.`
  )
}
