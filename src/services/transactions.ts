import { supabase } from './supabase';
import { Transaction } from '../types';

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...transaction, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTransaction = async (id: string, transaction: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  if (error) throw error;
};