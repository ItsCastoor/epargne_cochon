import { MD3LightTheme } from 'react-native-paper';

/**
 * Thème personnalisé pour l'application Épargne Cochon
 * Couleurs cohérentes et professionnelles
 */
export const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primaire - Bleu (confiance, finance)
    primary: '#2563eb',
    primaryContainer: '#dbeafe',

    // Secondaire - Vert (épargne, croissance)
    secondary: '#059669',
    secondaryContainer: '#d1fae5',

    // Tertière - Violet (comptes, catégories)
    tertiary: '#7c3aed',
    tertiaryContainer: '#ede9fe',

    // Backgrounds
    background: '#f9fafb',
    surface: '#ffffff',

    // État
    error: '#dc2626',
    errorContainer: '#fee2e2',

    // Textes
    onBackground: '#1f2937',
    onSurface: '#1f2937',
    onSurfaceVariant: '#6b7280',
    onError: '#ffffff',
    
    // Surface variants
    surfaceVariant: '#f3f4f6',

    // Outline (bordures)
    outline: '#e5e7eb',
    outlineVariant: '#f3f4f6',
  },
  // Variantes personnalisées
  customColors: {
    success: '#059669',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Gradients (utilisés dans certains écrans)
    dashboardGradient: { start: '#1e40af', end: '#2563eb' },
    accountsGradient: { start: '#6d28d9', end: '#7c3aed' },
  }
};

export default appTheme;

