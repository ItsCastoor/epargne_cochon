import React from 'react';
import { TextInput as RNTextInput, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  editable?: boolean;
  error?: boolean;
  errorText?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
}

/**
 * Composant TextInput réutilisable avec label et gestion d'erreur
 */
export const CustomTextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  error = false,
  errorText = '',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
}) => {
  const theme = useTheme();
  const borderColor = error ? theme.colors.error : theme.colors.outline;
  const backgroundColor = editable ? theme.colors.surface : '#f3f4f6';

  return (
    <View style={{ marginBottom: 12 }}>
      {label && (
        <Text
          variant="labelMedium"
          style={{
            marginBottom: 8,
            color: theme.colors.onBackground,
            fontWeight: '500',
          }}
        >
          {label}
        </Text>
      )}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor="#9ca3af"
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor,
          borderRadius: 8,
          backgroundColor,
          color: theme.colors.onBackground,
          fontSize: 16,
        }}
      />
      {error && errorText && (
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.error, marginTop: 4 }}
        >
          {errorText}
        </Text>
      )}
    </View>
  );
};

export default CustomTextInput;

