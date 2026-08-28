export class InvalidCredentialsError extends Error {
  constructor() {
    super('Usuário ou senha inválidos.');
    this.name = 'InvalidCredentialsError';
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Sessão expirada. Faça login novamente.');
    this.name = 'UnauthorizedError';
  }
}

export class ExternalServiceError extends Error {
  constructor() {
    super('Não foi possível consultar a Sankhya agora.');
    this.name = 'ExternalServiceError';
  }
}
