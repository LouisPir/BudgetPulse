import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { formatAmount } from '../utils/format';
import { Transaction } from '../types';

interface Props {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionCard = ({ transaction, onEdit, onDelete }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  return (
    <View style={styles.card}>
      <View style={[styles.indicator, transaction.type === 'income' ? styles.incomeIndicator : styles.expenseIndicator]} />
      <View style={styles.left}>
        <Text style={styles.category}>{transaction.category}</Text>
        {transaction.note && <Text style={styles.note}>{transaction.note}</Text>}
        <Text style={styles.date}>{transaction.date}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, transaction.type === 'income' ? styles.income : styles.expense]}>
          {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(transaction)}>
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(transaction.id)}>
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm, borderWidth: 1,
    borderColor: theme.colors.border, overflow: 'hidden',
  },
  indicator: { width: 4, alignSelf: 'stretch' },
  incomeIndicator: { backgroundColor: theme.colors.success },
  expenseIndicator: { backgroundColor: theme.colors.danger },
  left: { flex: 1, padding: theme.spacing.md },
  category: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  note: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },
  date: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end', padding: theme.spacing.md },
  amount: { fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  actionIcon: { fontSize: theme.fontSize.lg },
  income: { color: theme.colors.success },
  expense: { color: theme.colors.danger },
});