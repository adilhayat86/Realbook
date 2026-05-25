import { PropertyType, SpecialTag } from './property';

export interface SearchFilters {
  propertyType: PropertyType | '';
  society: string;
  phase: string;
  minPrice: string;
  maxPrice: string;
  tags: SpecialTag[];
}
