import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

interface CustomCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
}

/**
 * Composant Card réutilisable avec style cohérent
 */
export const CustomCard: React.FC<CustomCardProps> = ({
  children,
  style,
  onPress,
  elevated = false,
}) => {
  const theme = useTheme();

  if (onPress) {
    return (
      <Card
        onPress={onPress}
        style={[
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            borderWidth: 1,
            borderRadius: 16,
            marginBottom: 12,
          },
          elevated && { elevation: 4, shadowOpacity: 0.08, shadowRadius: 10 },
          style,
        ]}
      >
        <Card.Content>{children}</Card.Content>
      </Card>
    );
  }

  return (
    <Card
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          borderWidth: 1,
          borderRadius: 16,
          marginBottom: 12,
        },
        elevated && { elevation: 4, shadowOpacity: 0.08, shadowRadius: 10 },
        style,
      ]}
    >
      <Card.Content>{children}</Card.Content>
    </Card>
  );
};

export default CustomCard;
