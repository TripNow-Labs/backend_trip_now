/**
 * ============================================================
 *  TESTE DE ESTRESSE DE INSERÇÃO — Estratégia Bottom-Up (TripNow)
 * ============================================================
 *  Objetivo : Simular múltiplos usuários realizando operações
 *             de escrita simultâneas, medindo o tempo de
 *             resposta e detectando gargalos de indexação.
 *
 *  Método   : Inserção em lotes (batch) + escritas paralelas
 *             via Promise.all — sem passar pelo ORM.
 *
 *  Threshold: Cada lote de INSERT não deve ultrapassar 20s.
 *             Escritas paralelas não devem gerar deadlock.
 *
 *  Como executar (com banco Docker rodando):
 *    npx jest tests/insertStress.test.js --verbose --testTimeout=300000
 * ============================================================
 */

require('dotenv').config();
const { Pool } = require('pg');

// ── Conexão direta via pg ─────────────────────────────────────────────────────
const pool = new Pool({
  host:               process.env.HOST,
  port:               Number(process.env.DB_PORT) || 5432,
  user:               process.env.DB_USERNAME,
  password:           process.env.PASSWORD,
  database:           process.env.DATABASE,
  max:                20,   // Pool maior para suportar paralelismo
  idleTimeoutMillis:  30_000,
  connectionTimeoutMillis: 10_000,
});

// ── Constantes ────────────────────────────────────────────────────────────────
const LIMITE_SEGUNDOS_POR_LOTE = 20;   // Threshold do guia de estudos
const TAMANHO_LOTE             = 10_000;
const TOTAL_LOTES              = 10;   // 10 × 10.000 = 100.000 registros
const PARALELO_WORKERS         = 5;    // Usuários simultâneos
const PREFIXO_EMAIL_STRESS     = 'stress_seq_';
const PREFIXO_EMAIL_PARALELO   = 'stress_par_';
const DOMINIO                  = '@stress.test';

// ── Helper: cria o bloco VALUES para um lote ─────────────────────────────────
function criarValoresLote(lote, tamanho) {
  const offset = lote * tamanho;
  return Array.from({ length: tamanho }, (_, j) => {
    const i = offset + j + 1;
    return (
      `('${PREFIXO_EMAIL_STRESS}${i}${DOMINIO}',` +
      `'$2b$08$hashFixoStressTestSemCargaCPU.Bcrypt.Simulado',` +
      `'stress_seq_${i}',` +
      `'Stress Seq ${i}',` +
      `'usuario', true, NOW(), NOW())`
    );
  }).join(',\n');
}

// ── Helper: formata ms em string legível ──────────────────────────────────────
function fmt(ms) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

