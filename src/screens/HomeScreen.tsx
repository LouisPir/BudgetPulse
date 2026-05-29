import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getTransactions, deleteTransaction } from '../services/transactions';
import { Transaction } from '../types';
import { logout } from '../services/auth';

interface Props {
  onAddTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onSettings: () => void;
}

const formatAmount = (cents: number): string => {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
};

const getCurrentMonth = (): { year: number; month: number } => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

export const HomeScreen = ({ onAddTransaction, onEditTransaction, onSettings }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { year, month } = getCurrentMonth();

  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

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

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleDelete = (id: string) => {
    Alert.alert(
      tr('transaction.deleteTitle', 'Supprimer'),
      tr('transaction.deleteConfirm', 'Supprimer cette transaction ?'),
      [
        { text: tr('cancel', 'Annuler'), style: 'cancel' },
        {
          text: tr('delete', 'Supprimer'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
              loadTransactions();
            } catch (error: any) {
              Alert.alert(tr('error.title', 'Erreur'), error.message);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert(tr('error.title', 'Erreur'), error.message);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionCategory}>{item.category}</Text>
        {item.note && <Text style={styles.transactionNote}>{item.note}</Text>}
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, item.type === 'income' ? styles.income : styles.expense]}>
          {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount)}
        </Text>
        <View style={styles.transactionActions}>
          <TouchableOpacity onPress={() => onEditTransaction(item)}>
            <Text style={styles.actionEdit}>{tr('edit', '✏️')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.actionDelete}>{tr('delete', '🗑️')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tr('home.title', 'BudgetPulse')}</Text>
        <TouchableOpacity onPress={onSettings}>
          <Text style={{ fontSize: theme.fontSize.xl }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Solde */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{tr('home.balance', 'Solde du mois')}</Text>
        <Text style={[styles.balanceAmount, balance >= 0 ? styles.income : styles.expense]}>
          {formatAmount(balance)}
        </Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>{tr('home.income', 'Revenus')}</Text>
            <Text style={[styles.balanceItemAmount, styles.income]}>+{formatAmount(totalIncome)}</Text>
          </View>
          <View style={styles.balanceSeparator} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>{tr('home.expenses', 'Dépenses')}</Text>
            <Text style={[styles.balanceItemAmount, styles.expense]}>-{formatAmount(totalExpense)}</Text>
          </View>
        </View>
      </View>

      {/* Liste */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.colors.primary} />
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>{tr('home.empty', 'Aucune transaction ce mois-ci')}</Text>
          }
        />
      )}

      {/* Bouton ajout */}
      <TouchableOpacity style={styles.fab} onPress={onAddTransaction}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  logoutText: { color: theme.colors.danger, fontSize: theme.fontSize.md },
  balanceCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  balanceLabel: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  balanceAmount: { fontSize: theme.fontSize.title, fontWeight: 'bold', marginBottom: theme.spacing.md },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceItemLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  balanceItemAmount: { fontSize: theme.fontSize.lg, fontWeight: '600' },
  balanceSeparator: { width: 1, height: 30, backgroundColor: theme.colors.border },
  income: { color: theme.colors.success },
  expense: { color: theme.colors.danger },
  list: { padding: theme.spacing.lg, paddingBottom: 100 },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  transactionLeft: { flex: 1 },
  transactionCategory: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  transactionNote: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },
  transactionDate: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  transactionActions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  actionEdit: { fontSize: theme.fontSize.lg },
  actionDelete: { fontSize: theme.fontSize.lg },
  empty: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: 40, fontSize: theme.fontSize.md },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: { color: theme.colors.surface, fontSize: 28, fontWeight: 'bold' },
});