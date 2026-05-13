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
          paddingHorizontal: 20,
          paddingVertical: 24,
          paddingTop: 56,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 14,
          elevation: 6,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* Decorative background accents */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -30,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -80,
          left: -30,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          width: '100%',
        }}
      >
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          {subtitle && (
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                marginBottom: 10,
              }}
            >
              <Text
                variant="labelSmall"
                style={{
                  color: 'rgba(255, 255, 255, 0.92)',
                  letterSpacing: 0.4,
                }}
              >
                {subtitle}
              </Text>
            </View>
          )}
          <Text
            variant="headlineMedium"
            style={{
              color: '#fff',
              fontWeight: '800',
              letterSpacing: 0.2,
            }}
          >
            {title}
          </Text>
        </View>
        {rightContent && <View style={{ alignItems: 'flex-end' }}>{rightContent}</View>}
      </View>
    </View>
  );
};

export default ScreenHeader;

