import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getBudgets, upsertBudget, deleteBudget } from '../services/budgets';
import { getTransactions } from '../services/transactions';
import { Budget, Transaction } from '../types';
import { formatAmount, getCategoryKey } from '../utils/format';
import { EXPENSE_CATEGORIES } from '../constants/categories';

interface Props {
  onBack: () => void;
}

export const BudgetScreen = ({ onBack }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [inputAmount, setInputAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, t] = await Promise.all([getBudgets(), getTransactions()]);
      setBudgets(b);
      setTransactions(t);
    } catch (error: any) {
      Alert.alert(tr('error.title', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getCurrentMonthExpense = (category: string): number => {
    const now = new Date();
    return transactions
      .filter((t) =>
        t.type === 'expense' &&
        t.category === category &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBudgetStatus = (spent: number, budget: number): 'ok' | 'warning' | 'danger' => {
    const ratio = spent / budget;
    if (ratio >= 1) return 'danger';
    if (ratio >= 0.8) return 'warning';
    return 'ok';
  };

  const handleOpenModal = (category?: string, amount?: number) => {
    setSelectedCategory(category ?? EXPENSE_CATEGORIES[0]);
    setInputAmount(amount ? String(amount / 100) : '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const parsed = parseFloat(inputAmount.replace(',', '.'));
    if (!inputAmount || isNaN(parsed) || parsed <= 0) {
      Alert.alert(tr('error.title', 'Erreur'), tr('budget.invalidAmount', 'Montant invalide.'));
      return;
    }
    setSaving(true);
    try {
      await upsertBudget(selectedCategory, Math.round(parsed * 100));
      setModalVisible(false);
      load();
    } catch (error: any) {
      Alert.alert(tr('error.title', 'Erreur'), error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (budget: Budget) => {
    Alert.alert(
      tr('budget.deleteTitle', 'Supprimer'),
      tr('budget.deleteConfirm', 'Supprimer ce budget ?'),
      [
        { text: tr('cancel', 'Annuler'), style: 'cancel' },
        {
          text: tr('delete', 'Supprimer'), style: 'destructive',
          onPress: async () => {
            try { await deleteBudget(budget.id); load(); }
            catch (error: any) { Alert.alert(tr('error.title', 'Erreur'), error.message); }
          },
        },
      ]
    );
  };

  const categoriesWithoutBudget = EXPENSE_CATEGORIES.filter(
    (cat) => !budgets.find((b) => b.category === cat)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('budget.title', 'Budgets')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>

          {/* Budgets existants */}
          {budgets.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{tr('budget.active', 'Budgets actifs')}</Text>
              {budgets.map((budget) => {
                const spent = getCurrentMonthExpense(budget.category);
                const status = getBudgetStatus(spent, budget.amount);
                const ratio = Math.min(spent / budget.amount, 1);

                return (
                  <View key={budget.id} style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                      <Text style={styles.budgetCategory}>
                        {tr(getCategoryKey(budget.category), budget.category)}
                      </Text>
                      <View style={styles.budgetActions}>
                        <TouchableOpacity onPress={() => handleOpenModal(budget.category, budget.amount)}>
                          <Text style={styles.actionIcon}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(budget)}>
                          <Text style={styles.actionIcon}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.budgetAmounts}>
                      <Text style={[
                        styles.budgetSpent,
                        status === 'danger' ? styles.danger : status === 'warning' ? styles.warning : styles.ok
                      ]}>
                        {formatAmount(spent)}
                      </Text>
                      <Text style={styles.budgetSeparator}>/</Text>
                      <Text style={styles.budgetMax}>{formatAmount(budget.amount)}</Text>
                    </View>

                    {/* Barre de progression */}
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill,
                        {
                          width: `${ratio * 100}%` as any,
                          backgroundColor: status === 'danger'
                            ? theme.colors.danger
                            : status === 'warning'
                            ? theme.colors.warning
                            : theme.colors.success,
                        },
                      ]} />
                    </View>

                    {status === 'danger' && (
                      <Text style={styles.alertText}>
                        ⚠️ {tr('budget.exceeded', 'Budget dépassé !')}
                      </Text>
                    )}
                    {status === 'warning' && (
                      <Text style={[styles.alertText, styles.warning]}>
                        ⚠️ {tr('budget.approaching', 'Budget presque atteint')}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Ajouter un budget */}
          {categoriesWithoutBudget.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{tr('budget.add', 'Ajouter un budget')}</Text>
              {categoriesWithoutBudget.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.addRow}
                  onPress={() => handleOpenModal(cat)}
                >
                  <Text style={styles.addRowText}>{tr(getCategoryKey(cat), cat)}</Text>
                  <Text style={styles.addRowIcon}>+</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

        </ScrollView>
      )}

      {/* Modal saisie budget */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1}>
            <Text style={styles.modalTitle}>
              {tr('budget.setFor', 'Budget pour')} {tr(getCategoryKey(selectedCategory), selectedCategory)}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={inputAmount}
              onChangeText={setInputAmount}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>{tr('cancel', 'Annuler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator color={theme.colors.surface} />
                  : <Text style={styles.modalSaveText}>{tr('budget.save', 'Enregistrer')}</Text>
                }
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
  section: { gap: theme.spacing.md },
  sectionTitle: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  budgetCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.sm,
  },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetCategory: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  budgetActions: { flexDirection: 'row', gap: theme.spacing.md },
  actionIcon: { fontSize: theme.fontSize.lg },
  budgetAmounts: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  budgetSpent: { fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  budgetSeparator: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  budgetMax: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  progressBar: {
    height: 8, backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.full, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: theme.borderRadius.full },
  alertText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.danger },
  ok: { color: theme.colors.success },
  warning: { color: theme.colors.warning },
  danger: { color: theme.colors.danger },
  addRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
  },
  addRowText: { fontSize: theme.fontSize.md, color: theme.colors.text },
  addRowIcon: { fontSize: theme.fontSize.xl, color: theme.colors.primary, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg, padding: theme.spacing.xl, gap: theme.spacing.lg,
  },
  modalTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center' },
  modalInput: {
    backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, fontSize: theme.fontSize.xl, color: theme.colors.text,
    borderWidth: 1, borderColor: theme.colors.border, textAlign: 'center',
  },
  modalActions: { flexDirection: 'row', gap: theme.spacing.md },
  modalCancelButton: {
    flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.full,
    alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border,
  },
  modalCancelText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, fontWeight: '600' },
  modalSaveButton: {
    flex: 1, backgroundColor: theme.colors.primary, padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full, alignItems: 'center',
  },
  modalSaveText: { color: theme.colors.surface, fontSize: theme.fontSize.md, fontWeight: '600' },
});