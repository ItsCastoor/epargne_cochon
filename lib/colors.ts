/**
 * Génère une couleur HSL unique et déterministe basée sur un ID
 * La même ID produit toujours la même couleur
 */
export const generateColorFromId = (id: string): string => {
  // Créer un hash simple de l'ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash; // Convertir en int 32-bit
  }

  // Utiliser le hash pour générer HSL
  const hue = Math.abs(hash) % 360; // 0-360
  const saturation = 70; // 70% saturation pour des couleurs vives
  const lightness = 50; // 50% lightness pour une bonne visibilité

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Palette de couleurs prédéfinies pour les dégradés
 */
export const memberColors = [
  '#FF6B6B', // Rouge
  '#4ECDC4', // Turquoise
  '#45B7D1', // Bleu
  '#FFA07A', // Saumon
  '#98D8C8', // Menthe
  '#F7DC6F', // Jaune
  '#BB8FCE', // Violet
  '#85C1E2', // Bleu ciel
  '#F8B88B', // Pêche
  '#82E0AA', // Vert clair
];

