import { supabase } from './supabase';
import { ReimbursementProfile } from '../types';

export const getProfiles = async (): Promise<ReimbursementProfile[]> => {
  const { data, error } = await supabase
    .from('reimbursement_profiles')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
};

export const addProfile = async (name: string): Promise<ReimbursementProfile> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('reimbursement_profiles')
    .insert({ user_id: user.id, name: name.trim() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProfile = async (id: string): Promise<void> => {
  const { error } = await supabase.from('reimbursement_profiles').delete().eq('id', id);
  if (error) throw error;
};