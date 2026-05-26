export type PropertyType =
  | 'Residential Plot'
  | 'Pair Plot'
  | 'Commercial Plot'
  | 'House'
  | 'Apartment / Flat'
  | 'Shop'
  | 'Office'
  | 'Farm House'
  | 'File'
  | 'Industrial Plot'
  | 'Penthouse';

export type SpecialTag =
  | 'Corner'
  | 'Extra Land'
  | 'Park Facing'
  | 'On Biana'
  | 'One Down'
  | 'Two Down'
  | 'Direct Owner'
  | 'Solid Land'
  | 'File Only'
  | 'Merging Possible'
  | 'Cash Only'
  | 'Main Boulevard'
  | 'Gated'
  | 'Sun Facing';

export type City = 'Rawalpindi' | 'Islamabad';

export type PossessionStatus =
  | 'Possession Available'
  | 'File Only (No Possession)'
  | 'Under Possession Process';

export type RegistryStatus =
  | 'Registry Done'
  | 'Registry Available'
  | 'Registry Not Available';

export type MapStatus = 'Map Paid' | 'Map Not Paid';

export type DuesStatus = 'All Dues Clear' | 'Dues Pending';

export type NOCStatus = 'NOC Available' | 'NOC Not Available';

export type ListingStatus = 'active' | 'archive' | 'sold' | 'record_room';

export interface Listing {
  id: string;
  agentId: string;
  agentName: string;
  agentAgency: string;
  agentExpertise: string[];
  agentPhoto?: string;
  propertyType: PropertyType;
  city: City;
  society: string;
  phase: string;
  block: string;
  price: number;
  size: string;
  sizeUnit: string;
  possessionStatus: PossessionStatus;
  registryStatus: RegistryStatus;
  mapStatus: MapStatus;
  duesStatus: DuesStatus;
  nocStatus: NOCStatus;
  tags: SpecialTag[];
  description?: string;
  publishedAt: string;
  commentCount: number;
  offerCount: number;
  images?: string[];
  status?: ListingStatus;
  lastRefreshedAt?: string;
  lastReviewedAt?: string;
  archivedAt?: string;
  archivedReason?: string;
  // Property-specific fields
  level?: string;
  facing?: string;
  streetWidth?: string;
  plotNumberOne?: string;
  plotNumberTwo?: string;
  streetNumber?: string;
  sizeEach?: string;
  sizeEachUnit?: string;
  totalSize?: string;
  totalSizeUnit?: string;
  corner?: boolean;
  parkFacing?: boolean;
  mainBoulevard?: boolean;
  approval?: string;
  commercialActivity?: string;
  multiStorey?: boolean;
  basement?: boolean;
  currentlyRented?: boolean;
  rentalIncome?: string;
  vacatingTimeline?: string;
  construction?: string;
  yearsOld?: number;
  quality?: string;
  furnished?: string;
  floors?: number;
  servantQuarter?: boolean;
  separateGate?: boolean;
  floorNumber?: number;
  totalFloors?: number;
  parking?: number;
  lift?: boolean;
  apartmentType?: string;
  generator?: boolean;
  shopFloor?: string;
  mezzanine?: boolean;
  officeFloor?: number;
  dimensions?: string;
  mapAttachment?: string;
  googleLocation?: string;
  boundaryWall?: boolean;
  tubeWell?: boolean;
  balanceAmount?: string;
  statementAttachment?: string;
  ballotDone?: boolean;
  possessionExpected?: string;
  industrialEstate?: string;
  gas?: boolean;
  water?: boolean;
  roadAccess?: boolean;
  rooftopAccess?: boolean;
  rooftopArea?: string;
  privateElevator?: boolean;
  pool?: boolean;
  gym?: boolean;
  views?: string[];
}

export interface PostFormData {
  propertyType: PropertyType | '';
  city: City | '';
  society: string;
  phase: string;
  block: string;
  price: string;
  size: string;
  sizeUnit: string;
  possessionStatus: PossessionStatus | '';
  registryStatus: RegistryStatus | '';
  mapStatus: MapStatus | '';
  duesStatus: DuesStatus | '';
  nocStatus: NOCStatus | '';
  tags: SpecialTag[];
  description: string;
  images: string[];
  // Property-specific fields
  level?: string;
  facing?: string;
  streetWidth?: string;
  plotNumberOne?: string;
  plotNumberTwo?: string;
  streetNumber?: string;
  sizeEach?: string;
  sizeEachUnit?: string;
  totalSize?: string;
  totalSizeUnit?: string;
  corner?: boolean;
  parkFacing?: boolean;
  mainBoulevard?: boolean;
  approval?: string;
  commercialActivity?: string;
  multiStorey?: boolean;
  basement?: boolean;
  currentlyRented?: boolean;
  rentalIncome?: string;
  vacatingTimeline?: string;
  construction?: string;
  yearsOld?: number;
  quality?: string;
  furnished?: string;
  floors?: number;
  servantQuarter?: boolean;
  separateGate?: boolean;
  floorNumber?: number;
  totalFloors?: number;
  parking?: number;
  lift?: boolean;
  apartmentType?: string;
  generator?: boolean;
  shopFloor?: string;
  mezzanine?: boolean;
  officeFloor?: number;
  dimensions?: string;
  mapAttachment?: string;
  googleLocation?: string;
  boundaryWall?: boolean;
  tubeWell?: boolean;
  balanceAmount?: string;
  statementAttachment?: string;
  ballotDone?: boolean;
  possessionExpected?: string;
  industrialEstate?: string;
  gas?: boolean;
  water?: boolean;
  roadAccess?: boolean;
  rooftopAccess?: boolean;
  rooftopArea?: string;
  privateElevator?: boolean;
  pool?: boolean;
  gym?: boolean;
  views?: string[];
}