// =============================================================================
describe('⚡ Teste de Estresse de Inserção — Múltiplos Usuários Simultâneos', () => {

  // ── Teardown: limpa registros de teste ──────────────────────────────────
  afterAll(async () => {
    console.log('\n🧹 Limpando registros de estresse...');
    const client = await pool.connect();
    try {
      const r1 = await client.query(
        `DELETE FROM users WHERE email LIKE $1`, [`${PREFIXO_EMAIL_STRESS}%${DOMINIO}`]
      );
      const r2 = await client.query(
        `DELETE FROM users WHERE email LIKE $1`, [`${PREFIXO_EMAIL_PARALELO}%${DOMINIO}`]
      );
      console.log(`   → ${r1.rowCount + r2.rowCount} registros de estresse removidos.`);
    } finally {
      client.release();
    }
    await pool.end();
  }, 60_000);

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 1 — Inserção sequencial em lotes de 10.000 (método Node.js)
  // ══════════════════════════════════════════════════════════════════════════
  it(
    `1. ${TOTAL_LOTES} lotes de ${TAMANHO_LOTE.toLocaleString()} registros — cada lote < ${LIMITE_SEGUNDOS_POR_LOTE}s`,
    async () => {
      const tempos = [];
      let loteFalhou = -1;

      console.log(
        `\n📦 Iniciando inserção: ` +
        `${TOTAL_LOTES} lotes × ${TAMANHO_LOTE.toLocaleString()} = ` +
        `${(TOTAL_LOTES * TAMANHO_LOTE).toLocaleString()} registros`
      );
      console.log('─'.repeat(55));

      for (let lote = 0; lote < TOTAL_LOTES; lote++) {
        const client = await pool.connect();
        const inicio = Date.now();

        try {
          const valores = criarValoresLote(lote, TAMANHO_LOTE);
          await client.query(`
            INSERT INTO users
              (email, password_hash, user_name, name, tipo_usuario, esta_ativo, criado_em, atualizado_em)
            VALUES ${valores}
            ON CONFLICT (email) DO NOTHING
          `);
        } finally {
          client.release();
        }

        const tempoMs = Date.now() - inicio;
        tempos.push(tempoMs);

        const status = tempoMs / 1000 < LIMITE_SEGUNDOS_POR_LOTE ? '✅' : '❌';
        console.log(
          `  Lote ${String(lote + 1).padStart(2, '0')}/${TOTAL_LOTES}` +
          `  →  ${fmt(tempoMs).padStart(8)}  ${status}`
        );

        if (tempoMs / 1000 >= LIMITE_SEGUNDOS_POR_LOTE && loteFalhou === -1) {
          loteFalhou = lote + 1;
        }
      }

      // ── Estatísticas finais ──────────────────────────────────────────────
      const media  = tempos.reduce((a, b) => a + b, 0) / tempos.length;
      const maximo = Math.max(...tempos);
      const minimo = Math.min(...tempos);

      console.log('─'.repeat(55));
      console.log(`  Tempo mínimo  : ${fmt(minimo)}`);
      console.log(`  Tempo médio   : ${fmt(Math.round(media))}`);
      console.log(`  Tempo máximo  : ${fmt(maximo)}`);
      console.log(`  Threshold     : ${LIMITE_SEGUNDOS_POR_LOTE}s por lote`);

      if (loteFalhou > -1) {
        console.log(
          `\n  ❌ REPROVADO — Lote #${loteFalhou} ultrapassou o threshold.\n` +
          `     → Provável erro de indexação ou PK mal planejada.\n` +
          `     → Verifique: REINDEX TABLE users; e o tipo da Primary Key.`
        );
      } else {
        console.log('\n  ✅ APROVADO — Todos os lotes dentro do threshold.');
      }

      // O máximo de qualquer lote não deve ultrapassar o threshold
      expect(maximo / 1000).toBeLessThan(LIMITE_SEGUNDOS_POR_LOTE);
    },
    300_000  // Timeout: 5 minutos para todos os lotes
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 2 — Escritas paralelas: simulação de usuários concorrentes
  // ══════════════════════════════════════════════════════════════════════════
  it(
    `2. ${PARALELO_WORKERS} escritas paralelas simultâneas não devem causar deadlock`,
    async () => {
      console.log(
        `\n🔀 Disparando ${PARALELO_WORKERS} INSERTs em paralelo (usuários concorrentes)...`
      );

      const inicio = Date.now();

      // Cada "worker" inserta um mini-lote de 1.000 registros
      const workers = Array.from({ length: PARALELO_WORKERS }, (_, worker) => {
        return (async () => {
          const client = await pool.connect();
          const workerInicio = Date.now();

          try {
            const valores = Array.from({ length: 1000 }, (_, j) => {
              const timestamp = Date.now();
              const i = worker * 1000 + j;
              return (
                `('${PREFIXO_EMAIL_PARALELO}${worker}_${i}_${timestamp}${DOMINIO}',` +
                `'$2b$08$hashFixoParaleloSemCargaCPU.Bcrypt.Sim',` +
                `'stress_par_${worker}_${i}',` +
                `'Stress Par ${worker} ${i}',` +
                `'usuario', true, NOW(), NOW())`
              );
            }).join(',\n');

            await client.query(`
              INSERT INTO users
                (email, password_hash, user_name, name, tipo_usuario, esta_ativo, criado_em, atualizado_em)
              VALUES ${valores}
              ON CONFLICT (email) DO NOTHING
            `);

            return {
              worker,
              sucesso:  true,
              tempoMs:  Date.now() - workerInicio,
            };
          } catch (err) {
            return {
              worker,
              sucesso: false,
              erro:    err.message,
              tempoMs: Date.now() - workerInicio,
            };
          } finally {
            client.release();
          }
        })();
      });

      const resultados = await Promise.all(workers);
      const totalMs    = Date.now() - inicio;

      // ── Relatório de paralelismo ─────────────────────────────────────────
      console.log('\n  Resultado por worker:');
      resultados.forEach(r => {
        const status = r.sucesso ? '✅' : '❌';
        const detalhe = r.sucesso
          ? `concluído em ${fmt(r.tempoMs)}`
          : `FALHOU — ${r.erro}`;
        console.log(`    Worker ${r.worker}: ${status} ${detalhe}`);
      });

      const sucessos    = resultados.filter(r => r.sucesso).length;
      const falhas      = resultados.filter(r => !r.sucesso).length;
      const tempMedioMs = resultados.reduce((a, r) => a + r.tempoMs, 0) / PARALELO_WORKERS;

      console.log('─'.repeat(55));
      console.log(`  Workers bem-sucedidos : ${sucessos}/${PARALELO_WORKERS}`);
      console.log(`  Deadlocks/Falhas      : ${falhas}`);
      console.log(`  Tempo total paralelo  : ${fmt(totalMs)}`);
      console.log(`  Tempo médio por worker: ${fmt(Math.round(tempMedioMs))}`);

      if (falhas === 0) {
        console.log('\n  ✅ APROVADO — Sem deadlocks. Banco suporta concorrência.');
      } else {
        console.log('\n  ❌ REPROVADO — Detectados deadlocks ou erros de concorrência.');
      }

      expect(falhas).toBe(0);
      expect(sucessos).toBe(PARALELO_WORKERS);
    },
    60_000
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 3 — Verificação da integridade após estresse
  // ══════════════════════════════════════════════════════════════════════════
  it('3. Banco deve manter integridade (sem duplicatas) após inserção em estresse', async () => {
    const client = await pool.connect();

    try {
      // Verifica se há emails duplicados na tabela (não deveria haver por conta do UNIQUE)
      const { rows } = await client.query(`
        SELECT email, COUNT(*) as total
        FROM users
        WHERE email LIKE $1 OR email LIKE $2
        GROUP BY email
        HAVING COUNT(*) > 1
        LIMIT 10
      `, [
        `${PREFIXO_EMAIL_STRESS}%${DOMINIO}`,
        `${PREFIXO_EMAIL_PARALELO}%${DOMINIO}`,
      ]);

      if (rows.length > 0) {
        console.log('\n  ❌ Duplicatas encontradas após estresse:');
        rows.forEach(r => console.log(`    email: ${r.email} — ${r.total}× duplicado`));
      } else {
        console.log('\n  ✅ APROVADO — Integridade mantida. Nenhuma duplicata detectada.');
      }

      expect(rows.length).toBe(0);
    } finally {
      client.release();
    }
  }, 30_000);
});
