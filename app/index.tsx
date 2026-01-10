import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SplashScreen from './SplashScreen';

export default function Index() {
  const { isLoggedIn } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showSplash) return;

    if (isLoggedIn) {
      router.replace('/TimeTableScreen');
    } else {
      router.replace('/LoginScreen');
    }
  }, [isLoggedIn, showSplash]);

  return <SplashScreen />;
}