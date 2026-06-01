export const formatAmount = (cents: number): string => {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
};

export const getCategoryKey = (category: string): string => {
  return 'category.' + category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
};