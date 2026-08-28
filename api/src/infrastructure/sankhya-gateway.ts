import { ExternalServiceError } from '../application/errors.js';
import type { AppConfig } from '../config/env.js';
import type { CustomerLookup, CustomerLookupResult } from '../domain/customer.js';
import type { Credentials, CredentialValidator, CustomerGateway } from '../domain/ports.js';

export class SankhyaCustomerGateway implements CustomerGateway, CredentialValidator {
  constructor(private readonly config: AppConfig, private readonly httpClient: typeof fetch = fetch) {}

  async validate(credentials: Credentials): Promise<Record<string, unknown> | null> {
    try {
      const email = credentials.email.trim();
      const sqlEmail = email.replace(/'/g, "''");
      const accessToken = await this.authenticate();
      const rows = await this.executeQuery(`SELECT CODVEND, APELIDO, EMAIL, 'Mouragro@2026' AS SENHA FROM TGFVEN WHERE ATIVO = 'S' AND EMAIL IS NOT NULL AND EMAIL = '${sqlEmail}' AND (AD_UMOVME IS NOT NULL OR CODVEND IN (18, 591, 21))`, accessToken);
      const vendor = rows[0] ?? null;
      if (vendor === null) return null;
      if (String(vendor.EMAIL ?? '').trim() !== email || String(vendor.SENHA ?? '').trim() !== credentials.password) return null;
      return vendor;
    } catch (error) {
      console.error('Sankhya authentication lookup failed', error);
      throw new ExternalServiceError();
    }
  }

  async lookup(query: CustomerLookup): Promise<CustomerLookupResult> {
    try {
      const document = query.document.replace(/\D/g, '');
      const accessToken = await this.authenticate();
      const rows = await this.executeQuery(`SELECT CODPARC, RAZAOSOCIAL, CGC_CPF FROM TGFPAR WHERE ATIVO = 'S' AND CLIENTE = 'S' AND CGC_CPF = '${document}'`, accessToken);
      const customer = rows[0] ?? null;
      return {
        isCustomer: customer !== null,
        customer
      };
    } catch (error) {
      console.error('Sankhya lookup failed', error);
      throw new ExternalServiceError();
    }
  }

  private async executeQuery(sql: string, accessToken: string): Promise<Record<string, unknown>[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    };
    const xToken = this.config.SANKHYA_X_TOKEN ?? this.config.SANKHYA_TOKEN;
    if (xToken) headers['X-Token'] = xToken;

    const response = await this.httpClient(this.config.SANKHYA_SERVICE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ serviceName: 'DbExplorerSP.executeQuery', requestBody: { sql } })
    });
    if (!response.ok) throw new Error(`Sankhya returned ${response.status}`);
    const data = await response.json() as Record<string, unknown>;
    const responseBody = (data.responseBody ?? data) as Record<string, unknown>;
    return this.normalizeRows(responseBody.rows ?? responseBody.data ?? [], responseBody.fieldsMetadata);
  }

  private async authenticate(): Promise<string> {
    const body = new URLSearchParams({
      client_id: this.config.CLIENT_ID,
      client_secret: this.config.CLIENT_SECRET,
      grant_type: this.config.grant_type
    });
    const xToken = this.config.SANKHYA_X_TOKEN ?? this.config.SANKHYA_TOKEN;
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    if (xToken) headers['X-Token'] = xToken;

    const response = await this.httpClient(this.config.SANKHYA_API_URL, {
      method: 'POST',
      headers,
      body
    });
    if (!response.ok) throw new Error(`Sankhya authentication returned ${response.status}`);
    const data = await response.json() as Record<string, unknown>;
    const accessToken = data.access_token ?? (data.data as Record<string, unknown> | undefined)?.access_token;
    if (typeof accessToken !== 'string' || !accessToken) throw new Error('Sankhya did not return an access token');
    return accessToken;
  }

  private normalizeRows(rows: unknown, fieldsMetadata: unknown): Record<string, unknown>[] {
    if (!Array.isArray(rows)) return [];
    if (!rows.some(Array.isArray)) {
      return rows.map((row) => Object.fromEntries(Object.entries(row as Record<string, unknown>).map(([name, value]) => [name.toUpperCase(), value])));
    }
    if (!Array.isArray(fieldsMetadata)) return [];

    return rows.map((row) => Object.fromEntries(fieldsMetadata.map((field, index) => {
      const name = (field as Record<string, unknown>).name;
      return [typeof name === 'string' ? name.toUpperCase() : String(index), (row as unknown[])[index]];
    })));
  }
}
