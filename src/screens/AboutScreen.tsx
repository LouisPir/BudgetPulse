import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';

const version = Constants.expoConfig?.version ?? '0.0.0';

export const AboutScreen = ({ onBack }: { onBack: () => void }) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>{tr('back', '← Retour')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('about.title', 'À propos')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.appInfo}>
          <Text style={styles.emoji}>💰</Text>
          <Text style={styles.appName}>BudgetPulse</Text>
          <Text style={styles.appVersion}>Version {version}</Text>
          <Text style={styles.appDescription}>{tr('about.description', 'Suis tes dépenses, revenus et budgets au quotidien.')}</Text>
        </View>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('https://github.com/LouisPir/BudgetPulse')}>
            <Text style={styles.rowText}>{tr('about.source', '📦 Code source')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowText}>{tr('about.dev', '👨‍💻 Développé par')}</Text>
            <Text style={styles.rowValue}>Louis Pirot</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.rowText}>{tr('about.stack', '🛠️ Stack')}</Text>
            <Text style={styles.rowValue}>Expo + Supabase</Text>
          </View>
        </View>
        <Text style={styles.footer}>{tr('about.footer', 'Fait avec 💰')}</Text>
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
  appInfo: { alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.lg },
  emoji: { fontSize: 64 },
  appName: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.text },
  appVersion: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  appDescription: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  section: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md },
  rowText: { fontSize: theme.fontSize.md, color: theme.colors.text },
  rowArrow: { fontSize: theme.fontSize.xl, color: theme.colors.textSecondary },
  rowValue: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md },
  footer: { textAlign: 'center', fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 'auto', paddingBottom: theme.spacing.lg },
});
