import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { getSharedAccounts } from '@/lib/api';
import { logger } from '@/lib/logger';
import { AppStackParamList } from '@/lib/navigation';

interface Account {
  id: string;
  name: string;
  description: string;
  currency: string;
}

const MODULE = 'AccountsListScreen';

type Props = BottomTabScreenProps<AppStackParamList, 'AccountsTab'>;

const AccountsListScreen: React.FC<Props> = ({ navigation }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logger.info(MODULE, 'Chargement des comptes');
      const data = await getSharedAccounts();
      const accountList = Array.isArray(data) ? data : (data as { data: Account[] }).data || [];
      setAccounts(accountList);
      await logger.info(MODULE, `${accountList.length} comptes chargés`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await logger.error(MODULE, 'Impossible de charger les comptes', err);
      Alert.alert('Erreur', 'Impossible de charger les comptes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>Comptes</Text>
        <TouchableOpacity style={{ backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : accounts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#666', fontSize: 16 }}>Aucun compte</Text>
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>{item.name}</Text>
              <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default AccountsListScreen;

