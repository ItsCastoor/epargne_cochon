import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 32, paddingTop: 48 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 14 }}>Bienvenue</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: '#1d4ed8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>Vos comptes</Text>
          <TouchableOpacity onPress={handleCreateAccount} style={{ backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>+ Créer</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : accounts.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 16 }}>Aucun compte pour le moment</Text>
          </View>
        ) : (
           <FlatList
             data={accounts}
             keyExtractor={(item) => item.id}
             renderItem={({ item }) => (
               <TouchableOpacity onPress={() => handleAccountDetail(item.id)} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                 <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>{item.name}</Text>
                 <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{item.description}</Text>
               </TouchableOpacity>
             )}
           />
        )}
      </View>
    </View>
  );
};

export default DashboardScreen;

