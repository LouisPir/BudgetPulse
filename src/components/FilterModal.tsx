import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { getCategoryKey } from '../utils/format';

export type SortOption = 'date_newest' | 'date_oldest' | 'amount_asc' | 'amount_desc';
export type PeriodOption = 'this_month' | 'last_month' | 'last_3_months' | 'all';
type ModalTab = 'filter' | 'sort';

interface Props {
  visible: boolean;
  onClose: () => void;
  activeCategories: string[];
  activeType: 'expense' | 'income' | null;
  activePeriod: PeriodOption;
  activeSort: SortOption;
  onToggleCategory: (cat: string) => void;
  onSetType: (type: 'expense' | 'income' | null) => void;
  onSetPeriod: (period: PeriodOption) => void;
  onSetSort: (sort: SortOption) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const FilterModal = ({
  visible, onClose, activeCategories, activeType, activePeriod, activeSort,
  onToggleCategory, onSetType, onSetPeriod, onSetSort, onReset, hasActiveFilters,
}: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const [activeTab, setActiveTab] = React.useState<ModalTab>('filter');
  const visibleCategories = activeType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const PERIOD_OPTIONS: { label: string; value: PeriodOption }[] = [
    { label: tr('filter.period.this_month', 'Ce mois-ci'), value: 'this_month' },
    { label: tr('filter.period.last_month', 'Mois dernier'), value: 'last_month' },
    { label: tr('filter.period.last_3_months', '3 derniers mois'), value: 'last_3_months' },
    { label: tr('filter.period.all', 'Tout'), value: 'all' },
  ];

  const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: tr('sort.date_newest', 'Plus récent'), value: 'date_newest' },
    { label: tr('sort.date_oldest', 'Plus ancien'), value: 'date_oldest' },
    { label: tr('sort.amount_asc', 'Montant croissant'), value: 'amount_asc' },
    { label: tr('sort.amount_desc', 'Montant décroissant'), value: 'amount_desc' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.card} activeOpacity={1}>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'filter' && styles.tabActive]}
              onPress={() => setActiveTab('filter')}
            >
              <Text style={[styles.tabText, activeTab === 'filter' && styles.tabTextActive]}>
                {tr('modal.filter', 'Filtrer')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'sort' && styles.tabActive]}
              onPress={() => setActiveTab('sort')}
            >
              <Text style={[styles.tabText, activeTab === 'sort' && styles.tabTextActive]}>
                {tr('modal.sort', 'Trier')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {activeTab === 'filter' && (
              <View style={styles.content}>
                <Text style={styles.sectionTitle}>{tr('filter.type', 'Par type')}</Text>
                <View style={styles.optionsCol}>
                  <TouchableOpacity
                    style={[styles.option, activeType === 'expense' && styles.optionActive]}
                    onPress={() => onSetType(activeType === 'expense' ? null : 'expense')}
                  >
                    <Text style={[styles.optionText, activeType === 'expense' && styles.optionTextActive]}>
                      💸 {tr('transaction.expense', 'Dépense')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.option, activeType === 'income' && styles.optionActive]}
                    onPress={() => onSetType(activeType === 'income' ? null : 'income')}
                  >
                    <Text style={[styles.optionText, activeType === 'income' && styles.optionTextActive]}>
                      💰 {tr('transaction.income', 'Revenu')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>{tr('filter.period', 'Par période')}</Text>
                <View style={styles.optionsCol}>
                  {PERIOD_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.option, activePeriod === opt.value && styles.optionActive]}
                      onPress={() => onSetPeriod(opt.value)}
                    >
                      <Text style={[styles.optionText, activePeriod === opt.value && styles.optionTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>{tr('filter.category', 'Par catégorie')}</Text>
                <View style={styles.chipsRow}>
                    {visibleCategories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.chip, activeCategories.includes(cat) && styles.chipActive]}
                        onPress={() => onToggleCategory(cat)}
                    >
                        <Text style={[styles.chipText, activeCategories.includes(cat) && styles.chipTextActive]}>
                        {tr(getCategoryKey(cat), cat)}
                        </Text>
                    </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}

            {activeTab === 'sort' && (
              <View style={styles.content}>
                <Text style={styles.sectionTitle}>{tr('sort.title', 'Trier par')}</Text>
                <View style={styles.optionsCol}>
                  {SORT_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.option, activeSort === opt.value && styles.optionActive]}
                      onPress={() => onSetSort(opt.value)}
                    >
                      <Text style={[styles.optionText, activeSort === opt.value && styles.optionTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {hasActiveFilters && (
              <TouchableOpacity style={styles.resetButton} onPress={onReset}>
                <Text style={styles.resetText}>{tr('modal.reset', 'Réinitialiser')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>{tr('modal.close', 'Fermer')}</Text>
            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

import React from 'react';

const makeStyles = (theme: Theme) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg, padding: theme.spacing.lg,
    gap: theme.spacing.lg, maxHeight: '80%',
  },
  tabs: { flexDirection: 'row', borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.background, padding: 4 },
  tab: { flex: 1, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full, alignItems: 'center' },
  tabActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.textSecondary },
  tabTextActive: { color: theme.colors.surface },
  content: { gap: theme.spacing.md },
  sectionTitle: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  optionsCol: { gap: theme.spacing.sm },
  option: { padding: theme.spacing.md, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  optionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  optionText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  optionTextActive: { color: theme.colors.primary, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  chipText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  chipTextActive: { color: theme.colors.primary, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  resetButton: { flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  resetText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, fontWeight: '600' },
  closeButton: { flex: 1, backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center' },
  closeText: { color: theme.colors.surface, fontSize: theme.fontSize.md, fontWeight: '700' },
});