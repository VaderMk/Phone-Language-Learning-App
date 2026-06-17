const ARTICLES = new Set(['der', 'die', 'das']);

const GENDER_RO = {
  der: 'Masculin',
  die: 'Feminin',
  das: 'Neutru',
};

/**
 * Resolve a noun's article ('der'|'die'|'das'), or null if unrecoverable.
 * 1) clean field, 2) lowercased capitalized field, 3) declension nominative prefix.
 */
export function normalizeGender(entry) {
  const noun = entry?.grammar_noun;
  if (!noun) return null;

  const raw = typeof noun.gender === 'string' ? noun.gender.trim().toLowerCase() : '';
  if (ARTICLES.has(raw)) return raw;

  const nom = noun?.declension?.singular?.forms?.nominative;
  if (typeof nom === 'string') {
    const first = nom.trim().toLowerCase().split(/\s+/)[0];
    if (ARTICLES.has(first)) return first;
  }
  return null;
}

export function articleToGenderRO(article) {
  return GENDER_RO[article] ?? null;
}

/** academic_ro, else academic_en, else null. */
export function cleanTranslation(entry) {
  const ro = typeof entry?.academic_ro === 'string' ? entry.academic_ro.trim() : '';
  if (ro) return ro;
  const en = typeof entry?.academic_en === 'string' ? entry.academic_en.trim() : '';
  if (en) return en;
  return null;
}

/** Build a LessonWord, or null if the entry is not a usable noun. */
export function toLessonWord(entry, id) {
  const article = normalizeGender(entry);
  if (!article) return null;
  const translation = cleanTranslation(entry);
  if (!translation) return null;
  return {
    id,
    german: entry.word,
    article,
    translation,
    gender: articleToGenderRO(article),
    rank: entry.rank,
    ipa: typeof entry.ipa === 'string' ? entry.ipa : '',
  };
}
