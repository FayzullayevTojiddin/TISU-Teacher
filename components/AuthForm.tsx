// components/AuthForm.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
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
      setErrorMessage("Login va parolni to'ldiring");
      setErrorVisible(true);
      return;
    }

    try {
      setLoading(true);
      await login(loginValue, password);
      onLogin();
    } catch (error: any) {
      let errorMsg = error?.message || 'Tizimga kirishda xatolik yuz berdi';
      errorMsg = errorMsg.replace(/^Error:\s*/i, '');
      setErrorMessage(errorMsg);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loginValue.trim() === '' || password.trim() === '' || loading;

  return (
    <View style={styles.wrapper}>
      <PrettyAlert
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />

      <View style={styles.card}>
        {/* Left accent */}
        <View style={styles.accent} />

        <View style={styles.cardContent}>
          {/* Header row with emoji/icon and title */}
          <View style={styles.headerRow}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>🔐</Text>
            </View>

            <View style={styles.headerText}>
              <Text style={styles.cardTitle}>Tizimga kirish</Text>
              <Text style={styles.cardSubtitle}>Hisobingiz bilan davom eting</Text>
            </View>

            <View style={styles.spacer} />
          </View>

          {/* Inputs */}
          <View style={styles.inputs}>
            <InputField
              label="Login"
              value={loginValue}
              onChangeText={setLoginValue}
              returnKeyType="next"
              onSubmitEditing={() => passRef.current && passRef.current.focus()}
              editable={!loading}
              autoCapitalize="none"
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
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={tryLogin}
              disabled={isDisabled}
              style={[styles.submitBtn, isDisabled ? styles.btnDisabled : null]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.submitInner}>
                  <Ionicons name="log-in-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitTxt}>Kirish</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AuthForm;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f2f5',
  },
  accent: {
    width: 6,
    backgroundColor: '#0B74FF',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f6f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  spacer: { width: 8 },

  inputs: {
    marginTop: 6,
    width: '100%',
  },

  actions: {
    marginTop: 16,
    alignItems: 'center',
  },

  submitBtn: {
    width: '100%',
    backgroundColor: '#0B74FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: '#9EC4FF',
  },
  submitInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitTxt: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  forgotBtn: {
    marginTop: 10,
    paddingVertical: 6,
  },
  forgotTxt: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
  },
});
