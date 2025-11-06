export interface Contact {
  email: string;
  person: string;
  phone: string;
}

export interface Media {
  photos: string[];
  videos: string[];
}

export interface MenuItem {
  name: string;
  price_azn: number;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface Policies {
  alcohol_allowed: boolean;
  corkage_fee_azn: number;
  outside_catering_allowed: boolean;
  price_per_person_azn_from: number;
  price_per_person_azn_to: number;
}

export interface Venue {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  address: string;
  base_rental_fee_azn: number;
  capacity_max: number;
  capacity_min: number;
  contact: Contact;
  district: string;
  location_lat: number;
  location_lng: number;
  media: Media;
  menu: MenuCategory[];
  policies: Policies;
  tags: string[];

  // Dynamic fields based on lookups
  customFields: { [key: string]: string[] };
  
  // Legacy fields for backward compatibility
  cuisine?: string[];
  facilities?: string[];
  services?: string[];
  suitable_for?: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  roleIds?: string[];
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
}

export interface UserWithRoles extends UserProfile {
    roles: Role[];
}

export interface Lookup {
    id: string;      // Firestore document ID
    key: string;     // Machine-readable key (e.g., 'cuisine', 'event_type')
    name: string;    // Human-readable name (e.g., 'Кухня', 'Тип мероприятия')
    values: string[];
}