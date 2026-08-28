import { InvalidCredentialsError } from './errors.js';
import type { CustomerLookup, CustomerLookupResult } from '../domain/customer.js';
import type { CredentialValidator, Credentials, CustomerGateway, TokenService } from '../domain/ports.js';

export class AuthenticateUser {
  constructor(private readonly credentialValidator: CredentialValidator, private readonly tokenService: TokenService) {}

  async execute(credentials: Credentials) {
    const vendor = await this.credentialValidator.validate(credentials);
    if (!vendor) throw new InvalidCredentialsError();
    return {
      token: this.tokenService.issue(credentials.email),
      email: credentials.email,
      apelido: vendor.APELIDO
    };
  }
}

export class LookupCustomer {
  constructor(private readonly customerGateway: CustomerGateway) {}

  execute(query: CustomerLookup): Promise<CustomerLookupResult> {
    return this.customerGateway.lookup(query);
  }
}
