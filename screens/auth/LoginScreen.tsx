import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, useTheme } from 'react-native-paper';
import { useAuth } from '@/lib/AuthContext';
import { AuthStackParamList } from '@/lib/navigation';
import { CustomTextInput, CustomButton } from '@/components';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const { login } = useAuth();

  const validate = (): boolean => {
    const newErrors = { email: '', password: '' };

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

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur s\'est produite';
      Alert.alert('Erreur de connexion', message);
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
                Gestion d'épargne en famille
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 8 }}>
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

              <CustomButton
                label={isLoading ? 'Connexion...' : 'Se connecter'}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
              />
            </View>

            {/* Register Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>Pas encore de compte? </Text>
              <Pressable
                onPress={() => !isLoading && navigation?.navigate?.('Register')}
              >
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: '600',
                    fontSize: 14,
                    textDecorationLine: 'underline',
                  }}
                >
                  S'inscrire
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
