export type UserRole = 'USER' | 'SHOP';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

export interface UserSafe {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  shop_id?: number;
  created_at: string;
}

export interface Shop {
  id: number;
  user_id: number;
  shop_name: string;
  owner_name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  services: string[]; // parsed JSON array
  is_available: boolean; // 1 or 0 in SQLite
  rating: number;
  rating_count: number;
  created_at: string;
  distance?: number; // Calculated distance in KM
}

export interface Bike {
  id: number;
  user_id: number;
  brand: string;
  model: string;
  registration_number: string;
  year: number;
  color?: string;
  fuel_type?: string;
  created_at: string;
}

export type RequestStatus =
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type BikeProblem =
  | 'Puncture'
  | 'Battery'
  | 'Engine'
  | 'Brake'
  | 'Tyre'
  | 'Chain'
  | 'Electrical'
  | 'Fuel'
  | 'Accident'
  | 'Other';

export interface HelpRequest {
  id: number;
  user_id: number;
  bike_id: number;
  problem: BikeProblem;
  description: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: RequestStatus;
  shop_id: number | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  user_name?: string;
  bike_brand?: string;
  bike_model?: string;
  bike_registration?: string;
  bike_year?: number;
  shop_name?: string;
  shop_owner?: string;
  shop_phone?: string;
  shop_address?: string;
  shop_latitude?: number;
  shop_longitude?: number;
  shop_rating?: number;
  distance?: number;
  user_rating?: number;
}

export interface Notification {
  id: number;
  user_id?: number | null;
  shop_id?: number | null;
  request_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Rating {
  id: number;
  request_id: number;
  user_id: number;
  shop_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
}
