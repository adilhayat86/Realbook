export interface Agent {
  id: string;
  name: string;
  mobile: string;
  agency: string;
  city: string;
  listingsCount: number;
  isFollowing: boolean;
  photo?: string;
}

export interface Requirement {
  id: string;
  agentId: string;
  agentName: string;
  agentAgency: string;
  propertyType: string;
  city: string;
  area: string;
  society?: string;
  phase?: string;
  block?: string;
  size?: string;
  sizeUnit?: string;
  minPrice?: string;
  maxPrice?: string;
  description?: string;
  createdAt: string;
}
