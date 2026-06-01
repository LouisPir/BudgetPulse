import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getTransactions } from '../services/transactions';
import { Transaction } from '../types';
import { formatAmount } from '../utils/format';
import * as FileSystem from 'expo-file-system/legacy';

interface Props {
  onBack: () => void;
}

const generateHTML = (
  transactions: Transaction[],
  month: string,
  totalIncome: number,
  totalExpense: number,
  balance: number,
  tr: (key: string, defaultFr: string) => string
): string => {
  const expensesByCategory = transactions
    .filter((t) => t.type === 'expense' && t.reimbursement_status !== 'reimbursed')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const categoryRows = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => `
      <tr>
        <td>${cat}</td>
        <td style="text-align:right;color:#EF4444;">${formatAmount(amount)}</td>
        <td style="text-align:right;color:#6B7280;">${totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0}%</td>
      </tr>
    `).join('');

  const transactionRows = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((t) => `
      <tr>
        <td>${t.date}</td>
        <td>${t.title ?? t.category}</td>
        <td>${t.category}</td>
        <td style="text-align:right;color:${t.type === 'income' ? '#10B981' : '#EF4444'};">
          ${t.type === 'income' ? '+' : '-'}${formatAmount(t.amount)}
        </td>
        <td style="text-align:center;">
          ${t.reimbursement_status === 'pending' ? '🕐' : t.reimbursement_status === 'reimbursed' ? '✅' : ''}
        </td>
      </tr>
    `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1A1A2E; }
        h1 { color: #6C63FF; font-size: 28px; margin-bottom: 4px; }
        h2 { font-size: 16px; color: #6B7280; margin-bottom: 32px; font-weight: normal; }
        h3 { font-size: 14px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; }
        .summary { display: flex; gap: 16px; margin-bottom: 32px; }
        .summary-card { flex: 1; padding: 16px; border-radius: 12px; text-align: center; }
        .summary-card.income { background: #D1FAE5; }
        .summary-card.expense { background: #FEE2E2; }
        .summary-card.balance { background: #EEF2FF; }
        .summary-label { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
        .summary-amount { font-size: 20px; font-weight: bold; }
        .income-text { color: #10B981; }
        .expense-text { color: #EF4444; }
        .balance-text { color: #6C63FF; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #F3F4F6; padding: 10px 12px; text-align: left; font-size: 12px; color: #6B7280; }
        td { padding: 10px 12px; border-bottom: 1px solid #E5E7EB; }
        tr:last-child td { border-bottom: none; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9CA3AF; }
      </style>
    </head>
    <body>
      <h1>💰 BudgetPulse</h1>
      <h2>${month}</h2>

      <h3>Résumé</h3>
      <div class="summary">
        <div class="summary-card income">
          <div class="summary-label">Revenus</div>
          <div class="summary-amount income-text">+${formatAmount(totalIncome)}</div>
        </div>
        <div class="summary-card expense">
          <div class="summary-label">Dépenses</div>
          <div class="summary-amount expense-text">-${formatAmount(totalExpense)}</div>
        </div>
        <div class="summary-card balance">
          <div class="summary-label">Solde</div>
          <div class="summary-amount balance-text">${formatAmount(balance)}</div>
        </div>
      </div>

      <h3>Dépenses par catégorie</h3>
      <table>
        <thead>
          <tr>
            <th>Catégorie</th>
            <th style="text-align:right;">Montant</th>
            <th style="text-align:right;">%</th>
          </tr>
        </thead>
        <tbody>${categoryRows}</tbody>
      </table>

      <h3>Transactions</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Titre</th>
            <th>Catégorie</th>
            <th style="text-align:right;">Montant</th>
            <th style="text-align:center;">Remb.</th>
          </tr>
        </thead>
        <tbody>${transactionRows}</tbody>
      </table>

      <div class="footer">Généré par BudgetPulse • ${new Date().toLocaleDateString('fr-FR')}</div>
    </body>
    </html>
  `;
};

export const ExportScreen = ({ onBack }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const load = useCallback(async () => {
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

  useEffect(() => { load(); }, [load]);

  const goToPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    if (next <= new Date()) setCurrentDate(next);
  };

  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
  });

  const totalIncome = filtered
    .filter((t) => t.type === 'income' && t.reimbursement_status !== 'reimbursed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filtered
    .filter((t) => t.type === 'expense' && t.reimbursement_status !== 'reimbursed')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const monthLabel = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const handleExport = async () => {
    setExporting(true);
    try {
        const html = generateHTML(filtered, monthLabel, totalIncome, totalExpense, balance, tr);
        const { uri } = await Print.printToFileAsync({ html, base64: false });

        const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
        const yearStr = currentDate.getFullYear();
        const fileName = `budgetpulse-${monthStr}-${yearStr}.pdf`;
        const destUri = `${FileSystem.cacheDirectory}${fileName}`;

        await FileSystem.copyAsync({ from: uri, to: destUri });

        await Sharing.shareAsync(destUri, {
        mimeType: 'application/pdf',
        dialogTitle: `BudgetPulse — ${monthLabel}`,
        UTI: 'com.adobe.pdf',
        });
    } catch (error: any) {
        Alert.alert(tr('error.title', 'Erreur'), error.message);
    } finally {
        setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('export.title', 'Export PDF')}</Text>
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

          {/* Aperçu */}
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{tr('export.preview', 'Aperçu du PDF')}</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>{tr('home.income', 'Revenus')}</Text>
              <Text style={[styles.previewValue, styles.income]}>+{formatAmount(totalIncome)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>{tr('home.expenses', 'Dépenses')}</Text>
              <Text style={[styles.previewValue, styles.expense]}>-{formatAmount(totalExpense)}</Text>
            </View>
            <View style={[styles.previewRow, styles.previewRowBorder]}>
              <Text style={styles.previewLabel}>{tr('home.balance', 'Solde')}</Text>
              <Text style={[styles.previewValue, balance >= 0 ? styles.income : styles.expense]}>
                {formatAmount(balance)}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>{tr('export.transactions', 'Transactions')}</Text>
              <Text style={styles.previewValue}>{filtered.length}</Text>
            </View>
          </View>

          {filtered.length === 0 && (
            <Text style={styles.empty}>{tr('export.empty', 'Aucune transaction ce mois-ci')}</Text>
          )}

          <TouchableOpacity
            style={[styles.exportButton, (exporting || filtered.length === 0) && styles.exportButtonDisabled]}
            onPress={handleExport}
            disabled={exporting || filtered.length === 0}
          >
            {exporting
              ? <ActivityIndicator color={theme.colors.surface} />
              : <Text style={styles.exportButtonText}>📤 {tr('export.button', 'Exporter en PDF')}</Text>
            }
          </TouchableOpacity>

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
  previewCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.sm,
  },
  previewTitle: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  previewRowBorder: { borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: theme.spacing.xs, paddingTop: theme.spacing.sm },
  previewLabel: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  previewValue: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  income: { color: theme.colors.success },
  expense: { color: theme.colors.danger },
  empty: { textAlign: 'center', color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
  exportButton: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg, alignItems: 'center',
  },
  exportButtonDisabled: { opacity: 0.5 },
  exportButtonText: { color: theme.colors.surface, fontSize: theme.fontSize.lg, fontWeight: '700' },
});