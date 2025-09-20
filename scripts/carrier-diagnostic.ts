import { findCarrierByName } from '../src/lib/carrier-system.ts';

const samples = [
  'Universal Fidelity Life Ins Co',
  'Bankers Fidelity Life Ins Co',
  'Members Hlth Ins Co',
  'Cigna Health and Life Insurance Company',
  'Central States H & L Co Of Omaha',
  'Mutual of Omaha',
];

for (const name of samples) {
  const match = findCarrierByName(name);
  console.log(name, '=>', match ? match.displayName + ' (' + match.id + ')' : 'NO MATCH');
}
