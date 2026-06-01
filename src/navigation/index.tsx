import { useState, useEffect } from 'react';
import { View, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ChangeEmailScreen } from '../screens/ChangeEmailScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { ThemeScreen } from '../screens/ThemeScreen';
import { LanguageScreen } from '../screens/LanguageScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { Transaction } from '../types';
import { StatsScreen } from '../screens/StatsScreen';
import { BudgetScreen } from '../screens/BudgetScreen';

type Screen =
  | 'Home'
  | 'Auth'
  | 'Register'
  | 'AddTransaction'
  | 'EditTransaction'
  | 'Settings'
  | 'ChangeEmail'
  | 'Stats'
  | 'Budget'
  | 'ChangePassword'
  | 'Theme'
  | 'Language'
  | 'About';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [screen, setScreen] = useState<Screen>('Home');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const backAction = () => {
      if (screen === 'Register') { setScreen('Auth'); return true; }
      if (screen === 'AddTransaction') { setScreen('Home'); return true; }
      if (screen === 'EditTransaction') { setSelectedTransaction(null); setScreen('Home'); return true; }
      if (screen === 'Settings') { setScreen('Home'); return true; }
      if (screen === 'ChangeEmail') { setScreen('Settings'); return true; }
      if (screen === 'ChangePassword') { setScreen('Settings'); return true; }
      if (screen === 'Theme') { setScreen('Settings'); return true; }
      if (screen === 'Budget') { setScreen('Settings'); return true; }
      if (screen === 'Language') { setScreen('Settings'); return true; }
      if (screen === 'About') { setScreen('Settings'); return true; }
      if (screen === 'Stats') { setScreen('Settings'); return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [screen]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    if (screen === 'Register') {
      return <RegisterScreen onGoToLogin={() => setScreen('Auth')} />;
    }
    return <LoginScreen onGoToRegister={() => setScreen('Register')} />;
  }

  if (screen === 'AddTransaction') {
    return (
      <AddTransactionScreen
        onBack={() => setScreen('Home')}
        onSuccess={() => setScreen('Home')}
      />
    );
  }
  if (screen === 'Budget') {
    return <BudgetScreen onBack={() => setScreen('Settings')} />;
  }
  if (screen === 'Stats') {
    return <StatsScreen onBack={() => setScreen('Settings')} />;
  }

  if (screen === 'EditTransaction' && selectedTransaction) {
    return (
      <AddTransactionScreen
        onBack={() => { setSelectedTransaction(null); setScreen('Home'); }}
        onSuccess={() => { setSelectedTransaction(null); setScreen('Home'); }}
        transaction={selectedTransaction}
      />
    );
  }

  if (screen === 'Settings') {
    return (
      <SettingsScreen
        onBack={() => setScreen('Home')}
        onChangeEmail={() => setScreen('ChangeEmail')}
        onChangePassword={() => setScreen('ChangePassword')}
        onTheme={() => setScreen('Theme')}
        onLanguage={() => setScreen('Language')}
        onAbout={() => setScreen('About')}
        onStats={() => setScreen('Stats')}
        onBudget={() => setScreen('Budget')}
      />
    );
  }

  if (screen === 'ChangeEmail') {
    return <ChangeEmailScreen onBack={() => setScreen('Settings')} onSuccess={() => setScreen('Settings')} />;
  }

  if (screen === 'ChangePassword') {
    return <ChangePasswordScreen onBack={() => setScreen('Settings')} onSuccess={() => setScreen('Settings')} />;
  }

  if (screen === 'Theme') {
    return <ThemeScreen onBack={() => setScreen('Settings')} />;
  }

  if (screen === 'Language') {
    return <LanguageScreen onBack={() => setScreen('Settings')} />;
  }

  if (screen === 'About') {
    return <AboutScreen onBack={() => setScreen('Settings')} />;
  }

  return (
    <HomeScreen
      onAddTransaction={() => setScreen('AddTransaction')}
      onEditTransaction={(transaction) => {
        setSelectedTransaction(transaction);
        setScreen('EditTransaction');
      }}
      onSettings={() => setScreen('Settings')}
    />
  );
};

export const Navigation = () => {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
};