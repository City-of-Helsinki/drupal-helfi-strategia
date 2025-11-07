type Address = {
  country_code: string[];
  locality: string[];
  postal_code: string[];
  address_line1: string[];
  address_line2?: string[];
};

type Location = {
  lat: string[];
  lon: string[];
};

export type Unit = {
  address: Address;
  location: Location;
  name: string[];
  name_override?: string[];
};

export type Service = {
  url: string[];
  description?: string[];
  description_summary?: string[];
  name: string[];
  name_override?: string[];
  search_api_id: string[];
  search_api_data_source: string[];
  search_api_language: string[];
  units?: Unit[]; 
};
