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
            marginBottom: 12,
          },
          elevated && { elevation: 4 },
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
          marginBottom: 12,
        },
        elevated && { elevation: 4 },
        style,
      ]}
    >
      <Card.Content>{children}</Card.Content>
    </Card>
  );
};

export default CustomCard;

