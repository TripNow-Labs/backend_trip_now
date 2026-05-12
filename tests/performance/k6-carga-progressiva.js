/**
 * TESTE K6 — CARGA PROGRESSIVA
 * Simula 1 → 10 → 50 → 100 usuários simultâneos para encontrar o ponto de ruptura.
 * Testa login + listagem de roteiros em sequência (fluxo real do usuário).
 *
 * Como executar:
 *   k6 run k6-carga-progressiva.js
 *
 * Para exportar o resultado em JSON (para incluir no relatório):
 *   k6 run k6-carga-progressiva.js --out json=resultado-carga.json
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ─── Métricas ────────────────────────────────────────────────────────────────
const loginDuration    = new Trend('carga_login_ms',    true);
const roteirosDuration = new Trend('carga_roteiros_ms', true);
const erros            = new Rate('carga_erros');
const requisicoes      = new Counter('carga_total_requisicoes');

// ─── Cenários de carga progressiva ───────────────────────────────────────────
export const options = {
  stages: [
    // Nível 1: baixo
    { duration: '30s', target: 1  },
    { duration: '30s', target: 1  },
    // Nível 2: médio
    { duration: '30s', target: 10 },
    { duration: '30s', target: 10 },
    // Nível 3: alto
    { duration: '30s', target: 50 },
    { duration: '30s', target: 50 },
    // Nível 4: pico
    { duration: '30s', target: 100 },
    { duration: '30s', target: 100 },
    // Descida
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    http_req_failed:    ['rate<0.05'],   // Máximo 5% de erro geral
    carga_login_ms:     ['p(90)<800'],   // Login: 90% abaixo de 800ms
    carga_roteiros_ms:  ['p(90)<1000'],  // Roteiros: 90% abaixo de 1s
  },
};

const BASE_URL = 'http://localhost:3333/api/v1';

export default function () {
  let loginOk = false;

  // ── Grupo 1: Login ─────────────────────────────────────────────────────────
  // Cookie HttpOnly é definido automaticamente pelo servidor e gerenciado
  // pelo jar de cookies do k6 por VU nas requisições seguintes.
  group('1. Login', () => {
    const res = http.post(
      `${BASE_URL}/auth`,
      JSON.stringify({ email: 'danielsilva99e@gmail.com', password: '123456' }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    loginDuration.add(res.timings.duration);
    erros.add(res.status !== 200);
    requisicoes.add(1);

    loginOk = check(res, { 'login OK': (r) => r.status === 200 });
  });

  if (!loginOk) return; // Interrompe se login falhou

  sleep(0.5);

  // ── Grupo 2: Listagem de roteiros ──────────────────────────────────────────
  // Cookie HttpOnly é enviado automaticamente pelo jar do k6
  group('2. Listar roteiros', () => {
    const res = http.get(`${BASE_URL}/roteiros`, {
      headers: { 'Content-Type': 'application/json' },
    });

    roteirosDuration.add(res.timings.duration);
    erros.add(res.status !== 200);
    requisicoes.add(1);

    check(res, { 'roteiros OK': (r) => r.status === 200 });
  });

  sleep(1);
}
