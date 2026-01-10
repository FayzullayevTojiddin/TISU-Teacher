import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootStack() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="TimeTableScreen" />
        </>
      ) : (
        <>
          <Stack.Screen name="LoginScreen" />
        </>
      )}
    </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}