import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { addTransaction, updateTransaction } from '../services/transactions';
import { Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { getCategoryKey } from '../utils/format';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
  transaction?: Transaction;
}

export const AddTransactionScreen = ({ onBack, onSuccess, transaction }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const [amount, setAmount] = useState(transaction ? String(transaction.amount / 100) : '');
  const [type, setType] = useState<'expense' | 'income'>(transaction?.type ?? 'expense');
  const [title, setTitle] = useState(transaction?.title ?? '');
  const [category, setCategory] = useState(transaction?.category ?? EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState(transaction?.note ?? '');
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const isEditing = !!transaction;
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    const newCategories = newType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    setCategory(newCategories[0]);
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(tr('error.title', 'Erreur'), tr('transaction.invalidAmount', 'Montant invalide.'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: Math.round(parsedAmount * 100),
        type,
        category,
        title: title.trim() || null,
        note: note.trim() || null,
        date,
      };

      if (isEditing) {
        await updateTransaction(transaction.id, payload);
      } else {
        await addTransaction(payload);
      }
      onSuccess();
    } catch (error: any) {
      Alert.alert(tr('error.title', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? tr('transaction.edit', 'Modifier') : tr('transaction.add', 'Ajouter')}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>

          {/* Type */}
          <Text style={styles.label}>{tr('transaction.type', 'Type')}</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.typeButtonExpense]}
              onPress={() => handleTypeChange('expense')}
            >
              <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                💸 {tr('transaction.expense', 'Dépense')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonIncome]}
              onPress={() => handleTypeChange('income')}
            >
              <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                💰 {tr('transaction.income', 'Revenu')}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Titre */}
          <Text style={styles.label}>{tr('transaction.title', 'Titre (optionnel)')}</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={tr('transaction.titlePlaceholder', `Ex: ${type === 'expense' ? 'Courses Auchan' : 'Salaire février'}`)}
            placeholderTextColor={theme.colors.textSecondary}
          />
          {/* Montant */}
          <Text style={styles.label}>{tr('transaction.amount', 'Montant (€)')}</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor={theme.colors.textSecondary}
          />

          {/* Catégorie */}
          <Text style={styles.label}>{tr('transaction.category', 'Catégorie')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                  {tr(getCategoryKey(cat), cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Note */}
          <Text style={styles.label}>{tr('transaction.note', 'Note (optionnel)')}</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder={tr('transaction.notePlaceholder', 'Ajoute une note...')}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />

          {/* Date */}
          <Text style={styles.label}>{tr('transaction.date', 'Date (YYYY-MM-DD)')}</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="2025-01-01"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color={theme.colors.surface} />
              : <Text style={styles.buttonText}>
                  {isEditing ? tr('transaction.save', 'Enregistrer') : tr('transaction.add', 'Ajouter')}
                </Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  content: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.xs },
  input: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text,
    borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md,
  },
  noteInput: { height: 80, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  typeButton: {
    flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  typeButtonExpense: { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger },
  typeButtonIncome: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  typeButtonText: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.textSecondary },
  typeButtonTextActive: { color: theme.colors.surface },
  categoryScroll: { marginBottom: theme.spacing.md },
  categoryChip: {
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border, marginRight: theme.spacing.sm,
  },
  categoryChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryChipText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  categoryChipTextActive: { color: theme.colors.surface },
  button: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, alignItems: 'center', marginTop: theme.spacing.md,
  },
  buttonText: { color: theme.colors.surface, fontSize: theme.fontSize.lg, fontWeight: '600' },
});