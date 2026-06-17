import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeGender,
  articleToGenderRO,
  cleanTranslation,
  toLessonWord,
} from './vocab-normalize.mjs';

const nounWith = (gender, nominative) => ({
  grammar_noun: {
    gender,
    declension: { singular: { forms: { nominative } } },
  },
});

test('normalizeGender keeps clean lowercase articles', () => {
  assert.equal(normalizeGender(nounWith('der', 'der Weg')), 'der');
  assert.equal(normalizeGender(nounWith('die', 'die Tür')), 'die');
  assert.equal(normalizeGender(nounWith('das', 'das Haus')), 'das');
});

test('normalizeGender lowercases capitalized articles', () => {
  assert.equal(normalizeGender(nounWith('Der', 'Der Weg')), 'der');
  assert.equal(normalizeGender(nounWith('Die', 'Die Tür')), 'die');
});

test('normalizeGender recovers gender from declension when field is junk', () => {
  assert.equal(normalizeGender(nounWith('Nominativ:', 'der Weg')), 'der');
  assert.equal(normalizeGender(nounWith('Sg:', 'die Wege')), 'die');
});

test('normalizeGender returns null when unrecoverable', () => {
  assert.equal(normalizeGender(nounWith('der/die', 'foo bar')), null);
  assert.equal(normalizeGender({}), null);
  assert.equal(normalizeGender({ grammar_noun: null }), null);
});

test('articleToGenderRO maps articles to Romanian gender labels', () => {
  assert.equal(articleToGenderRO('der'), 'Masculin');
  assert.equal(articleToGenderRO('die'), 'Feminin');
  assert.equal(articleToGenderRO('das'), 'Neutru');
  assert.equal(articleToGenderRO('xxx'), null);
});

test('cleanTranslation prefers academic_ro, falls back to academic_en', () => {
  assert.equal(cleanTranslation({ academic_ro: 'masă', academic_en: 'table' }), 'masă');
  assert.equal(cleanTranslation({ academic_ro: '  ', academic_en: 'table' }), 'table');
  assert.equal(cleanTranslation({ academic_ro: '', academic_en: '' }), null);
});

test('toLessonWord builds a complete lesson word for a usable noun', () => {
  const entry = {
    word: 'Weg',
    rank: 42,
    ipa: 'veːk',
    academic_ro: 'drum',
    academic_en: 'way',
    grammar_noun: { gender: 'der', declension: { singular: { forms: { nominative: 'der Weg' } } } },
  };
  assert.deepEqual(toLessonWord(entry, 100042), {
    id: 100042,
    german: 'Weg',
    article: 'der',
    translation: 'drum',
    gender: 'Masculin',
    rank: 42,
    ipa: 'veːk',
  });
});

test('toLessonWord returns null for entries without usable gender', () => {
  assert.equal(toLessonWord({ word: 'laufen', rank: 5, grammar_noun: null }, 100005), null);
});

test('toLessonWord returns null when translation is missing', () => {
  const entry = {
    word: 'Weg', rank: 42, ipa: '',
    academic_ro: '', academic_en: '',
    grammar_noun: { gender: 'der', declension: { singular: { forms: { nominative: 'der Weg' } } } },
  };
  assert.equal(toLessonWord(entry, 100042), null);
});
