import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getProfiles, addProfile, deleteProfile } from '../services/reimbursementProfiles';
import { ReimbursementProfile } from '../types';

interface Props {
  onBack: () => void;
}

export const ReimbursementProfilesScreen = ({ onBack }: Props) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const [profiles, setProfiles] = useState<ReimbursementProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (error: any) {
      Alert.alert(tr('error.title', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert(tr('error.title', 'Erreur'), tr('profiles.nameRequired', 'Le nom est requis.'));
      return;
    }
    setSaving(true);
    try {
      await addProfile(name.trim());
      setName('');
      setModalVisible(false);
      load();
    } catch (error: any) {
      Alert.alert(tr('error.title', 'Erreur'), error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (profile: ReimbursementProfile) => {
    Alert.alert(
      tr('profiles.deleteTitle', 'Supprimer'),
      tr('profiles.deleteConfirm', `Supprimer le profil "${profile.name}" ?`),
      [
        { text: tr('cancel', 'Annuler'), style: 'cancel' },
        {
          text: tr('delete', 'Supprimer'), style: 'destructive',
          onPress: async () => {
            try { await deleteProfile(profile.id); load(); }
            catch (error: any) { Alert.alert(tr('error.title', 'Erreur'), error.message); }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('profiles.title', 'Profils')}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {profiles.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>👤</Text>
              <Text style={styles.emptyTitle}>{tr('profiles.empty', 'Aucun profil')}</Text>
              <Text style={styles.emptySubtitle}>{tr('profiles.emptySubtitle', 'Ajoute des profils pour suivre tes remboursements.')}</Text>
            </View>
          ) : (
            profiles.map((profile) => (
              <View key={profile.id} style={styles.profileCard}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>{profile.name[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.profileName}>{profile.name}</Text>
                <TouchableOpacity onPress={() => handleDelete(profile)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1}>
            <Text style={styles.modalTitle}>{tr('profiles.addTitle', 'Nouveau profil')}</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder={tr('profiles.namePlaceholder', 'Ex: Maman, Papa, Alex...')}
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
              autoCapitalize="words"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>{tr('cancel', 'Annuler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleAdd} disabled={saving}>
                {saving
                  ? <ActivityIndicator color={theme.colors.surface} />
                  : <Text style={styles.modalSaveText}>{tr('profiles.add', 'Ajouter')}</Text>
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
  addButton: { color: theme.colors.primary, fontSize: 28, fontWeight: 'bold', width: 60, textAlign: 'right' },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
  },
  profileAvatar: {
    width: 40, height: 40, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  profileAvatarText: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.primary },
  profileName: { flex: 1, fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  deleteIcon: { fontSize: theme.fontSize.lg },
  empty: { alignItems: 'center', marginTop: 60, gap: theme.spacing.md },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  emptySubtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg, padding: theme.spacing.xl, gap: theme.spacing.lg,
  },
  modalTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center' },
  modalInput: {
    backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, fontSize: theme.fontSize.lg, color: theme.colors.text,
    borderWidth: 1, borderColor: theme.colors.border,
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