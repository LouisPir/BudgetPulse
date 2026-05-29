import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { updateEmail } from '../services/auth';
import { Theme } from '../config/theme';

export const ChangeEmailScreen = ({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const handleSubmit = async () => {
    if (!email.trim()) { Alert.alert(tr('error', 'Erreur'), tr('change.email.required', 'L\'email est requis')); return; }
    try {
      setLoading(true);
      await updateEmail(email.trim());
      Alert.alert(tr('change.email.success.title', 'Email mis à jour'), tr('change.email.success.message', 'Un email de confirmation a été envoyé à ta nouvelle adresse.'), [{ text: 'OK', onPress: onSuccess }]);
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>{tr('back', '← Retour')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('change.email.title', 'Changer l\'email')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>{tr('change.email.description', 'Un email de confirmation sera envoyé à ta nouvelle adresse.')}</Text>
        <View style={styles.field}>
          <Text style={styles.label}>{tr('change.email.label', 'Nouvel email *')}</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder={tr('change.email.placeholder', 'nouvelle@adresse.com')} placeholderTextColor={theme.colors.textSecondary} keyboardType="email-address" autoCapitalize="none" autoFocus />
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
  description: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, lineHeight: 22 },
  field: { gap: theme.spacing.sm },
  label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  submitButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center', marginTop: theme.spacing.md },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});
