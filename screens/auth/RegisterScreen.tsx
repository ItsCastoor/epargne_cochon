import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, useTheme } from 'react-native-paper';
import { useAuth } from '@/lib/AuthContext';
import { AuthStackParamList } from '@/lib/navigation';
import { CustomTextInput, CustomButton } from '@/components';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { register } = useAuth();

  const validate = (): boolean => {
    const newErrors: FormErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!lastName.trim()) newErrors.lastName = 'Nom requis';

    if (!email) {
      newErrors.email = 'Email requis';
    } else if (!email.includes('@')) {
      newErrors.email = 'Email invalide';
    }

    if (!password) {
      newErrors.password = 'Mot de passe requis';
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(e => e !== '');
  };

  const handleRegister = async (): Promise<void> => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(email, password, firstName, lastName);
      Alert.alert('Succès', 'Inscription réussie! Vous êtes connecté.', [
        {
          text: 'OK',
          onPress: () => console.log('[RegisterScreen] OK button pressed'),
        }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur s\'est produite';
      Alert.alert('Erreur d\'inscription', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 48 }}>
          {/* Card Container */}
          <View
            style={{
              width: '100%',
              maxWidth: 420,
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              paddingHorizontal: 32,
              paddingVertical: 40,
              borderWidth: 1,
              borderColor: theme.colors.outline,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            {/* Header */}
            <View style={{ marginBottom: 32, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
                <Image source={require('@/public/tirelire.png')} style={{ width: 60, height: 60 }} />
                <Text variant="displaySmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                  Épargne
                </Text>
                <Image source={require('@/public/tirelire.png')} style={{ width: 60, height: 60 }} />
              </View>
              <Text variant="bodyLarge" style={{ color: '#9ca3af', textAlign: 'center' }}>
                Créer un compte
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 8 }}>
              <CustomTextInput
                label="Prénom"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  setErrors({ ...errors, firstName: '' });
                }}
                placeholder="Jean"
                editable={!isLoading}
                error={!!errors.firstName}
                errorText={errors.firstName}
              />

              <CustomTextInput
                label="Nom"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  setErrors({ ...errors, lastName: '' });
                }}
                placeholder="Dupont"
                editable={!isLoading}
                error={!!errors.lastName}
                errorText={errors.lastName}
              />

              <CustomTextInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors({ ...errors, email: '' });
                }}
                placeholder="votre@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                error={!!errors.email}
                errorText={errors.email}
              />

              <CustomTextInput
                label="Mot de passe"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: '' });
                }}
                placeholder="••••••••"
                secureTextEntry={true}
                editable={!isLoading}
                error={!!errors.password}
                errorText={errors.password}
              />

              <CustomTextInput
                label="Confirmer le mot de passe"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                placeholder="••••••••"
                secureTextEntry={true}
                editable={!isLoading}
                error={!!errors.confirmPassword}
                errorText={errors.confirmPassword}
              />

              <CustomButton
                label={isLoading ? 'Inscription...' : "S'inscrire"}
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
              />
            </View>

            {/* Login Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>Vous avez un compte? </Text>
              <Pressable
                onPress={() => !isLoading && navigation?.navigate?.('Login')}
              >
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: '600',
                    fontSize: 14,
                    textDecorationLine: 'underline',
                  }}
                >
                  Se connecter
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
