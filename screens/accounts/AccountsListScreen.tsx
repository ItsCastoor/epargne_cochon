import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { Text, useTheme, Chip, FAB } from 'react-native-paper';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getSharedAccounts, getAccountMembers } from '@/lib/api';
import { logger } from '@/lib/logger';
import { TabParamList } from '@/lib/navigation';
import { CustomCard, ScreenHeader, CustomButton } from '@/components';

interface Account {
  id: string;
  name: string;
  description: string;
  currency: string;
  currentAmount?: number;
  targetAmount?: number;
  members?: Array<{ id: string }>;
  membersCount?: number;
  members_count?: number;
}

const MODULE = 'AccountsListScreen';
type Props = BottomTabScreenProps<TabParamList, 'AccountsTab'>;

const AccountsListScreen: React.FC<Props> = () => {
  const navigation = useNavigation<BottomTabScreenProps<TabParamList, 'AccountsTab'>['navigation']>();
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

      const accountsWithCounts = await Promise.all(
        accountList.map(async (account) => {
          try {
            const membersData = await getAccountMembers(account.id);
            let members: Array<{ id: string }> = [];

            if (Array.isArray(membersData)) {
              members = membersData as Array<{ id: string }>;
            } else if ((membersData as Record<string, unknown>).data && Array.isArray((membersData as Record<string, unknown>).data)) {
              members = (membersData as Record<string, unknown>).data as Array<{ id: string }>;
            } else if ((membersData as Record<string, unknown>).members && Array.isArray((membersData as Record<string, unknown>).members)) {
              members = (membersData as Record<string, unknown>).members as Array<{ id: string }>;
            } else if ((membersData as Record<string, unknown>)[0]) {
              members = Object.values(membersData as Record<string, unknown>) as Array<{ id: string }>;
            }

            return { ...account, membersCount: members.length };
          } catch {
            return account;
          }
        })
      );

      setAccounts(accountsWithCounts);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[AccountsListScreen] ❌ Error:', err.message, error);
      await logger.error(MODULE, 'Impossible de charger les comptes', err);
      Alert.alert('Erreur', 'Impossible de charger les comptes');
    } finally {
      setIsLoading(false);
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
        gradient="accounts"
        title="Mes comptes"
        subtitle="Gestion des épargnes"
        rightContent={
          <Chip
            icon="account-circle"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {accounts.length}
            </Text>
          </Chip>
        }
      />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: isWebLayout ? 32 : 16, paddingVertical: 24 }}
      >
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <ActivityIndicator size="large" color={theme.colors.tertiary} />
          </View>
        ) : accounts.length === 0 ? (
          <CustomCard style={{ backgroundColor: theme.colors.tertiaryContainer, borderWidth: 0 }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
              <MaterialCommunityIcons name="folder-open" size={48} color={theme.colors.tertiary} />
              <Text variant="headlineSmall" style={{ color: theme.colors.tertiary, marginTop: 16, marginBottom: 8, fontWeight: '700' }}>
                Aucun compte encore
              </Text>
              <Text style={{ color: theme.colors.onSurface, textAlign: 'center', marginBottom: 20 }}>
                Créez votre première épargne pour gérer vos finances en famille
              </Text>
              <CustomButton
                label="Créer mon premier compte"
                onPress={handleCreateAccount}
                variant="tertiary"
              />
            </View>
          </CustomCard>
        ) : (
          <View style={{ flexDirection: isWebLayout ? 'row' : 'column', flexWrap: 'wrap', gap: 16, marginBottom: 80 }}>
            {accounts.map((account) => (
              <CustomCard
                key={account.id}
                onPress={() => handleAccountDetail(account.id)}
                style={{
                  width: cardWidth,
                  borderLeftColor: 'transparent',
                  borderLeftWidth: 0,
                }}
                elevated={true}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                    gap: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.colors.tertiaryContainer,
                      }}
                    >
                      <MaterialCommunityIcons name="wallet" size={22} color={theme.colors.tertiary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        variant="titleMedium"
                        style={{
                          fontWeight: '700',
                          color: theme.colors.onBackground,
                          marginBottom: 4,
                        }}
                      >
                        {account.name}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{
                          color: theme.colors.onSurfaceVariant,
                        }}
                      >
                        {account.description}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                </View>

                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <Chip
                    icon="currency-eur"
                    style={{
                      backgroundColor: theme.colors.primaryContainer,
                    }}
                  >
                    <Text style={{ fontWeight: '600', color: theme.colors.primary }}>
                      {(account.currentAmount ?? 0).toFixed(0)} {account.currency}
                    </Text>
                  </Chip>
                  <Chip
                    icon="account-multiple"
                    style={{
                      backgroundColor: theme.colors.surfaceVariant,
                    }}
                  >
                    <Text style={{ fontWeight: '600', color: theme.colors.onSurfaceVariant }}>
                      {(() => {
                        const memberCount = account.members?.length ?? account.membersCount ?? account.members_count ?? 1;
                        return memberCount >= 2 ? 'Compte partagé' : 'Compte individuel';
                      })()}
                    </Text>
                  </Chip>
                </View>

                <View
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopColor: theme.colors.outline,
                    borderTopWidth: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    variant="labelSmall"
                    style={{
                      color: theme.colors.primary,
                      fontWeight: '600',
                    }}
                  >
                    Voir les details
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color={theme.colors.primary} />
                </View>
              </CustomCard>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB - Floating Action Button */}
      {!isLoading && (
        <FAB
          icon="plus"
          onPress={handleCreateAccount}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            backgroundColor: theme.colors.tertiary,
          }}
        />
      )}
    </View>
  );
};

export default AccountsListScreen;
