import { MD3LightTheme } from 'react-native-paper';

/**
 * Thème personnalisé pour l'application Épargne Cochon
 * Couleurs cohérentes et professionnelles
 */
export const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primaire - Teal (épargne, confiance)
    primary: '#0f766e',
    primaryContainer: '#ccfbf1',

    // Secondaire - Menthe (actions positives)
    secondary: '#16a34a',
    secondaryContainer: '#dcfce7',

    // Tertiaire - Ambre doux (accents)
    tertiary: '#f59e0b',
    tertiaryContainer: '#fef3c7',

    // Backgrounds
    background: '#f8fafc',
    surface: '#ffffff',

    // État
    error: '#ef4444',
    errorContainer: '#fee2e2',

    // Textes
    onBackground: '#0f172a',
    onSurface: '#0f172a',
    onSurfaceVariant: '#64748b',
    onError: '#ffffff',

    // Surface variants
    surfaceVariant: '#eef2f7',

    // Outline (bordures)
    outline: '#e2e8f0',
    outlineVariant: '#f1f5f9',
  },
  // Variantes personnalisées
  customColors: {
    success: '#16a34a',
    warning: '#f59e0b',
    info: '#0ea5e9',

    // Gradients (utilisés dans certains écrans)
    dashboardGradient: { start: '#0f766e', end: '#14b8a6' },
    accountsGradient: { start: '#0f766e', end: '#22c55e' },
  }
};

export default appTheme;

