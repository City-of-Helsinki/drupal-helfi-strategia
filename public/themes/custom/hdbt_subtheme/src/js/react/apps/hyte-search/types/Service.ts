type Address = {
  address_line1: string[];
  address_line2?: string[];
  country_code: string[];
  locality: string[];
  postal_code: string[];
};

type Location = {
  lat: string[];
  lon: string[];
};

export type Unit = {
  'image.alt'?: string[];
  'image.photographer'?: string[];
  'image.title'?: string[];
  'image.url'?: string[];
  'image.variants.1.5_1022w_682h_LQ'?: string[];
  address: Address;
  location: Location;
  name_override?: string[];
  name: string[];
};

export type Service = {
  description_summary?: string[];
  description?: string[];
  name_override?: string[];
  name_synonyms?: string[];
  name: string[];
  search_api_data_source: string[];
  search_api_id: string[];
  search_api_language: string[];
  units?: Unit[]; 
  url: string[];
};
