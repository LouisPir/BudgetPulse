import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { Theme } from '../config/theme';

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'en', label: '🇬🇧 English' },
];

export const LanguageScreen = ({ onBack }: { onBack: () => void }) => {
  const { theme } = useTheme();
  const { language, setLanguage, tr } = useLanguage();
  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>{tr('back', '← Retour')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('language.title', 'Langue')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        {LANGUAGE_OPTIONS.map((option) => (
          <TouchableOpacity key={option.code} style={[styles.option, language === option.code && styles.optionSelected]} onPress={() => setLanguage(option.code)}>
            <Text style={[styles.optionText, language === option.code && styles.optionTextSelected]}>{option.label}</Text>
            {language === option.code && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  content: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.md },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  optionSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  optionText: { fontSize: theme.fontSize.lg, color: theme.colors.text },
  optionTextSelected: { color: theme.colors.primary, fontWeight: '600' },
  checkmark: { fontSize: theme.fontSize.lg, color: theme.colors.primary, fontWeight: 'bold' },
});
