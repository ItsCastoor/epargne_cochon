import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, Alert, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, useTheme, Chip } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppStackParamList } from '@/lib/navigation';
import { createSharedAccount } from '@/lib/api';
import { logger } from '@/lib/logger';
import { CustomTextInput, CustomButton, ScreenHeader } from '@/components';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateAccount'>;

interface FormErrors {
  name: string;
  targetAmount: string;
}

const MODULE = 'CreateAccountScreen';

const CreateAccountScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({ name: '', targetAmount: '' });

  const validate = (): boolean => {
    const newErrors: FormErrors = { name: '', targetAmount: '' };

    if (!name.trim()) {
      newErrors.name = 'Nom requis';
    }

    if (!targetAmount) {
      newErrors.targetAmount = 'Montant requis';
    } else {
      const amount = parseFloat(targetAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.targetAmount = 'Montant positif requis';
      }
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.targetAmount;
  };

  const handleCreate = async (): Promise<void> => {
    if (!validate()) return;

    const amount = parseFloat(targetAmount);
    setIsLoading(true);
    try {
      await logger.info(MODULE, 'Création du compte', { name });
      await createSharedAccount(name, description, amount, currency);

      Alert.alert('✅ Succès', 'Compte créé avec succès!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
            setTimeout(() => {
              (navigation as any).getParent()?.navigate('AccountsTab');
            }, 100);
          }
        }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la création';
      await logger.error(MODULE, 'Erreur création compte', error instanceof Error ? error : new Error(message));
      Alert.alert('❌ Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <ScreenHeader
          gradient="accounts"
          title="Créer un compte"
          subtitle="Nouvelle épargne"
        />

        {/* Content */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 24, gap: 20 }}>
          {/* Form */}
          <View style={{ gap: 12 }}>
            <CustomTextInput
              label="Nom du compte *"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: '' });
              }}
              placeholder="Vacances d'été 2026"
              editable={!isLoading}
              error={!!errors.name}
              errorText={errors.name}
            />

            <CustomTextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre objectif..."
              multiline={true}
              numberOfLines={4}
              editable={!isLoading}
            />

            <CustomTextInput
              label="Montant cible *"
              value={targetAmount}
              onChangeText={(text) => {
                setTargetAmount(text);
                setErrors({ ...errors, targetAmount: '' });
              }}
              placeholder="5000"
              keyboardType="numeric"
              editable={!isLoading}
              error={!!errors.targetAmount}
              errorText={errors.targetAmount}
            />
          </View>

          {/* Currency Selector */}
          <View>
            <Text variant="labelMedium" style={{ marginBottom: 12, fontWeight: '500' }}>
              Devise
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['EUR', 'USD', 'GBP', 'CHF'].map((curr) => (
                <Pressable
                  key={curr}
                  onPress={() => !isLoading && setCurrency(curr)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: currency === curr ? theme.colors.primary : theme.colors.outline,
                    backgroundColor: currency === curr ? theme.colors.primaryContainer : theme.colors.surface,
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: '600',
                      color: currency === curr ? theme.colors.primary : theme.colors.onSurfaceVariant,
                    }}
                  >
                    {curr}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={{ gap: 12, marginTop: 12 }}>
            <CustomButton
              label={isLoading ? 'Création...' : '✓ Créer le compte'}
              onPress={handleCreate}
              loading={isLoading}
              disabled={isLoading}
              variant="secondary"
              icon={isLoading ? undefined : <MaterialCommunityIcons name="plus" size={18} color="#fff" />}
            />

            <CustomButton
              label="Annuler"
              onPress={() => navigation.goBack()}
              variant="primary"
              fullWidth={true}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateAccountScreen;

