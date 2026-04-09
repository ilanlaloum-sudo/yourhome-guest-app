// Correction map for service names stored without accents in DB
const ACCENT_MAP = {
  'Transfert aeroport': 'Transfert aéroport',
  'Courses avant arrivee': 'Courses avant arrivée',
  'Menage additionnel': 'Ménage additionnel',
  'Reservation restaurant': 'Réservation restaurant',
  'Massage a domicile': 'Massage à domicile',
  'Location vehicule': 'Location véhicule',
  'Chauffeur prive': 'Chauffeur privé',
  'Occasion speciale': 'Occasion spéciale',
}

export function fixAccents(text) {
  if (!text) return text
  return ACCENT_MAP[text] || text
}
