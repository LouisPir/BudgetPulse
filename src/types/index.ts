export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  title: string | null;
  note: string | null;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  created_at: string;
}