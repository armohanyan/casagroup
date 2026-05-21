export type ProjectStatus = "Under Construction" | "Ready" | "Sold Out";
export type ApartmentStatus = "Available" | "Reserved" | "Sold";

export interface NearbyPlace {
  name: string;
  distance: string;
  category: "transport" | "education" | "health" | "leisure" | "shopping";
}

export interface Amenity {
  icon: string;
  label: string;
}

export interface PaymentOption {
  title: string;
  description: string;
}

export interface Apartment {
  id: string;
  projectId: string;
  floor: number;
  rooms: number;
  area: number;
  price: number;
  status: ApartmentStatus;
  viewType: string;
  floorPlanImage: string;
  gallery: string[];
  balcony?: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  location: string;
  city: string;
  description: string;
  longDescription: string;
  images: string[];
  videoUrl?: string;
  droneVideos?: { title: string; url: string; thumbnail?: string }[];
  startingPrice: number;
  completionDate: string;
  status: ProjectStatus;
  availableApartmentsCount: number;
  totalApartments: number;
  floors: number;
  amenities: Amenity[];
  nearbyPlaces: NearbyPlace[];
  paymentOptions: PaymentOption[];
  apartments: Apartment[];
  developer: string;
  architect?: string;
  coordinates: { lat: number; lng: number };
  tags: string[];
  featured: boolean;
}

export interface InquiryFormData {
  fullName: string;
  phone: string;
  email: string;
  interestedProject: string;
  message: string;
}

export interface TeamMemberDisplay {
  name: string;
  role: string;
  imageUrl?: string;
}

export interface TeamSectionDisplay {
  sectionEyebrow: string;
  sectionTitle: string;
  members: TeamMemberDisplay[];
}

/** One row in the Airtable "Team" table. */
export interface TeamMemberRow {
  id: string;
  sectionKey: string;
  sectionSort: number;
  memberSort: number;
  sectionEyebrowEn: string;
  sectionEyebrowHy: string;
  sectionTitleEn: string;
  sectionTitleHy: string;
  nameEn: string;
  nameHy: string;
  roleEn: string;
  roleHy: string;
  photoUrl?: string;
  published?: boolean;
}
