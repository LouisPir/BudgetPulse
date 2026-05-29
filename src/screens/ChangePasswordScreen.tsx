import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { updatePassword } from '../services/auth';
import { Theme } from '../config/theme';

export const ChangePasswordScreen = ({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const handleSubmit = async () => {
    if (!password.trim()) { Alert.alert(tr('error', 'Erreur'), tr('change.password.required', 'Le mot de passe est requis')); return; }
    if (password.length < 6) { Alert.alert(tr('error', 'Erreur'), tr('change.password.min', 'Le mot de passe doit faire au moins 6 caractères')); return; }
    if (password !== confirm) { Alert.alert(tr('error', 'Erreur'), tr('change.password.mismatch', 'Les mots de passe ne correspondent pas')); return; }
    try {
      setLoading(true);
      await updatePassword(password);
      Alert.alert(tr('change.password.success.title', 'Mot de passe mis à jour'), tr('change.password.success.message', 'Ton mot de passe a été changé avec succès.'), [{ text: 'OK', onPress: onSuccess }]);
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>{tr('back', '← Retour')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('change.password.title', 'Changer le mot de passe')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>{tr('change.password.label', 'Nouveau mot de passe *')}</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder={tr('change.password.placeholder', 'Au moins 6 caractères')} placeholderTextColor={theme.colors.textSecondary} secureTextEntry autoFocus />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{tr('change.password.confirm.label', 'Confirmer le mot de passe *')}</Text>
          <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} placeholder={tr('change.password.confirm.placeholder', 'Répète le mot de passe')} placeholderTextColor={theme.colors.textSecondary} secureTextEntry />
        </View>
        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{tr('confirm.button', 'Confirmer')}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  content: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.lg },
  field: { gap: theme.spacing.sm },
  label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  submitButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center', marginTop: theme.spacing.md },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});
