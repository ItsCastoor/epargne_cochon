import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '@/lib/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/lib/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreenMinimal: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur';
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20, color: '#000', fontWeight: 'bold' }}>
        Login Test
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, color: '#000' }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, color: '#000' }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
        style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 5 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreenMinimal;

