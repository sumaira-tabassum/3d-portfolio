/**
 * Single source of truth for brand + animation constants.
 *
 * TODO: replace AGENCY_NAME with the real studio name. It is referenced by the
 * navbar, the loading screen, and the page metadata — changing it here changes
 * it everywhere.
 */
export const AGENCY_NAME = 'STUDIO'

export const TAGLINE = 'Code, Perfected.'
export const SUB_TAGLINE = 'Software development & consulting. Built to last.'

/**
 * Number of frames in /public/frames. Verified from the source video's stts
 * atom: 302 samples at 30fps. Keep in sync with `npm run extract` output.
 */
export const FRAME_COUNT = 302

/** Viewport width below which we skip every 2nd frame (CLAUDE.md perf rules). */
export const MOBILE_BREAKPOINT = 768

/** Total scroll height of the sticky canvas section. */
export const SCROLL_HEIGHT_VH = 500

export const framePath = (index: number) =>
  `/frames/frame_${String(index).padStart(4, '0')}.avif`
