import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, useWindowDimensions, ScrollView } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/lib/AuthContext';
import { getSharedAccounts } from '@/lib/api';
import { logger } from '@/lib/logger';
import { TabParamList } from '@/lib/navigation';
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const { width } = useWindowDimensions();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Déterminer si c'est web (large) ou mobile
  const isWebLayout = width > 768;
  const cardWidth = isWebLayout ? width * 0.4 : '100%';

  useEffect(() => {
    loadAccounts();
  }, []);

  // Recharger les comptes quand l'écran regagne le focus (après création/suppression d'un compte)
  useFocusEffect(
    React.useCallback(() => {
      loadAccounts();
    }, [])
  );

  const loadAccounts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await getSharedAccounts();

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

      // await logger.info(MODULE, 'Comptes chargés avec succès', { count: accountList.length });
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
    console.log('[DashboardScreen] Navigating to AccountDetail with id:', id);
    const token = AsyncStorage.getItem('token');
    console.log('[DashboardScreen] Token from AsyncStorage:', token);
    const parent = (navigation as any).getParent?.();
    console.log('[DashboardScreen] Parent navigator:', parent);
    parent?.navigate('AccountDetail', { id });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header coloré */}
      <View style={{
        backgroundColor: '#1e40af',
        paddingHorizontal: 24,
        paddingVertical: 32,
        paddingTop: 48,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ color: '#e0e7ff', fontSize: 14 }}>Bienvenue 👋</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>🚪 Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: isWebLayout ? 32 : 16, paddingVertical: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: isWebLayout ? 24 : 20, fontWeight: 'bold', color: '#000' }}>💰 Vos comptes</Text>
          <TouchableOpacity onPress={handleCreateAccount} style={{ backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>➕ Créer</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : accounts.length === 0 ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            backgroundColor: '#fef3c7',
            borderRadius: 12,
            paddingHorizontal: 24,
          }}>
            <Text style={{ color: '#92400e', fontSize: 16, textAlign: 'center' }}>
              📭 Aucun compte pour le moment\n\nCommencez en créant votre premier compte !
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
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e40af', marginBottom: 4 }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{item.description}</Text>
                  </View>
                  <Text style={{ fontSize: 24 }}>💎</Text>
                </View>

                {/* Mini progress */}
                <View style={{ marginTop: 12, backgroundColor: '#f3f4f6', height: 4, borderRadius: 2, overflow: 'hidden' }}>
                  <View
                    style={{
                      backgroundColor: '#2563eb',
                      height: '100%',
                      width: `${Math.min((item.currentAmount / item.targetAmount) * 100, 100)}%`,
                    }}
                  />
                </View>
                <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
                  {item.currentAmount.toFixed(0)} / {item.targetAmount.toFixed(0)} {item.currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

