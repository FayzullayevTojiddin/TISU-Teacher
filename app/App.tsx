import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types/navigation';
import AttendanceScreen from './AttendanceScreen';
import LoginScreen from './LoginScreen';
import SplashScreen from './SplashScreen';
import TimeTableScreen from './TimeTableScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isLoggedIn, login, logout } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
      {isLoggedIn ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="TimeTable">
            {(props) => <TimeTableScreen {...props} onLogout={logout} />}
          </Stack.Screen>
          <Stack.Screen name="Attendance" component={AttendanceScreen} />
        </Stack.Navigator>
      ) : (
        <LoginScreen onLogin={login} onRegister={login}/>
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaView>
  );
}