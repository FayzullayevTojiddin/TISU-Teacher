import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types/navigation';
import AttendanceScreen from './AttendanceScreen';
import LoginScreen from './LoginScreen';
import TimeTableScreen from './TimeTableScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isLoggedIn, login } = useAuth();

  return (
    <>
      {isLoggedIn ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="TimeTable" component={TimeTableScreen} />
          <Stack.Screen name="Attendance" component={AttendanceScreen} />
        </Stack.Navigator>
      ) : (
        <LoginScreen onLogin={login} />
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