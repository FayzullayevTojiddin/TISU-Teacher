import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { login } from '../api/auth';
import InputField from './InputField';
import PrettyAlert from './PrettyAlert';

interface AuthFormProps {
  onLogin: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [loginValue, setLoginValue] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const passRef = useRef<TextInput | null>(null);

  const tryLogin = async () => {
    if (!loginValue.trim() || !password.trim()) {
      setErrorMessage('Login va parolni to\'ldiring');
      setErrorVisible(true);
      return;
    }

    try {
      setLoading(true);
      const response = await login(loginValue, password);
      onLogin();
    } catch (error: any) {      
      let errorMsg = error.message || 'Tizimga kirishda xatolik yuz berdi';
      
      errorMsg = errorMsg.replace(/^Error:\s*/i, '');
      
      setErrorMessage(errorMsg);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loginValue.trim() === '' || password.trim() === '' || loading;

  return (
    <View style={styles.container}>
      <PrettyAlert
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />

      <InputField
        label="Login"
        value={loginValue}
        onChangeText={setLoginValue}
        returnKeyType="next"
        onSubmitEditing={() => passRef.current && passRef.current.focus()}
        editable={!loading}
      />

      <InputField
        label="Parol"
        value={password}
        onChangeText={setPassword}
        secure
        inputRef={passRef}
        returnKeyType="done"
        onSubmitEditing={tryLogin}
        editable={!loading}
      />

      <TouchableOpacity
        onPress={tryLogin}
        disabled={isDisabled}
        style={[
          styles.submitBtn,
          { backgroundColor: isDisabled ? '#9EC4FF' : '#0B74FF' },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitTxt}>Kirish</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 18,
  },
  submitBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitTxt: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default AuthForm;