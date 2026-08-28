import type { CustomerLookup, CustomerLookupResult } from './customer.js';

export interface CustomerGateway {
  lookup(query: CustomerLookup): Promise<CustomerLookupResult>;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface TokenService {
  issue(subject: string): string;
  verify(token: string): string;
}

export interface CredentialValidator {
  validate(credentials: Credentials): Promise<Record<string, unknown> | null>;
}
