export type ProjectStatus = "Under Construction" | "Ready" | "Sold Out";
export type ApartmentStatus = "Available" | "Reserved" | "Sold";
export type ProjectKind = "building" | "neighborhood";
/**
 * Public apartment sales flow for a building project:
 * - `plans` - apartment plans only
 * - `floors` - single building: exterior → floors → apartments
 * - `buildings` - several buildings on a site map, then the floors flow
 *
 * Legacy DB values `master` / `complex` are normalized to `buildings`.
 */
export type SalesMode = "buildings" | "floors" | "plans";

/** Hotspot on a sales map stage. Points are % of image (0–100). */
export interface MapStageHotspot {
  id: string;
  label: string;
  points: [number, number][];
  /** Optional circular marker position (%). Defaults to polygon centroid. */
  markerX?: number;
  markerY?: number;
  targetType: "stage" | "building";
  targetId: string;
}

/** Interactive site / cluster map before selecting a building. */
export interface ProjectMapStage {
  id: string;
  projectId: string;
  parentId?: string | null;
  label: string;
  labelHy?: string;
  labelRu?: string;
  imageUrl: string;
  sortOrder: number;
  hotspots: MapStageHotspot[];
}

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
  /** Optional label on the zone (e.g. SOLD). Position defaults to polygon centroid. */
  label?: string;
  labelColor?: string;
  labelBgColor?: string;
  labelX?: number;
  labelY?: number;
}

/** Free-floating text label on a floor plate image (% coords 0–100). */
export interface FloorTextLabel {
  id: string;
  text: string;
  color: string;
  backgroundColor?: string;
  x: number;
  y: number;
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
  /** Free-floating text labels (e.g. SOLD badges) on the floor plan image. */
  textLabels?: FloorTextLabel[];
  /** Floor band on the building exterior image (% coords). */
  exteriorHotspot?: [number, number][];
}

export type BuildingKind = "building" | "neighborhood";

export interface Building {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
  /** `building` (default) has floor plates; `neighborhood` has houses, land, price, pictures. */
  kind?: BuildingKind;
  /** Step-4 exterior render of the building. */
  exteriorImageUrl?: string;
  /** Neighborhood land area in m². */
  landArea?: number;
  /** Neighborhood listing / starting price (AMD). */
  price?: number;
  /** Neighborhood photos. */
  images?: string[];
  floors: BuildingFloor[];
}

/** Sellable land plot marked as a polygon on the neighborhood 3D/site image. */
export interface LandPlot {
  id: string;
  projectId: string;
  label: string;
  sortOrder: number;
  area?: number;
  price?: number;
  status: ApartmentStatus;
  /** Polygon points as % of image width/height (0–100). */
  points: [number, number][];
}

export interface Apartment {
  id: string;
  projectId: string;
  buildingId?: string;
  /** Neighborhood land plot this house plan belongs to. */
  landPlotId?: string;
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
  /** Building complex (floor plates) or neighborhood (site plan + land plots). */
  kind?: ProjectKind;
  /** Apartment sales flow (building projects only): plans | floors | buildings. */
  salesMode?: SalesMode;
  /** Site map stage(s) for multi-building selection. */
  mapStages?: ProjectMapStage[];
  /** Neighborhood 3D / master-plan image where land plots are drawn. */
  sitePlanImage?: string;
  landPlots?: LandPlot[];
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
