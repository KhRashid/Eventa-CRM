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
  cuisine: string[];
  district: string;
  facilities: string[];
  location_lat: number;
  location_lng: number;
  media: Media;
  menu: MenuCategory[];
  policies: Policies;
  services: string[];
  suitable_for: string[];
  tags: string[];
}
