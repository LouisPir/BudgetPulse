import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getTransactions, deleteTransaction } from '../services/transactions';
import { Transaction } from '../types';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionCard } from '../components/TransactionCard';
import { FilterModal, SortOption, PeriodOption } from '../components/FilterModal';

interface Props {
  onAddTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onSettings: () => void;
}

export const HomeScreen = ({ onAddTransaction, onEditTransaction, onSettings }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeType, setActiveType] = useState<'expense' | 'income' | null>(null);
  const [activePeriod, setActivePeriod] = useState<PeriodOption>('this_month');
  const [activeSort, setActiveSort] = useState<SortOption>('date_newest');

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error: any) {
      Alert.alert(tr('error.title', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const getFiltered = (): Transaction[] => {
    let result = [...transactions];
    const now = new Date();

    if (activePeriod === 'this_month') {
      result = result.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
      });
    } else if (activePeriod === 'last_month') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      result = result.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === last.getFullYear() && d.getMonth() === last.getMonth();
      });
    } else if (activePeriod === 'last_3_months') {
      const limit = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      result = result.filter((t) => new Date(t.date) >= limit);
    }

    if (search.trim()) {
      result = result.filter((t) =>
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.note?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (activeType) result = result.filter((t) => t.type === activeType);
    if (activeCategories.length > 0) result = result.filter((t) => activeCategories.includes(t.category));

    result.sort((a, b) => {
      if (activeSort === 'date_newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (activeSort === 'date_oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (activeSort === 'amount_asc') return a.amount - b.amount;
      if (activeSort === 'amount_desc') return b.amount - a.amount;
      return 0;
    });

    return result;
  };

  const filtered = getFiltered();
  const hasActiveFilters = activeCategories.length > 0 || activeType !== null || activePeriod !== 'this_month';

  const handleDelete = (id: string) => {
    Alert.alert(
      tr('transaction.deleteTitle', 'Supprimer'),
      tr('transaction.deleteConfirm', 'Supprimer cette transaction ?'),
      [
        { text: tr('cancel', 'Annuler'), style: 'cancel' },
        {
          text: tr('delete', 'Supprimer'), style: 'destructive',
          onPress: async () => {
            try { await deleteTransaction(id); loadTransactions(); }
            catch (error: any) { Alert.alert(tr('error.title', 'Erreur'), error.message); }
          },
        },
      ]
    );
  };

  const handleReset = () => {
    setActiveCategories([]);
    setActiveType(null);
    setActivePeriod('this_month');
    setActiveSort('date_newest');
  };
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tr('home.title', 'BudgetPulse')}</Text>
        <TouchableOpacity onPress={onSettings}>
          <Text style={{ fontSize: theme.fontSize.xl }}>⚙️</Text>
        </TouchableOpacity>
      </View>
      {/* Navigation mois */}
      <View style={styles.monthNav}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
        >
          <Text style={styles.monthButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity
          style={[styles.monthButton, isCurrentMonth && styles.monthButtonDisabled]}
          onPress={() => {
            const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            if (next <= new Date()) setCurrentDate(next);
          }}
          disabled={isCurrentMonth}
        >
          <Text style={[styles.monthButtonText, isCurrentMonth && styles.monthButtonTextDisabled]}>›</Text>
        </TouchableOpacity>
      </View>
      <BalanceCard transactions={filtered} />

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={tr('home.search', '🔍 Rechercher...')}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={theme.colors.textSecondary}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.filterButtonIcon}>🪄</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              onEdit={onEditTransaction}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>{tr('home.empty', 'Aucune transaction')}</Text>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={onAddTransaction}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        activeCategories={activeCategories}
        activeType={activeType}
        activePeriod={activePeriod}
        activeSort={activeSort}
        onToggleCategory={(cat) => setActiveCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])}
        onSetType={setActiveType}
        onSetPeriod={setActivePeriod}
        onSetSort={setActiveSort}
        onReset={handleReset}
        hasActiveFilters={hasActiveFilters}
      />
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
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md, gap: theme.spacing.sm,
  },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full,
    borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md,
  },
  searchInput: { flex: 1, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  clearSearch: { color: theme.colors.textSecondary, fontSize: theme.fontSize.lg, padding: theme.spacing.sm },
  filterButton: {
    width: 44, height: 44, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  filterButtonActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  filterButtonIcon: { fontSize: 20 },
  list: { paddingHorizontal: theme.spacing.lg, paddingBottom: 100 },
  empty: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: 40, fontSize: theme.fontSize.md },
  fab: {
    position: 'absolute', bottom: theme.spacing.xl, right: theme.spacing.xl,
    width: 56, height: 56, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  fabText: { color: theme.colors.surface, fontSize: 28, fontWeight: 'bold' },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  monthButton: {
    width: 36, height: 36, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center',
  },
  monthButtonDisabled: { opacity: 0.3 },
  monthButtonText: { fontSize: theme.fontSize.xxl, color: theme.colors.primary, fontWeight: 'bold' },
  monthButtonTextDisabled: { color: theme.colors.textSecondary },
  monthLabel: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text, textTransform: 'capitalize' },
});