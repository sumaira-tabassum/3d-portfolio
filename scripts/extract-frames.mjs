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

/**
 * AVIF (AV1 intra) replaces WebP here: at comparable/better visual quality it
 * ran ~2-3x smaller in testing (e.g. 40KB vs 104KB on the busiest burst
 * frame). PSNR against a lossless reference reads *worse* for AVIF (~37dB vs
 * WebP's ~42dB) but that number is misleading for this content — it's
 * measuring 4:2:0 chroma-subsampling loss against a full-chroma reference,
 * which direct visual inspection did not confirm as a real quality gap
 * (bright cyan bloom against near-black stayed sharp, no visible banding).
 * Trust the visual check over PSNR for this specific comparison.
 *
 * cpu-used trades encode time for compression efficiency; 5 was chosen after
 * comparing against 3 and 4 — quality/size were within noise of each other,
 * but cpu-used=5 encodes noticeably faster (~6.7s/frame here vs ~8.2s at
 * cpu-used=4). At 302 frames this is still a genuinely slow build step
 * (~30-40 min) — see the warning this script prints if it runs long.
 */
const CRF = 24
const CPU_USED = 5

/**
 * Crop off the bottom of the source before scaling. The source video bakes
 * in a "KlingAI 3.0 Omni" watermark in the bottom-right corner (measured at
 * y 93.6%-96.9% of frame height); this crop removes it deliberately and
 * reliably for every viewport shape. The bracket itself sits well above this
 * band — verified visually, only the tail of the floor reflection is lost.
 */
const CROP_BOTTOM_FRACTION = 0.08

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

// AVIF's dedicated muxer (selected via the .avif extension) writes correct
// MIAF/AVIF container boxes (pitm/iloc/iinf) that browsers require strictly.
// Forcing the generic `image2` muxer for a %04d sequence was tried first and
// produced files ffmpeg's own (lenient) demuxer could read back, but that
// every browser's native AVIF decoder rejected outright — verified directly
// with a live Image() load test. So each frame is extracted as its own
// ffmpeg invocation using the dedicated muxer, not one batched pass.
const FPS = 30
const startTime = Date.now()
console.log(`Extracting ${EXPECTED_FRAMES} frames with ffmpeg-static (AVIF, crf=${CRF}, cpu-used=${CPU_USED})...`)
console.log(`  ${ffmpegPath}`)
console.log(`  One ffmpeg invocation per frame (dedicated AVIF muxer) — expect ~20-30 minutes.\n`)

for (let i = 1; i <= EXPECTED_FRAMES; i++) {
  const timestamp = ((i - 1) / FPS).toFixed(5)
  const outFile = join(OUT_DIR, `frame_${String(i).padStart(4, '0')}.avif`)

  const args = [
    '-hide_banner',
    '-loglevel', 'error',
    '-ss', timestamp,
    '-i', SOURCE,
    '-vf', `crop=iw:ih*${1 - CROP_BOTTOM_FRACTION}:0:0,scale=1920:-2`,
    '-frames:v', '1',
    '-c:v', 'libaom-av1',
    '-crf', String(CRF),
    '-cpu-used', String(CPU_USED),
    '-still-picture', '1',
    '-an',
    '-y', outFile,
  ]

  const result = spawnSync(ffmpegPath, args)
  if (result.status !== 0) {
    console.error(`\nffmpeg failed on frame ${i}:`, result.stderr?.toString().slice(0, 500))
    process.exit(1)
  }

  if (i % 25 === 0 || i === EXPECTED_FRAMES) {
    const elapsedMin = (Date.now() - startTime) / 60000
    process.stdout.write(`  ${i}/${EXPECTED_FRAMES} frames (${elapsedMin.toFixed(1)} min elapsed)\r\n`)
  }
}

const elapsedMin = (Date.now() - startTime) / 60000
const files = readdirSync(OUT_DIR).filter((f) => f.endsWith('.avif'))
const totalBytes = files.reduce((sum, f) => sum + statSync(join(OUT_DIR, f)).size, 0)
const totalMB = totalBytes / 1024 / 1024

console.log('')
console.log(`  frames written : ${files.length}`)
console.log(`  total size     : ${totalMB.toFixed(1)} MB`)
console.log(`  average frame  : ${(totalBytes / files.length / 1024).toFixed(1)} KB`)
console.log(`  elapsed        : ${elapsedMin.toFixed(1)} min`)

if (files.length !== EXPECTED_FRAMES) {
  console.warn(
    `\n  WARNING: expected ${EXPECTED_FRAMES} frames, got ${files.length}.` +
      `\n  Update FRAME_COUNT in lib/site.ts to match.`
  )
}
if (totalMB > 30) {
  console.warn(
    `\n  WARNING: payload is ${totalMB.toFixed(1)} MB. Every byte is preloaded before` +
      `\n  the site renders. Raise CRF (lower quality) in this script and re-run.`
  )
}
if (elapsedMin > 30) {
  console.warn(`\n  NOTE: extraction took ${elapsedMin.toFixed(1)} min (flagged: over 30 min).`)
}
