import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getTransactions } from '../services/transactions';
import { Transaction } from '../types';
import { formatAmount, getCategoryKey } from '../utils/format';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CHART_COLORS = [
  '#6C63FF', '#FF6584', '#43D399', '#F59E0B', '#3B82F6',
  '#EC4899', '#10B981', '#F97316', '#8B5CF6', '#14B8A6',
];

interface Props {
  onBack: () => void;
}

export const StatsScreen = ({ onBack }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const goToPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    if (next <= new Date()) setCurrentDate(next);
  };

  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  const filtered = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === currentDate.getFullYear() && 
            d.getMonth() === currentDate.getMonth();
    })
    .filter((t) => t.reimbursement_status !== 'reimbursed');

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const expensesByCategory = filtered
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const incomeByCategory = filtered
    .filter((t) => t.type === 'income')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const expenseChartData = Object.entries(expensesByCategory).map(([cat, amount], i) => ({
    name: tr(getCategoryKey(cat), cat),
    amount,
    color: CHART_COLORS[i % CHART_COLORS.length],
    legendFontColor: theme.colors.text,
    legendFontSize: 12,
  }));

  const incomeChartData = Object.entries(incomeByCategory).map(([cat, amount], i) => ({
    name: tr(getCategoryKey(cat), cat),
    amount,
    color: CHART_COLORS[i % CHART_COLORS.length],
    legendFontColor: theme.colors.text,
    legendFontSize: 12,
  }));

  const monthLabel = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('stats.title', 'Statistiques')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>

          {/* Navigation mois */}
          <View style={styles.monthNav}>
            <TouchableOpacity style={styles.monthButton} onPress={goToPrevMonth}>
              <Text style={styles.monthButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity
              style={[styles.monthButton, isCurrentMonth && styles.monthButtonDisabled]}
              onPress={goToNextMonth}
              disabled={isCurrentMonth}
            >
              <Text style={[styles.monthButtonText, isCurrentMonth && styles.monthButtonTextDisabled]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Résumé mensuel */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>{tr('stats.summary', 'Résumé du mois')}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{tr('home.income', 'Revenus')}</Text>
                <Text style={[styles.summaryAmount, styles.income]}>+{formatAmount(totalIncome)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{tr('home.expenses', 'Dépenses')}</Text>
                <Text style={[styles.summaryAmount, styles.expense]}>-{formatAmount(totalExpense)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{tr('home.balance', 'Solde')}</Text>
                <Text style={[styles.summaryAmount, balance >= 0 ? styles.income : styles.expense]}>
                  {formatAmount(balance)}
                </Text>
              </View>
            </View>
          </View>

          {/* Graphique dépenses */}
          {expenseChartData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.sectionTitle}>{tr('stats.expenseChart', 'Dépenses par catégorie')}</Text>
              <PieChart
                data={expenseChartData}
                width={SCREEN_WIDTH - theme.spacing.lg * 2 - theme.spacing.lg * 2}
                height={180}
                chartConfig={{
                  color: () => theme.colors.primary,
                  labelColor: () => theme.colors.text,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute={false}
              />
              {Object.entries(expensesByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount], i) => (
                  <View key={cat} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                    <Text style={styles.legendCategory}>{tr(getCategoryKey(cat), cat)}</Text>
                    <Text style={styles.legendAmount}>{formatAmount(amount)}</Text>
                    <Text style={styles.legendPercent}>
                      {totalExpense > 0 ? `${Math.round((amount / totalExpense) * 100)}%` : '0%'}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          {/* Graphique revenus */}
          {incomeChartData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.sectionTitle}>{tr('stats.incomeChart', 'Revenus par catégorie')}</Text>
              <PieChart
                data={incomeChartData}
                width={SCREEN_WIDTH - theme.spacing.lg * 2 - theme.spacing.lg * 2}
                height={180}
                chartConfig={{
                  color: () => theme.colors.primary,
                  labelColor: () => theme.colors.text,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute={false}
              />
              {Object.entries(incomeByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount], i) => (
                  <View key={cat} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                    <Text style={styles.legendCategory}>{tr(getCategoryKey(cat), cat)}</Text>
                    <Text style={styles.legendAmount}>{formatAmount(amount)}</Text>
                    <Text style={styles.legendPercent}>
                      {totalIncome > 0 ? `${Math.round((amount / totalIncome) * 100)}%` : '0%'}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          {filtered.length === 0 && (
            <Text style={styles.empty}>{tr('stats.empty', 'Aucune transaction ce mois-ci')}</Text>
          )}

        </ScrollView>
      )}
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
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingBottom: 40 },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
  },
  monthButton: {
    width: 36, height: 36, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center',
  },
  monthButtonDisabled: { opacity: 0.3 },
  monthButtonText: { fontSize: theme.fontSize.xxl, color: theme.colors.primary, fontWeight: 'bold' },
  monthButtonTextDisabled: { color: theme.colors.textSecondary },
  monthLabel: { fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.text, textTransform: 'capitalize' },
  summaryCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md,
  },
  sectionTitle: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text },
  summaryRow: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  summaryAmount: { fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  income: { color: theme.colors.success },
  expense: { color: theme.colors.danger },
  chartCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md,
  },
  legendRow: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendCategory: { flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.text },
  legendAmount: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text },
  legendPercent: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, width: 35, textAlign: 'right' },
  empty: { textAlign: 'center', color: theme.colors.textSecondary, fontSize: theme.fontSize.md, marginTop: 40 },
});