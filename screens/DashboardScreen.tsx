import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { Text, useTheme, Button, Chip } from 'react-native-paper';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/lib/AuthContext';
import { getSharedAccounts } from '@/lib/api';
import { logger } from '@/lib/logger';
import { TabParamList } from '@/lib/navigation';
import { CustomCard, ScreenHeader, CustomButton } from '@/components';

interface Account {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
}

const MODULE = 'DashboardScreen';

type Props = BottomTabScreenProps<TabParamList, 'DashboardTab'>;

const DashboardScreen: React.FC<Props> = () => {
  const { logout, user } = useAuth();
  const navigation = useNavigation<BottomTabScreenProps<TabParamList, 'DashboardTab'>['navigation']>();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isWebLayout = width > 768;
  const cardWidth = isWebLayout ? '48%' : '100%';

  useEffect(() => {
    loadAccounts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadAccounts();
    }, [])
  );

  const loadAccounts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await getSharedAccounts();

      let accountList: Account[] = [];
      if (Array.isArray(data)) {
        accountList = data;
      } else if ((data as Record<string, unknown>).accounts && Array.isArray((data as Record<string, unknown>).accounts)) {
        accountList = (data as Record<string, unknown>).accounts as Account[];
      } else if ((data as Record<string, unknown>).data && Array.isArray((data as Record<string, unknown>).data)) {
        accountList = (data as Record<string, unknown>).data as Account[];
      } else if ((data as Record<string, unknown>).shared_accounts && Array.isArray((data as Record<string, unknown>).shared_accounts)) {
        accountList = (data as Record<string, unknown>).shared_accounts as Account[];
      } else if ((data as Record<string, unknown>)[0]) {
        accountList = Object.values(data as Record<string, unknown>) as Account[];
      }

      setAccounts(accountList);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[DashboardScreen] ❌ Error:', err.message, error);
      await logger.error(MODULE, 'Impossible de charger les comptes', err);
      Alert.alert('Erreur', 'Impossible de charger les comptes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      await logger.info(MODULE, 'Déconnexion réussie');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await logger.error(MODULE, 'Erreur lors de la déconnexion', err);
      Alert.alert('Erreur', 'Erreur lors de la déconnexion');
    }
  };

  const handleCreateAccount = (): void => {
    (navigation as any).getParent()?.navigate('CreateAccount');
  };

  const handleAccountDetail = (id: string): void => {
    const parent = (navigation as any).getParent?.();
    parent?.navigate('AccountDetail', { id });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <ScreenHeader
        gradient="dashboard"
        title={`Tableau de bord${'\n'}${user?.firstName}`}
        subtitle="Bienvenue 👋"
        rightContent={
          <CustomButton
            label="Déconnexion"
            onPress={handleLogout}
            variant="danger"
            fullWidth={false}
            icon={<MaterialCommunityIcons name="logout" size={16} color="#fff" />}
          />
        }
      />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: isWebLayout ? 32 : 16, paddingVertical: 24 }}
      >
          <Chip
            icon="piggy-bank"
            style={{ backgroundColor: theme.colors.primaryContainer }}
          >
            {accounts.length} comptes actifs
          </Chip>
          <Chip
            icon="currency-usd"
            style={{ backgroundColor: theme.colors.secondaryContainer }}
          >
            {accounts.reduce((sum, acc) => sum + acc.currentAmount, 0).toFixed(0)} €
          </Chip>

        {/* Header Actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
            💰 Vos comptes
          </Text>
          <CustomButton
            label="Créer"
            onPress={handleCreateAccount}
            variant="secondary"
            fullWidth={false}
            icon={<MaterialCommunityIcons name="plus" size={16} color="#fff" />}
          />
        </View>

        {/* Accounts List */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : accounts.length === 0 ? (
          <CustomCard style={{ backgroundColor: theme.colors.tertiaryContainer, borderWidth: 0 }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 24 }}>
              <Text variant="headlineSmall" style={{ color: theme.colors.tertiary, marginBottom: 8 }}>
                📭 Aucun compte
              </Text>
              <Text style={{ color: theme.colors.onSurface, textAlign: 'center', marginBottom: 16 }}>
                Commencez par créer votre premier compte d'épargne
              </Text>
              <CustomButton
                label="Créer un compte"
                onPress={handleCreateAccount}
                variant="tertiary"
              />
            </View>
          </CustomCard>
        ) : (
          <View style={{ flexDirection: isWebLayout ? 'row' : 'column', flexWrap: 'wrap', gap: 16 }}>
            {accounts.map((account) => {
              const progress = Math.min((account.currentAmount / account.targetAmount) * 100, 100);
              return (
                <CustomCard
                  key={account.id}
                  onPress={() => handleAccountDetail(account.id)}
                  style={{ width: cardWidth }}
                  elevated={true}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleLarge" style={{ fontWeight: '700', color: theme.colors.primary, marginBottom: 4 }}>
                        {account.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {account.description}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="cash-multiple" size={28} color={theme.colors.tertiary} />
                  </View>

                  {/* Progress Bar */}
                  <View style={{ marginVertical: 12 }}>
                    <View style={{
                      height: 6,
                      backgroundColor: theme.colors.surfaceVariant,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <View
                        style={{
                          height: '100%',
                          backgroundColor: theme.colors.primary,
                          width: `${progress}%`,
                        }}
                      />
                    </View>
                    <Text variant="labelSmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                      {account.currentAmount.toFixed(0)} / {account.targetAmount.toFixed(0)} {account.currency}
                    </Text>
                  </View>

                  <Text variant="bodySmall" style={{ color: theme.colors.secondary, fontWeight: '600' }}>
                    Progression: {progress.toFixed(0)}%
                  </Text>
                </CustomCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

