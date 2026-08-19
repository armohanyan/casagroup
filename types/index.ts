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
  /** Armenian amenity label; falls back to `label` when missing. */
  labelHy?: string;
  /** Russian amenity label; falls back to English then Armenian. */
  labelRu?: string;
}

export interface PaymentOption {
  title: string;
  description: string;
}

/** Polygon overlay on a building floor plate; points are % of image width/height (0–100). */
export interface FloorHotspot {
  apartmentId: string;
  points: [number, number][];
}

/** One floor plate for a building (image + apartment hotspots). */
export interface BuildingFloor {
  id: string;
  buildingId: string;
  /** Display label: "18", "P", "-1", etc. */
  label: string;
  sortOrder: number;
  imageUrl: string;
  hotspots: FloorHotspot[];
}

export type BuildingKind = "building" | "neighborhood";

export interface Building {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
  /** `building` (default) has floor plates; `neighborhood` has houses, land, price, pictures. */
  kind?: BuildingKind;
  /** Neighborhood land area in m². */
  landArea?: number;
  /** Neighborhood listing / starting price (AMD). */
  price?: number;
  /** Neighborhood photos. */
  images?: string[];
  floors: BuildingFloor[];
}

export interface Apartment {
  id: string;
  projectId: string;
  buildingId?: string;
  /** Human-facing unit number set in admin (e.g. "12A", "405"). */
  apartmentNumber?: string;
  floor: number;
  rooms: number;
  area: number;
  /** Plot / land area in m² (houses in a neighborhood). */
  landArea?: number;
  price: number;
  status: ApartmentStatus;
  viewType: string;
  viewTypeHy?: string;
  viewTypeRu?: string;
  floorPlanImage: string;
  planPdfUrl?: string;
  description?: string;
  descriptionHy?: string;
  descriptionRu?: string;
  gallery: string[];
  balcony?: boolean;
}

export type GalleryCategory =
  | "exterior"
  | "interior"
  | "entrance"
  | "lobby"
  | "parking"
  | "green"
  | "rooftop"
  | "construction"
  | "drone"
  | "night";

export interface ProjectGalleryItem {
  url: string;
  category: GalleryCategory;
}

export interface Project {
  id: string;
  title: string;
  /** Armenian project title; falls back to `title` when missing. */
  titleHy?: string;
  titleRu?: string;
  slug: string;
  location: string;
  locationHy?: string;
  locationRu?: string;
  city: string;
  cityHy?: string;
  cityRu?: string;
  description: string;
  /** Armenian short description; falls back to `description` when missing. */
  descriptionHy?: string;
  descriptionRu?: string;
  longDescription: string;
  longDescriptionHy?: string;
  longDescriptionRu?: string;
  images: string[];
  gallery?: ProjectGalleryItem[];
  videoUrl?: string;
  droneVideos?: { title: string; titleHy?: string; titleRu?: string; url: string; thumbnail?: string }[];
  startingPrice: number;
  completionDate: string;
  completionDateHy?: string;
  completionDateRu?: string;
  status: ProjectStatus;
  availableApartmentsCount: number;
  totalApartments: number;
  floors: number;
  amenities: Amenity[];
  nearbyPlaces: NearbyPlace[];
  paymentOptions: PaymentOption[];
  buildings: Building[];
  apartments: Apartment[];
  developer: string;
  architect?: string;
  managementCompany?: string;
  partnerBank?: string;
  constructionStart?: string;
  constructionStartHy?: string;
  constructionStartRu?: string;
  exclusiveSalesRights?: string;
  coordinates: { lat: number; lng: number };
  tags: string[];
  featured: boolean;
  /** Unique browser-session views of this project. */
  viewCount?: number;
}

export interface InquiryFormData {
  fullName: string;
  phone: string;
  email: string;
  interestedProject: string;
  message: string;
  kind?: string;
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

/** One row in the team seed / CMS table. */
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
