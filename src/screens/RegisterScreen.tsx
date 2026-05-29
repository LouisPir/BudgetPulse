import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { register } from '../services/auth';

interface Props {
  onGoToLogin: () => void;
}

export const RegisterScreen = ({ onGoToLogin }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert(tr('error.title', 'Erreur'), tr('auth.fillFields', 'Remplis tous les champs.'));
      return;
    }
    if (password !== confirm) {
      Alert.alert(tr('error.title', 'Erreur'), tr('auth.passwordMismatch', 'Les mots de passe ne correspondent pas.'));
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password);
      Alert.alert(tr('auth.success', 'Succès'), tr('auth.checkEmail', 'Vérifie ta boîte mail pour confirmer ton compte.'));
      onGoToLogin();
    } catch (error: any) {
      Alert.alert(tr('error.title', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{tr('auth.register', 'Créer un compte')}</Text>
        <Text style={styles.subtitle}>{tr('auth.registerSubtitle', 'Rejoins BudgetPulse')}</Text>

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
        <TextInput
          style={styles.input}
          placeholder={tr('auth.confirmPassword', 'Confirmer le mot de passe')}
          placeholderTextColor={theme.colors.textSecondary}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color={theme.colors.surface} />
            : <Text style={styles.buttonText}>{tr('auth.createAccount', 'Créer mon compte')}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoToLogin}>
          <Text style={styles.link}>{tr('auth.alreadyAccount', 'Déjà un compte ? Se connecter')}</Text>
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