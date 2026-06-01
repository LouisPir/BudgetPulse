import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { logout } from '../services/auth';

interface Props {
  onBack: () => void;
  onChangeEmail: () => void;
  onChangePassword: () => void;
  onTheme: () => void;
  onLanguage: () => void;
  onAbout: () => void;
  onStats: () => void;
}


export const SettingsScreen = ({ onBack, onChangeEmail, onChangePassword, onTheme, onLanguage, onAbout, onStats }: Props) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const handleLogout = async () => {
    Alert.alert(
      tr('settings.logout.title', 'Déconnexion'),
      tr('settings.logout.confirm', 'Es-tu sûr de vouloir te déconnecter ?'),
      [
        { text: tr('cancel', 'Annuler'), style: 'cancel' },
        {
          text: tr('settings.logout.title', 'Déconnexion'),
          style: 'destructive',
          onPress: async () => {
            try { await logout(); }
            catch (error: any) { Alert.alert(tr('error.title', 'Erreur'), error.message); }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('settings', 'Paramètres')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>

        <Text style={styles.sectionTitle}>{tr('settings.account', 'Compte')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onChangeEmail}>
            <Text style={styles.rowText}>✉️ {tr('settings.email', 'Changer l\'email')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onChangePassword}>
            <Text style={styles.rowText}>🔑 {tr('settings.password', 'Changer le mot de passe')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{tr('settings.preferences', 'Préférences')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onTheme}>
            <Text style={styles.rowText}>🎨 {tr('settings.theme', 'Thème')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onLanguage}>
            <Text style={styles.rowText}>🌍 {tr('settings.language', 'Langue')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>{tr('settings.analysis', 'Analyse')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onStats}>
            <Text style={styles.rowText}>📊 {tr('settings.stats', 'Statistiques')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>{tr('settings.info', 'Informations')}</Text>
        <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={onAbout}>
            <Text style={styles.rowText}>ℹ️ {tr('settings.about', 'À propos')}</Text>
            <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{tr('settings.logout', 'Se déconnecter')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: theme.spacing.lg, backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  sectionTitle: {
    fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: theme.spacing.sm,
  },
  section: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md },
  rowText: { fontSize: theme.fontSize.md, color: theme.colors.text },
  rowArrow: { fontSize: theme.fontSize.xl, color: theme.colors.textSecondary },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md },
  logoutButton: {
    marginTop: theme.spacing.lg, backgroundColor: theme.colors.accent,
    padding: theme.spacing.md, borderRadius: theme.borderRadius.full,
    alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primaryLight,
  },
  logoutText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});