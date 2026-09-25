// ============================================================
// All 36 Nigerian States + FCT Abuja — static reference data
// Alphabetically ordered. Used across the app for location pickers.
// ============================================================

export interface NigerianState {
  name: string;
  slug: string;
  cities: string[];
}

export const NIGERIAN_STATES: NigerianState[] = [
  { name: 'Abia', slug: 'abia', cities: ['Umuahia', 'Aba', 'Ohafia', 'Arochukwu'] },
  { name: 'Adamawa', slug: 'adamawa', cities: ['Yola', 'Mubi', 'Jimeta', 'Numan'] },
  { name: 'Akwa Ibom', slug: 'akwa-ibom', cities: ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron'] },
  { name: 'Anambra', slug: 'anambra', cities: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia'] },
  { name: 'Bauchi', slug: 'bauchi', cities: ['Bauchi', 'Azare', "Jama'are", 'Misau'] },
  { name: 'Bayelsa', slug: 'bayelsa', cities: ['Yenagoa', 'Brass', 'Ogbia', 'Sagbama'] },
  { name: 'Benue', slug: 'benue', cities: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala'] },
  { name: 'Borno', slug: 'borno', cities: ['Maiduguri', 'Bama', 'Biu', 'Dikwa'] },
  { name: 'Cross River', slug: 'cross-river', cities: ['Calabar', 'Ogoja', 'Ikom', 'Obudu'] },
  { name: 'Delta', slug: 'delta', cities: ['Asaba', 'Warri', 'Sapele', 'Ughelli'] },
  { name: 'Ebonyi', slug: 'ebonyi', cities: ['Abakaliki', 'Afikpo', 'Onueke', 'Ishieke'] },
  { name: 'Edo', slug: 'edo', cities: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi'] },
  { name: 'Ekiti', slug: 'ekiti', cities: ['Ado-Ekiti', 'Ikere-Ekiti', 'Ijero-Ekiti', 'Ilawe-Ekiti'] },
  { name: 'Enugu', slug: 'enugu', cities: ['Enugu', 'Nsukka', 'Awgu', 'Oji River', 'Agbani'] },
  { name: 'FCT Abuja', slug: 'fct-abuja', cities: ['Abuja', 'Gwagwalada', 'Kuje', 'Bwari', 'Kwali'] },
  { name: 'Gombe', slug: 'gombe', cities: ['Gombe', 'Kumo', 'Dukku', 'Billiri'] },
  { name: 'Imo', slug: 'imo', cities: ['Owerri', 'Orlu', 'Okigwe', 'Mbaise'] },
  { name: 'Jigawa', slug: 'jigawa', cities: ['Dutse', 'Hadejia', 'Gumel', 'Birnin Kudu'] },
  { name: 'Kaduna', slug: 'kaduna', cities: ['Kaduna', 'Zaria', 'Kafanchan', 'Kachia'] },
  { name: 'Kano', slug: 'kano', cities: ['Kano', 'Wudil', 'Gaya', 'Rano'] },
  { name: 'Katsina', slug: 'katsina', cities: ['Katsina', 'Funtua', 'Daura', 'Malumfashi'] },
  { name: 'Kebbi', slug: 'kebbi', cities: ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru'] },
  { name: 'Kogi', slug: 'kogi', cities: ['Lokoja', 'Okene', 'Idah', 'Anyigba'] },
  { name: 'Kwara', slug: 'kwara', cities: ['Ilorin', 'Offa', 'Jebba', 'Lafiagi'] },
  { name: 'Lagos', slug: 'lagos', cities: ['Ikeja', 'Lagos Island', 'Lekki', 'Epe', 'Badagry'] },
  { name: 'Nasarawa', slug: 'nasarawa', cities: ['Lafia', 'Keffi', 'Akwanga', 'Nasarawa'] },
  { name: 'Niger', slug: 'niger', cities: ['Minna', 'Suleja', 'Bida', 'Kontagora'] },
  { name: 'Ogun', slug: 'ogun', cities: ['Abeokuta', 'Ijebu-Ode', 'Sagamu', 'Ota'] },
  { name: 'Ondo', slug: 'ondo', cities: ['Akure', 'Ondo City', 'Owo', 'Ikare'] },
  { name: 'Osun', slug: 'osun', cities: ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede'] },
  { name: 'Oyo', slug: 'oyo', cities: ['Ibadan', 'Ogbomoso', 'Oyo', 'Iseyin'] },
  { name: 'Plateau', slug: 'plateau', cities: ['Jos', 'Bukuru', 'Pankshin', 'Shendam'] },
  { name: 'Rivers', slug: 'rivers', cities: ['Port Harcourt', 'Bonny', 'Okrika', 'Bori'] },
  { name: 'Sokoto', slug: 'sokoto', cities: ['Sokoto', 'Tambuwal', 'Wurno', 'Gwadabawa'] },
  { name: 'Taraba', slug: 'taraba', cities: ['Jalingo', 'Wukari', 'Bali', 'Gembu'] },
  { name: 'Yobe', slug: 'yobe', cities: ['Damaturu', 'Potiskum', 'Gashua', 'Nguru'] },
  { name: 'Zamfara', slug: 'zamfara', cities: ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Bungudu'] },
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
