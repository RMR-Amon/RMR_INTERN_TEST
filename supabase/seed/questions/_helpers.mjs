/**
 * Helpers for authoring the multilingual question bank.
 *
 * t(uz, ru, en)  → localized text object
 * same(text)     → text identical in all languages (code, tag names...)
 * q({...})       → question definition
 */

/** @typedef {{ uz: string, ru: string, en: string }} Localized */

/** @returns {Localized} */
export const t = (uz, ru, en) => ({ uz, ru, en })

/** @returns {Localized} */
export const same = (text) => ({ uz: text, ru: text, en: text })

/**
 * @param {{
 *   id: string,
 *   tech: string,
 *   diff: 'easy' | 'medium' | 'hard',
 *   q: Localized,
 *   code?: string,
 *   o: (Localized | string)[],
 *   a: 0 | 1 | 2 | 3,
 *   e: Localized,
 * }} def
 */
export const q = (def) => {
  if (def.o.length !== 4) throw new Error(`${def.id}: exactly 4 options required`)
  return {
    ...def,
    o: def.o.map((opt) => (typeof opt === 'string' ? same(opt) : opt)),
  }
}
