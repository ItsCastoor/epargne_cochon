import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Composant Button réutilisable avec variantes de couleurs
 */
export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
}) => {
  const theme = useTheme();

  const variantColors = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: '#fff',
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: '#fff',
    },
    tertiary: {
      backgroundColor: theme.colors.tertiary,
      color: '#fff',
    },
    danger: {
      backgroundColor: theme.colors.error,
      color: '#fff',
    },
  };

  const colors = variantColors[variant];
  const opacity = disabled || loading ? 0.6 : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        backgroundColor: colors.backgroundColor,
        opacity,
        width: fullWidth ? '100%' : 'auto',
        marginTop: 8,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.color} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={{
              color: colors.color,
              fontWeight: '600',
              fontSize: 16,
              marginLeft: icon ? 8 : 0,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
