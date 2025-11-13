import firebase from "firebase/compat/app";

export interface Contact {
  email: string;
  person: string;
  phone: string;
}

export interface Media {
  photos: string[];
  videos: string[];
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
  policies: Policies;
  tags: string[];
  customFields: { [key: string]: string[] };
  assignedPackageIds?: string[];
  
  // Legacy fields for backward compatibility
  cuisine?: string[];
  facilities?: string[];
  services?: string[];
  suitable_for?: string[];
  menu?: any[]; // Legacy
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
    id: string;
    key: string;
    name: string;
    values: string[];
}

export interface MenuItem {
    id: string;
    name: string;
    category: string;
    description: string;
    portion_size: string;
    photoUrl: string;
}

export interface MenuPackage {
    id: string;
    name: string;
    price_azn: number;
    itemIds: string[];
}

export interface SingerMedia {
    photos: string[];
    videos: string[];
}

export interface PricingPackage {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    duration_min: number;
    is_active: boolean;
    created_at?: firebase.firestore.Timestamp | string;
    updated_at?: firebase.firestore.Timestamp | string;
}

export interface RepertoireSong {
    id: string;
    title: string;
    original_artist: string;
    language: string;
    genres: string[];
    duration_sec: number | null;
}


export interface Singer {
    id: string;
    slug: string;
    name: string;
    aliases: string[];
    gender: 'female' | 'male' | 'group' | 'duo';
    phones: string[];
    genres: string[];
    tags: string[];
    languages: string[];
    city: string;
    regions_covered: string[];
    contact_public: { [key: string]: string };
    status: 'draft' | 'published' | 'paused';
    created_at: string;
    updated_at: string;
    media: SingerMedia;
    pricing_packages?: PricingPackage[];
    repertoire?: RepertoireSong[];
}