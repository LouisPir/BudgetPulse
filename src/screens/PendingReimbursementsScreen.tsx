import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getTransactions, updateTransaction } from '../services/transactions';
import { Transaction } from '../types';
import { formatAmount, getCategoryKey } from '../utils/format';

interface Props {
  onBack: () => void;
}

export const PendingReimbursementsScreen = ({ onBack }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data.filter((t) => t.reimbursement_status === 'pending'));
    } catch (error: any) {
      Alert.alert(tr('error.title', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkReimbursed = (transaction: Transaction) => {
    Alert.alert(
      tr('reimbursement.markTitle', 'Marquer comme remboursé'),
      tr('reimbursement.markConfirm', 'Marquer cette transaction comme remboursée ?'),
      [
        { text: tr('cancel', 'Annuler'), style: 'cancel' },
        {
          text: tr('reimbursement.mark', 'Remboursé ✓'),
          onPress: async () => {
            try {
              await updateTransaction(transaction.id, { reimbursement_status: 'reimbursed' });
              load();
            } catch (error: any) {
              Alert.alert(tr('error.title', 'Erreur'), error.message);
            }
          },
        },
      ]
    );
  };

  // Grouper par personne
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = t.reimbursed_by ?? tr('reimbursement.unknown', 'Inconnu');
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const totalPending = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('reimbursement.title', 'Remboursements')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.colors.primary} />
      ) : transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>✅</Text>
          <Text style={styles.emptyTitle}>{tr('reimbursement.empty', 'Tout est remboursé !')}</Text>
          <Text style={styles.emptySubtitle}>{tr('reimbursement.emptySubtitle', 'Aucun remboursement en attente.')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>

          {/* Total en attente */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{tr('reimbursement.total', 'Total en attente')}</Text>
            <Text style={styles.totalAmount}>{formatAmount(totalPending)}</Text>
          </View>

          {/* Groupé par personne */}
          {Object.entries(grouped).map(([person, txs]) => {
            const total = txs.reduce((sum, t) => sum + t.amount, 0);
            return (
              <View key={person} style={styles.group}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupAvatar}>
                    <Text style={styles.groupAvatarText}>{person[0].toUpperCase()}</Text>
                  </View>
                  <Text style={styles.groupName}>{person}</Text>
                  <Text style={styles.groupTotal}>{formatAmount(total)}</Text>
                </View>

                {txs.map((t) => (
                  <View key={t.id} style={styles.transactionCard}>
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionTitle}>
                        {t.title ?? tr(getCategoryKey(t.category), t.category)}
                      </Text>
                      <Text style={styles.transactionCategory}>
                        {tr(getCategoryKey(t.category), t.category)}
                      </Text>
                      <Text style={styles.transactionDate}>{t.date}</Text>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text style={styles.transactionAmount}>{formatAmount(t.amount)}</Text>
                      <TouchableOpacity
                        style={styles.markButton}
                        onPress={() => handleMarkReimbursed(t)}
                      >
                        <Text style={styles.markButtonText}>🕐 {tr('transaction.reimbursement.pending', 'À rembourser')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}

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
  totalCard: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg, alignItems: 'center', gap: theme.spacing.xs,
  },
  totalLabel: { fontSize: theme.fontSize.md, color: theme.colors.surface, opacity: 0.8 },
  totalAmount: { fontSize: theme.fontSize.title, fontWeight: 'bold', color: theme.colors.surface },
  group: { gap: theme.spacing.sm },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  groupAvatar: {
    width: 36, height: 36, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  groupAvatarText: { fontSize: theme.fontSize.md, fontWeight: 'bold', color: theme.colors.primary },
  groupName: { flex: 1, fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text },
  groupTotal: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.primary },
  transactionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
  },
  transactionLeft: { flex: 1, gap: 2 },
  transactionTitle: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  transactionCategory: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  transactionDate: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  transactionRight: { alignItems: 'flex-end', gap: theme.spacing.sm },
  transactionAmount: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  markButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  markButtonText: { color: theme.colors.warning, fontSize: theme.fontSize.sm, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  emptySubtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
});