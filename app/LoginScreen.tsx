import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import AuthForm from '../components/AuthForm';
import Header from '../components/Header';
import RegisteredScreen from './RegisterScreen';

interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLogin, onRegister }) => {
  const [showRegistered, setShowRegistered] = useState(false);

  if (showRegistered) {
    return <RegisteredScreen />;
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Header />
          <AuthForm onLogin={onLogin} onRegister={() => setShowRegistered(true)} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F7F8FA'
  }
});