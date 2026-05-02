import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/lib/AuthContext';
import { AuthStackParamList } from '@/lib/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

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
      <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 48 }}>
          {/* Card Container */}
          <View
            style={{
              width: '100%',
              maxWidth: 420,
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingHorizontal: 32,
              paddingVertical: 40,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            {/* Header */}
            <View style={{ marginBottom: 32, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
                <Image source={require('@/public/tirelire.png')} style={{ width: 80, height: 80 }} />
                <View>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000', textAlign: 'center' }}>Épargne</Text>
                </View>
                <Image source={require('@/public/tirelire.png')} style={{ width: 80, height: 80 }} />
              </View>
              <Text style={{ fontSize: 18, color: '#666', textAlign: 'center' }}>Connexion</Text>
            </View>

            {/* Form */}
            <View style={{ gap: 16 }}>
            {/* Email Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 }}>Email</Text>
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
                placeholder="votre@email.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 }}>Mot de passe</Text>
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
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                paddingVertical: 12,
                borderRadius: 8,
                marginTop: 16,
                backgroundColor: isLoading ? '#93c5fd' : '#2563eb',
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </TouchableOpacity>

              {/* Register Link */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
                <Text style={{ color: '#666', fontSize: 14 }}>Pas encore de compte? </Text>
                <TouchableOpacity onPress={() => navigation?.navigate?.('Register')}>
                  <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>S'inscrire</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
