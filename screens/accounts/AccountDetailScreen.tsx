import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/lib/navigation';
import { getSharedAccount, deleteSharedAccount } from '@/lib/api';
import { logger } from '@/lib/logger';

type Props = NativeStackScreenProps<AppStackParamList, 'AccountDetail'>;

interface Account {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

const MODULE = 'AccountDetailScreen';

const AccountDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params as { id: string };
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAccount();
  }, [id]);

  const loadAccount = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logger.info(MODULE, 'Chargement du compte', { id });
      const response = await getSharedAccount(id);

      console.log('[AccountDetailScreen] 📦 API Response:', response);
      console.log('[AccountDetailScreen] 📦 Response type:', typeof response);
      console.log('[AccountDetailScreen] 📦 Response keys:', Object.keys(response as Record<string, unknown>));

      // Gérer différents formats de réponse
      let accountData: Account | undefined;
      const data = response as unknown;

      // Format 1: Objet direct avec .id
      if (data && typeof data === 'object' && (data as Record<string, unknown>).id) {
        accountData = data as Account;
      }
      // Format 2: { data: {...} }
      else if ((response as Record<string, unknown>).data && ((response as Record<string, unknown>).data as Record<string, unknown>).id) {
        accountData = ((response as Record<string, unknown>).data) as Account;
      }
      // Format 3: { account: {...} }
      else if ((response as Record<string, unknown>).account && ((response as Record<string, unknown>).account as Record<string, unknown>).id) {
        accountData = ((response as Record<string, unknown>).account) as Account;
      }

      if (!accountData) {
        console.error('[AccountDetailScreen] Format non reconnu - aucun compte trouvé:', response);
        throw new Error('Format de réponse non reconnu');
      }

      setAccount(accountData);
      await logger.info(MODULE, 'Compte chargé', { name: accountData.name });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[AccountDetailScreen] Error loading account:', err.message);
      await logger.error(MODULE, 'Erreur au chargement du compte', err, { id });
      Alert.alert('Erreur', 'Impossible de charger le compte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (): void => {
    Alert.alert('Confirmation', 'Êtes-vous sûr de vouloir supprimer ce compte?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => deleteAccount(),
      },
    ]);
  };

  const deleteAccount = async (): Promise<void> => {
    if (!account) return;

    try {
      setIsDeleting(true);
      await logger.info(MODULE, 'Suppression du compte', { id: account.id });
      await deleteSharedAccount(account.id);

      await logger.info(MODULE, 'Compte supprimé');
      Alert.alert('Succès', 'Compte supprimé', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[AccountDetailScreen] Error deleting account:', err.message);
      await logger.error(MODULE, 'Erreur lors de la suppression', err, { id: account.id });
      Alert.alert('Erreur', 'Impossible de supprimer le compte');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!account) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>Compte non trouvé</Text>
      </View>
    );
  }

  const progress = (account.currentAmount / account.targetAmount) * 100;
  const remaining = account.targetAmount - account.currentAmount;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 24, paddingTop: 48 }}>
        <Text style={{ color: '#fff', fontSize: 14 }}>Compte d\'épargne</Text>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 8 }}>{account.name}</Text>
        {account.description && (
          <Text style={{ color: '#cffafe', fontSize: 14, marginTop: 8 }}>{account.description}</Text>
        )}
      </View>

      {/* Content */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 24, gap: 24 }}>
        {/* Progress Card */}
        <View style={{ backgroundColor: '#f3f4f6', borderRadius: 12, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#666', fontSize: 12, fontWeight: '500', marginBottom: 4 }}>Épargné</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>
                {account.currentAmount.toFixed(2)} {account.currency}
              </Text>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Text style={{ color: '#666', fontSize: 14, fontWeight: '500', textAlign: 'right' }}>
                {progress.toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={{ backgroundColor: '#e5e7eb', height: 8, borderRadius: 4, overflow: 'hidden' }}>
            <View
              style={{
                backgroundColor: '#2563eb',
                height: '100%',
                width: `${Math.min(progress, 100)}%`,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#666', fontSize: 12 }}>Objectif: {account.targetAmount.toFixed(2)} {account.currency}</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>À épargner: {remaining.toFixed(2)} {account.currency}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 14 }}>Devise</Text>
            <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>{account.currency}</Text>
          </View>
          {account.createdAt && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#666', fontSize: 14 }}>Créé le</Text>
              <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>
                {new Date(account.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12, marginTop: 16 }}>
          <TouchableOpacity
            disabled={isDeleting}
            onPress={handleDelete}
            style={{
              width: '100%',
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: '#fee2e2',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {isDeleting && <ActivityIndicator size="small" color="#dc2626" />}
            <Text style={{ color: '#dc2626', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
              {isDeleting ? 'Suppression...' : '🗑️ Supprimer ce compte'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: '100%',
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: '#f3f4f6',
            }}
          >
            <Text style={{ color: '#666', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
              Retour
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AccountDetailScreen;

