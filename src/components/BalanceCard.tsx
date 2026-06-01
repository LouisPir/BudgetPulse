import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { formatAmount } from '../utils/format';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

export const BalanceCard = ({ transactions }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const filtered = transactions.filter((t) => t.reimbursement_status !== 'reimbursed');
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{tr('home.balance', 'Solde')}</Text>
      <Text style={[styles.amount, balance >= 0 ? styles.income : styles.expense]}>
        {formatAmount(balance)}
      </Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>{tr('home.income', 'Revenus')}</Text>
          <Text style={[styles.itemAmount, styles.income]}>+{formatAmount(totalIncome)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.item}>
          <Text style={styles.itemLabel}>{tr('home.expenses', 'Dépenses')}</Text>
          <Text style={[styles.itemAmount, styles.expense]}>-{formatAmount(totalExpense)}</Text>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  card: {
    margin: theme.spacing.lg, padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  label: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  amount: { fontSize: theme.fontSize.title, fontWeight: 'bold', marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, alignItems: 'center' },
  itemLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  itemAmount: { fontSize: theme.fontSize.lg, fontWeight: '600' },
  separator: { width: 1, height: 30, backgroundColor: theme.colors.border },
  income: { color: theme.colors.success },
  expense: { color: theme.colors.danger },
});