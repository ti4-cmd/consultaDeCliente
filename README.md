# Cliente Mouragro

Portal mobile para consultar se uma pessoa física ou jurídica é cliente Mouragro.

## Configuração

1. Copie `api/.env.example` para `api/.env` e informe as credenciais.
2. Instale tudo com `npm run install:all`.
3. Rode API e front com `npm run dev`.

A API da Sankhya é chamada apenas pelo backend. Configure `CLIENT_ID`, `CLIENT_SECRET` e `SANKHYA_X_TOKEN` no ambiente. O backend autentica em `SANKHYA_API_URL` e consulta o serviço SQL em `SANKHYA_SERVICE_URL` usando Bearer e `X-Token`.
