import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { login } from '../services/auth';

interface Props {
  onGoToRegister: () => void;
}

export const LoginScreen = ({ onGoToRegister }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(tr('error.title', 'Erreur'), tr('auth.fillFields', 'Remplis tous les champs.'));
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error: any) {
      Alert.alert(tr('error.title', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{tr('auth.welcome', 'BudgetPulse')}</Text>
        <Text style={styles.subtitle}>{tr('auth.loginSubtitle', 'Connecte-toi à ton compte')}</Text>

        <TextInput
          style={styles.input}
          placeholder={tr('auth.email', 'Email')}
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder={tr('auth.password', 'Mot de passe')}
          placeholderTextColor={theme.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color={theme.colors.surface} />
            : <Text style={styles.buttonText}>{tr('auth.login', 'Se connecter')}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoToRegister}>
          <Text style={styles.link}>{tr('auth.noAccount', 'Pas encore de compte ? S\'inscrire')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', padding: theme.spacing.xl },
  title: { fontSize: theme.fontSize.title, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.sm },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonText: { color: theme.colors.surface, fontSize: theme.fontSize.lg, fontWeight: '600' },
  link: { color: theme.colors.primary, textAlign: 'center', fontSize: theme.fontSize.md },
});