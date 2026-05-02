import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, useWindowDimensions, ScrollView } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getSharedAccounts } from '@/lib/api';
import { logger } from '@/lib/logger';
import { TabParamList } from '@/lib/navigation';

interface Account {
  id: string;
  name: string;
  description: string;
  currency: string;
}

const MODULE = 'AccountsListScreen';

type Props = BottomTabScreenProps<TabParamList, 'AccountsTab'>;

const AccountsListScreen: React.FC<Props> = () => {
  const navigation = useNavigation<BottomTabScreenProps<TabParamList, 'AccountsTab'>['navigation']>();
  const { width } = useWindowDimensions();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isWebLayout = width > 768;

  useEffect(() => {
    loadAccounts();
  }, []);

  // Recharger les comptes quand l'écran regagne le focus (après création d'un compte)
  useFocusEffect(
    React.useCallback(() => {
      loadAccounts();
    }, [])
  );

  const loadAccounts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await getSharedAccounts();

      console.log('[AccountsListScreen] 📦 Data:', data.accounts);

      // Parser selon le format réel de l'API
      let accountList: Account[] = [];

      if (Array.isArray(data)) {
        accountList = data;
      } else if ((data as Record<string, unknown>).accounts && Array.isArray((data as Record<string, unknown>).accounts)) {
        // Format: { accounts: [...] }
        accountList = (data as Record<string, unknown>).accounts as Account[];
      } else if ((data as Record<string, unknown>).data && Array.isArray((data as Record<string, unknown>).data)) {
        // Format: { data: [...] }
        accountList = (data as Record<string, unknown>).data as Account[];
      } else if ((data as Record<string, unknown>)[0]) {
        // Si c'est un objet avec des clés numériques (format spécial)
        accountList = Object.values(data as Record<string, unknown>) as Account[];
      }
      console.log('[AccountsListScreen] 🔍 Liste Account:', accountList);

      setAccounts(accountList);
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
    console.log('[AccountsListScreen] Navigating to AccountDetail with id:', id);
    const parent = (navigation as any).getParent?.();
    console.log('[AccountsListScreen] Parent navigator:', parent);
    parent?.navigate('AccountDetail', { id });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#7c3aed',
        paddingHorizontal: 24,
        paddingVertical: 24,
        paddingTop: 48,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>💼 Mes comptes</Text>
          <TouchableOpacity
            onPress={handleCreateAccount}
            style={{ backgroundColor: '#06b6d4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>➕ Nouveau</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: isWebLayout ? 32 : 16, paddingVertical: 24 }}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <ActivityIndicator size="large" color="#7c3aed" />
          </View>
        ) : accounts.length === 0 ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 300,
            backgroundColor: '#ede9fe',
            borderRadius: 12,
            paddingHorizontal: 24,
          }}>
            <Text style={{ color: '#5b21b6', fontSize: 16, textAlign: 'center', fontWeight: '600' }}>
              📊 Aucun compte encore\n\nCréez votre premiere épargne !
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: isWebLayout ? 'row' : 'column', flexWrap: 'wrap', gap: 16 }}>
            {accounts.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleAccountDetail(item.id)}
                style={{
                  width: isWebLayout ? '48%' : '100%',
                  backgroundColor: '#fff',
                  borderWidth: 2,
                  borderColor: '#7c3aed',
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#7c3aed' }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {item.description}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 24 }}>💰</Text>
                </View>

                {/* Badge devise */}
                <View style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 12,
                  backgroundColor: '#f3e8ff',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: '#7c3aed',
                  }}>
                    💱 {item.currency}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AccountsListScreen;
