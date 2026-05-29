import { useState, useEffect } from 'react';
import { View, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

export type Screen = 'Home' | 'Auth' | 'Register';

export const Navigation = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [screen, setScreen] = useState<Screen>('Home');

  useEffect(() => {
    const backAction = () => {
      if (screen === 'Register') { setScreen('Auth'); return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [screen]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        {screen === 'Register'
          ? <RegisterScreen onGoToLogin={() => setScreen('Auth')} />
          : <LoginScreen onGoToRegister={() => setScreen('Register')} />
        }
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    </SafeAreaProvider>
  );
};