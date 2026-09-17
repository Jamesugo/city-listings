// ============================================================
// All 36 Nigerian States + FCT Abuja — static reference data
// Alphabetically ordered. Used across the app for location pickers.
// ============================================================

export interface NigerianState {
  name: string;
  slug: string;
}

export const NIGERIAN_STATES: NigerianState[] = [
  { name: 'Abia', slug: 'abia' },
  { name: 'Adamawa', slug: 'adamawa' },
  { name: 'Akwa Ibom', slug: 'akwa-ibom' },
  { name: 'Anambra', slug: 'anambra' },
  { name: 'Bauchi', slug: 'bauchi' },
  { name: 'Bayelsa', slug: 'bayelsa' },
  { name: 'Benue', slug: 'benue' },
  { name: 'Borno', slug: 'borno' },
  { name: 'Cross River', slug: 'cross-river' },
  { name: 'Delta', slug: 'delta' },
  { name: 'Ebonyi', slug: 'ebonyi' },
  { name: 'Edo', slug: 'edo' },
  { name: 'Ekiti', slug: 'ekiti' },
  { name: 'Enugu', slug: 'enugu' },
  { name: 'FCT Abuja', slug: 'fct-abuja' },
  { name: 'Gombe', slug: 'gombe' },
  { name: 'Imo', slug: 'imo' },
  { name: 'Jigawa', slug: 'jigawa' },
  { name: 'Kaduna', slug: 'kaduna' },
  { name: 'Kano', slug: 'kano' },
  { name: 'Katsina', slug: 'katsina' },
  { name: 'Kebbi', slug: 'kebbi' },
  { name: 'Kogi', slug: 'kogi' },
  { name: 'Kwara', slug: 'kwara' },
  { name: 'Lagos', slug: 'lagos' },
  { name: 'Nasarawa', slug: 'nasarawa' },
  { name: 'Niger', slug: 'niger' },
  { name: 'Ogun', slug: 'ogun' },
  { name: 'Ondo', slug: 'ondo' },
  { name: 'Osun', slug: 'osun' },
  { name: 'Oyo', slug: 'oyo' },
  { name: 'Plateau', slug: 'plateau' },
  { name: 'Rivers', slug: 'rivers' },
  { name: 'Sokoto', slug: 'sokoto' },
  { name: 'Taraba', slug: 'taraba' },
  { name: 'Yobe', slug: 'yobe' },
  { name: 'Zamfara', slug: 'zamfara' },
];

/**
 * Group states by their first letter for alphabetical navigation.
 * Returns a Map of letter → states[].
 */
export function groupStatesByLetter(states: NigerianState[]): Map<string, NigerianState[]> {
  const groups = new Map<string, NigerianState[]>();
  for (const state of states) {
    const letter = state.name[0].toUpperCase();
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(state);
  }
  return groups;
}
