/**
 * TESTE K6 — ROTA DE LOGIN
 * Mede latência e taxa de erro do endpoint POST /api/v1/auth
 *
 * Como executar:
 *   k6 run k6-login.js
 *
 * Como instalar o k6 (Windows):
 *   winget install k6 --source winget
 *   OU baixe em: https://k6.io/docs/get-started/installation/
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ─── Métricas customizadas ───────────────────────────────────────────────────
const loginDuration = new Trend('login_duration', true);
const loginErrorRate = new Rate('login_errors');

// ─── Configuração do teste ───────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '15s', target: 5  },  // Aquece com 5 usuários
    { duration: '30s', target: 20 },  // Sobe para 20 usuários simultâneos
    { duration: '15s', target: 0  },  // Desce gradualmente
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% das requisições abaixo de 500ms
    login_errors:      ['rate<0.01'],  // Menos de 1% de erros
  },
};

const BASE_URL = 'http://localhost:3333/api/v1';

// ─── Dados de teste ──────────────────────────────────────────────────────────
// Ajuste com um usuário real cadastrado no banco
const CREDENCIAIS = {
  email:    'danielsilva99e@gmail.com',
  password: '123456',
};

// ─── Cenário principal ───────────────────────────────────────────────────────
export default function () {
  const payload = JSON.stringify(CREDENCIAIS);
  const params  = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(`${BASE_URL}/auth`, payload, params);

  // Registra métricas
  loginDuration.add(res.timings.duration);
  loginErrorRate.add(res.status !== 200);

  // Validações
  check(res, {
    'status 200':           (r) => r.status === 200,
    'tem user no body':     (r) => r.json('user') !== undefined,
    'resposta abaixo 500ms':(r) => r.timings.duration < 500,
  });

  sleep(1);
}
