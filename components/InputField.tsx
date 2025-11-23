import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputFieldProps extends Pick<
  TextInputProps,
  'returnKeyType' | 'onSubmitEditing' | 'placeholderTextColor' | 'autoCapitalize'
> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secure?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  secure,
  inputRef,
  returnKeyType,
  onSubmitEditing,
  placeholderTextColor = '#999',
  autoCapitalize = 'none',
}) => {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef as any}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!!secure}
        style={styles.input}
        placeholder={label}
        placeholderTextColor={placeholderTextColor}
        autoCapitalize={autoCapitalize}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        keyboardType={secure ? 'default' : 'default'}
      />
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  inputRow: { marginBottom: 14 },
  label: { marginBottom: 6, color: '#333', fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E6E9EE',
  },
});