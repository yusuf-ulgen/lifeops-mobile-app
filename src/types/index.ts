export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  next_billing_date: string;
  created_at?: string;
}

export interface ReturnItem {
  id: string;
  user_id: string;
  product_name: string;
  store_name: string;
  price: number;
  purchase_date: string;
  return_window_days: number;
  is_returned: boolean;
  created_at?: string;
}

export interface LifeEvent {
  id: string;
  user_id: string;
  event_title: string;
  event_type: string;
  due_date: string;
  created_at?: string;
}
