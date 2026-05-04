import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type HeaderGradient = 'dashboard' | 'accounts' | 'notifications';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  gradient?: HeaderGradient;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Composant Header réutilisable avec gradients colorés
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  gradient = 'dashboard',
  rightContent,
  style,
}) => {
  const theme = useTheme();

  const gradientBg = {
    dashboard: theme.colors.primary,
    accounts: theme.colors.tertiary,
    notifications: '#f59e0b',
  };

  return (
    <View
      style={[
        {
          backgroundColor: gradientBg[gradient],
          paddingHorizontal: 24,
          paddingVertical: 24,
          paddingTop: 48,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1 }}>
          {subtitle && (
            <Text
              variant="bodySmall"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: 4,
              }}
            >
              {subtitle}
            </Text>
          )}
          <Text
            variant="headlineMedium"
            style={{
              color: '#fff',
              fontWeight: '700',
            }}
          >
            {title}
          </Text>
        </View>
        {rightContent && <>{rightContent}</>}
      </View>
    </View>
  );
};

export default ScreenHeader;

