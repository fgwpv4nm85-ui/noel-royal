import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AVAILABLE_LANGUAGES,
  getTranslation,
  resolveLanguage,
  TRANSLATIONS,
} from './i18n';
import { SYMBOL_ORDER } from './constants';

test('available languages include French, English, Spanish and additional European languages', () => {
  const codes = AVAILABLE_LANGUAGES.map((l) => l.code);
  assert.ok(codes.includes('fr'));
  assert.ok(codes.includes('en'));
  assert.ok(codes.includes('es'));
  assert.ok(codes.length >= 5);
});

test('resolveLanguage normalizes browser locales and defaults cleanly', () => {
  assert.equal(resolveLanguage('fr-FR'), 'fr');
  assert.equal(resolveLanguage('es-MX'), 'es');
  assert.equal(resolveLanguage('de'), 'de');
  assert.equal(resolveLanguage('IT-it'), 'it');
  assert.equal(resolveLanguage('pt-BR'), 'pt');
  assert.equal(resolveLanguage('ja-JP'), 'en');
  assert.equal(resolveLanguage(null), 'en');
});

test('every language provides complete translations and symbol labels', () => {
  const baseKeys = Object.keys(TRANSLATIONS.en);
  for (const lang of AVAILABLE_LANGUAGES) {
    const dict = getTranslation(lang.code);
    for (const key of baseKeys) {
      const value = dict[key as keyof typeof dict];
      assert.notEqual(value, undefined, `Missing key ${key} for ${lang.code}`);
      if (typeof value === 'string') {
        assert.ok(value.trim().length > 0, `Empty string for ${lang.code}.${key}`);
      }
    }
    for (const symId of SYMBOL_ORDER) {
      assert.ok(
        dict.symbols[symId] && dict.symbols[symId].trim().length > 0,
        `Missing symbol name ${symId} for ${lang.code}`,
      );
    }
  }
});
