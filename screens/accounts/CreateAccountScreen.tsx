import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/lib/navigation';
import { createSharedAccount } from '@/lib/api';
import { logger } from '@/lib/logger';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateAccount'>;

const MODULE = 'CreateAccountScreen';

const CreateAccountScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (): Promise<void> => {
    if (!name || !targetAmount) {
      Alert.alert('Erreur', 'Veuillez remplir au minimum le nom et le montant');
      return;
    }

    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erreur', 'Le montant doit être un nombre positif');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[CreateAccountScreen] Creating account:', { name, description, targetAmount: amount, currency });
      await logger.info(MODULE, 'Création d\'un compte', { name });
      
      const response = await createSharedAccount(name, description, amount, currency);
      console.log('[CreateAccountScreen] Account created:', response);
      
      await logger.info(MODULE, 'Compte créé avec succès');
      
      // Afficher un message de succès et rediriger
      Alert.alert('✓ Succès', 'Compte créé avec succès!', [
        {
          text: 'OK',
          onPress: () => {
            console.log('[CreateAccountScreen] Closing modal and navigating to AccountsTab');
            // Fermer le modal CreateAccount
            navigation.goBack();
            // Puis naviguer vers AccountsTab après un court délai
            setTimeout(() => {
              (navigation as any).getParent()?.navigate('AccountsTab');
            }, 100);
          }
        }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur s\'est produite';
      console.error('[CreateAccountScreen] Error:', message, error);
      await logger.error(MODULE, 'Erreur lors de la création du compte', error instanceof Error ? error : new Error(message));
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 8 }}>
              Créer un compte
            </Text>
            <Text style={{ fontSize: 16, color: '#666' }}>Générateur d'épargne automatisé</Text>
          </View>

          {/* Form */}
          <View style={{ gap: 16 }}>
            {/* Name Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 }}>Nom du compte *</Text>
              <TextInput
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  backgroundColor: '#fff',
                  color: '#000',
                  fontSize: 16,
                }}
                placeholder="Vacances d'été"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            {/* Description Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 }}>Description</Text>
              <TextInput
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  backgroundColor: '#fff',
                  color: '#000',
                  fontSize: 16,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                placeholder="Décrivez votre objectif..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                editable={!isLoading}
              />
            </View>

            {/* Target Amount Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 }}>Montant cible *</Text>
              <TextInput
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  backgroundColor: '#fff',
                  color: '#000',
                  fontSize: 16,
                }}
                placeholder="5000"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={targetAmount}
                onChangeText={setTargetAmount}
                editable={!isLoading}
              />
            </View>

            {/* Currency Picker */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 }}>Devise</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['EUR', 'USD', 'GBP', 'CHF'].map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    onPress={() => setCurrency(curr)}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: currency === curr ? '#2563eb' : '#d1d5db',
                      backgroundColor: currency === curr ? '#dbeafe' : '#fff',
                    }}
                  >
                    <Text style={{ textAlign: 'center', fontWeight: '600', color: currency === curr ? '#2563eb' : '#666' }}>
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Buttons */}
            <View style={{ gap: 12, marginTop: 24 }}>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={isLoading}
                style={{
                  width: '100%',
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: isLoading ? '#93c5fd' : '#2563eb',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {isLoading && <ActivityIndicator size="small" color="#fff" />}
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
                  {isLoading ? 'Création...' : '✓ Créer le compte'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                disabled={isLoading}
                style={{
                  width: '100%',
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#f3f4f6',
                }}
              >
                <Text style={{ color: '#666', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
                  Annuler
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateAccountScreen;

