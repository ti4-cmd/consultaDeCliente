export type PersonType = 'PF' | 'PJ';

export interface CustomerLookup {
  personType: PersonType;
  document: string;
}

export interface Customer {
  [key: string]: unknown;
}

export interface CustomerLookupResult {
  isCustomer: boolean;
  customer: Customer | null;
}
