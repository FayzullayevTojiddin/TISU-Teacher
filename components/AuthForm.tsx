import React, { useRef, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import InputField from './InputField';
import PrettyAlert from './PrettyAlert';

interface AuthFormProps {
  onLogin: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorVisible, setErrorVisible] = useState(false);

  const passRef = useRef<TextInput | null>(null);

  const tryLogin = () => {
    if (login === 'teacher' && password === '1') {
      onLogin();
    } else {
      setErrorVisible(true);
    }
  };

  const isDisabled = login.trim() === '' || password.trim() === '';

  return (
    <View style={{ width: '100%', marginTop: 18 }}>

      <PrettyAlert 
        visible={errorVisible}
        message="Login yoki parol noto‘g‘ri!"
        onClose={() => setErrorVisible(false)}
      />

      <InputField
        label="Login"
        value={login}
        onChangeText={setLogin}
        returnKeyType="next"
        onSubmitEditing={() => passRef.current && passRef.current.focus()}
      />

      <InputField
        label="Parol"
        value={password}
        onChangeText={setPassword}
        secure
        inputRef={passRef}
        returnKeyType="done"
        onSubmitEditing={tryLogin}
      />

      <TouchableOpacity
        onPress={tryLogin}
        disabled={isDisabled}
        style={{
          marginTop: 10,
          backgroundColor: isDisabled ? '#9EC4FF' : '#0B74FF',
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Kirish</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthForm;