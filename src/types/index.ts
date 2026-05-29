export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  note: string | null;
  date: string;
  created_at: string;
}