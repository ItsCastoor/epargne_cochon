import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/lib/AuthContext';
import { AuthStackParamList } from '@/lib/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (): Promise<void> => {
    console.log('[RegisterScreen] === handleRegister called ===');
    
    if (!email || !password || !firstName || !lastName) {
      console.log('[RegisterScreen] Validation failed - missing fields');
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      console.log('[RegisterScreen] Validation failed - password too short');
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    console.log('[RegisterScreen] Validation passed, starting registration...');
    setIsLoading(true);
    try {
      console.log('[RegisterScreen] Calling register with:', { email, firstName, lastName });
      await register(email, password, firstName, lastName);
      
      console.log('[RegisterScreen] Inscription réussie!');
      Alert.alert('Succès', 'Inscription réussie! Vous êtes connecté.', [
        {
          text: 'OK',
          onPress: () => {
            console.log('[RegisterScreen] OK button pressed - auto-navigation should happen via AuthContext');
          }
        }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur s\'est produite';
      console.error('[RegisterScreen] Erreur d\'inscription:', message, error);
      Alert.alert('Erreur d\'inscription', message);
    } finally {
      setIsLoading(false);
      console.log('[RegisterScreen] === handleRegister finished ===');
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
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 8 }}>
                🐷 Épargne Cochon 🐷
              </Text>
              <Text style={{ fontSize: 18, color: '#666' }}>Inscription</Text>
            </View>

            {/* Form */}
            <View style={{ gap: 16 }}>
            {/* First Name Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 }}>Prénom</Text>
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
                placeholder="Jean"
                placeholderTextColor="#9ca3af"
                value={firstName}
                onChangeText={setFirstName}
                editable={!isLoading}
              />
            </View>

            {/* Last Name Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 }}>Nom</Text>
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
                placeholder="Dupont"
                placeholderTextColor="#9ca3af"
                value={lastName}
                onChangeText={setLastName}
                editable={!isLoading}
              />
            </View>

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
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
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
                {isLoading ? 'Inscription...' : "S'inscrire"}
              </Text>
            </TouchableOpacity>

              {/* Login Link */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
                <Text style={{ color: '#666', fontSize: 14 }}>Vous avez un compte? </Text>
                <TouchableOpacity onPress={() => navigation?.navigate?.('Login')}>
                  <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
