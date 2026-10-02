import test from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, CITIES } from './mock-data';
import { mapLegacyReferenceId, normalizeReferenceLookup } from './data';

test('maps legacy mock category ids to their database slug', () => {
  assert.equal(mapLegacyReferenceId('cat-4', CATEGORIES), 'professional-services');
});

test('maps legacy mock city ids to their database slug', () => {
  assert.equal(mapLegacyReferenceId('city-1', CITIES), 'enugu-city');
});

test('rejects malformed reference lookup values before querying', () => {
  assert.equal(normalizeReferenceLookup('security;drop table users;--'), undefined);
  assert.equal(normalizeReferenceLookup(' valid-slug '), 'valid-slug');
  assert.equal(normalizeReferenceLookup('Baker & Sons'), 'Baker & Sons');
});
