import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeName, themes } from '../config/theme';

const THEME_OPTIONS: { name: ThemeName; labelKey: string; labelFr: string; emoji: string }[] = [
  { name: 'default', labelKey: 'theme.default', labelFr: 'Défaut', emoji: '💜' },
];

export const ThemeScreen = ({ onBack }: { onBack: () => void }) => {
  const { themeName, setTheme, theme } = useTheme();
  const { tr } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{tr('theme.title', 'Thème')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = themeName === option.name;
          const previewTheme = themes[option.name];
          return (
            <TouchableOpacity
              key={option.name}
              style={[styles.themeCard, { backgroundColor: previewTheme.colors.surface, borderColor: isSelected ? theme.colors.primary : theme.colors.border, borderWidth: isSelected ? 2 : 1 }]}
              onPress={() => setTheme(option.name)}
            >
              <View style={[styles.preview, { backgroundColor: previewTheme.colors.background }]}>
                <View style={[styles.previewBar, { backgroundColor: previewTheme.colors.primary }]} />
                <View style={styles.previewContent}>
                  <View style={[styles.previewCard, { backgroundColor: previewTheme.colors.surface, borderColor: previewTheme.colors.border }]} />
                  <View style={[styles.previewCard, { backgroundColor: previewTheme.colors.surface, borderColor: previewTheme.colors.border }]} />
                </View>
              </View>
              <View style={styles.themeInfo}>
                <Text style={styles.themeEmoji}>{option.emoji}</Text>
                <Text style={[styles.themeLabel, { color: previewTheme.colors.text }]}>{tr(option.labelKey, option.labelFr)}</Text>
                {isSelected && <Text style={[styles.selectedBadge, { color: theme.colors.primary }]}>{tr('theme.active', '✓ Actif')}</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1 },
  backText: { fontSize: 16, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  content: { flex: 1, padding: 24, gap: 16 },
  themeCard: { borderRadius: 12, overflow: 'hidden' },
  preview: { height: 80, overflow: 'hidden' },
  previewBar: { height: 20, width: '100%' },
  previewContent: { flexDirection: 'row', gap: 8, padding: 8 },
  previewCard: { flex: 1, height: 40, borderRadius: 8, borderWidth: 1 },
  themeInfo: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  themeEmoji: { fontSize: 24 },
  themeLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  selectedBadge: { fontSize: 14, fontWeight: 'bold' },
});
