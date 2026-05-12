/**
 * TESTE K6 — ROTAS DE ROTEIROS (autenticação via cookie HttpOnly)
 * Testa GET /api/v1/roteiros e GET /api/v1/roteiros/:id
 *
 * Como executar:
 *   k6 run tests/performance/k6-roteiros.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ─── Métricas customizadas ───────────────────────────────────────────────────
const listaDuration    = new Trend('lista_roteiros_duration', true);
const detalhesDuration = new Trend('detalhes_roteiro_duration', true);
const errorRate        = new Rate('roteiro_errors');

// ─── Configuração do teste ───────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '15s', target: 10 },
    { duration: '30s', target: 30 },
    { duration: '15s', target: 0  },
  ],
  thresholds: {
    lista_roteiros_duration:   ['p(95)<600'],
    detalhes_roteiro_duration: ['p(95)<400'],
    roteiro_errors:            ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3333/api/v1';
const ROTEIRO_ID = 2;

// ─── Cenário principal ───────────────────────────────────────────────────────
// Cada VU faz login individualmente — o cookie HttpOnly é gerenciado
// automaticamente pelo jar de cookies do k6 por VU.
export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // 1. Login — obtém o cookie de sessão
  const loginRes = http.post(
    `${BASE_URL}/auth`,
    JSON.stringify({ email: 'danielsilva99e@gmail.com', password: '123456' }),
    { headers }
  );

  const loginOk = check(loginRes, {
    'login: status 200': (r) => r.status === 200,
  });

  if (!loginOk) return; // Interrompe se login falhou

  sleep(0.3);

  // 2. Lista todos os roteiros (cookie enviado automaticamente)
  const listaRes = http.get(`${BASE_URL}/roteiros`, { headers });
  listaDuration.add(listaRes.timings.duration);
  errorRate.add(listaRes.status !== 200);

  check(listaRes, {
    'lista: status 200':    (r) => r.status === 200,
    'lista: abaixo 600ms':  (r) => r.timings.duration < 600,
  });

  sleep(0.3);

  // 3. Busca roteiro específico (cookie enviado automaticamente)
  const detalhesRes = http.get(`${BASE_URL}/roteiros/${ROTEIRO_ID}`, { headers });
  detalhesDuration.add(detalhesRes.timings.duration);
  errorRate.add(detalhesRes.status !== 200);

  check(detalhesRes, {
    'detalhes: status 200':   (r) => r.status === 200,
    'detalhes: abaixo 400ms': (r) => r.timings.duration < 400,
  });

  sleep(1);
}
