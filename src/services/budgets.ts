import { supabase } from './supabase';
import { Budget } from '../types';

export const getBudgets = async (): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('category');
  if (error) throw error;
  return data ?? [];
};

export const upsertBudget = async (category: string, amount: number): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { error } = await supabase
    .from('budgets')
    .upsert({ user_id: user.id, category, amount }, { onConflict: 'user_id,category' });
  if (error) throw error;
};

export const deleteBudget = async (id: string): Promise<void> => {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
};