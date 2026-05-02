export const calculateDaysRemaining = (purchaseDate: string, returnWindowDays: number): number => {
  const purchase = new Date(purchaseDate);
  const deadline = new Date(purchase);
  deadline.setDate(purchase.getDate() + returnWindowDays);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  return diffDays;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
