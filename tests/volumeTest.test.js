/**
 * ============================================================
 *  TESTE DE VOLUME — Estratégia Bottom-Up (TripNow)
 * ============================================================
 *  Objetivo : Medir o comportamento real do banco PostgreSQL
 *             sob uma base de 1.000.000 de registros.
 *
 *  Método   : Inserção direta via SQL nativo (generate_series)
 *             — abordagem ultrarrápida, sem overhead do ORM.
 *
 *  Threshold: INSERT > 20 segundos → erro de indexação (PK).
 *             Busca por email → deve usar Index Scan, não Seq Scan.
 *
 *  Como executar (com banco Docker rodando):
 *    npx jest tests/volumeTest.test.js --verbose --testTimeout=180000
 * ============================================================
 */

require('dotenv').config();
const { Pool } = require('pg');

// ── Conexão direta via pg (sem passar pelo server/ORM) ────────────────────────
const pool = new Pool({
  host:     process.env.HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

// ── Constantes de threshold ───────────────────────────────────────────────────
const LIMITE_INSERT_SEGUNDOS = 20;   // Acima disso → erro de indexação na PK
const LIMITE_BUSCA_MS        = 100;  // Acima disso com índice → alerta de performance
const PREFIXO_EMAIL          = 'vol_teste_';
const DOMINIO_EMAIL          = '@volume.test';
const TOTAL_REGISTROS        = 1_000_000;

// ── Helper: extrai Execution Time do plano EXPLAIN ANALYZE ───────────────────
function extrairTempoExecucaoMs(planoTexto) {
  const match = planoTexto.match(/Execution Time:\s*([\d.]+)\s*ms/i);
  return match ? parseFloat(match[1]) : null;
}

// ── Helper: formata segundos com 2 casas decimais ─────────────────────────────
function s(ms) { return (ms / 1000).toFixed(2) + 's'; }

// =============================================================================
describe('🔬 Teste de Volume — 1.000.000 de Registros (Bottom-Up)', () => {
  let client;

  // ── Setup: conecta e garante ambiente limpo ──────────────────────────────
  beforeAll(async () => {
    client = await pool.connect();

    console.log('\n🧹 Limpando registros de teste anteriores...');
    const { rowCount } = await client.query(
      `DELETE FROM users WHERE email LIKE $1`,
      [`${PREFIXO_EMAIL}%${DOMINIO_EMAIL}`]
    );
    if (rowCount > 0) console.log(`   → ${rowCount} registros antigos removidos.`);
  }, 30_000);

  // ── Teardown: remove todos os registros de teste ─────────────────────────
  afterAll(async () => {
    console.log('\n🧹 Removendo registros de volume do banco...');
    const { rowCount } = await client.query(
      `DELETE FROM users WHERE email LIKE $1`,
      [`${PREFIXO_EMAIL}%${DOMINIO_EMAIL}`]
    );
    console.log(`   → ${rowCount} registros de teste removidos.`);

    client.release();
    await pool.end();
  }, 120_000);

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 1 — Tempo de INSERT em massa (generate_series)
  // ══════════════════════════════════════════════════════════════════════════
  it(
    `1. INSERT de ${TOTAL_REGISTROS.toLocaleString()} registros deve completar em < ${LIMITE_INSERT_SEGUNDOS}s`,
    async () => {
      console.log(`\n⏳ Inserindo ${TOTAL_REGISTROS.toLocaleString()} registros via generate_series...`);
      const inicio = Date.now();

      await client.query(`
        INSERT INTO users
          (email, password_hash, user_name, name, tipo_usuario, esta_ativo, criado_em, atualizado_em)
        SELECT
          '${PREFIXO_EMAIL}' || i || '${DOMINIO_EMAIL}',
          '$2b$08$hashFixoSimuladoParaTesteDe.VolumeSemCargaCPU.Bcrypt',
          'vol_user_' || i,
          'Usuário Volume ' || i,
          'usuario',
          true,
          NOW(),
          NOW()
        FROM generate_series(1, ${TOTAL_REGISTROS}) AS i
      `);

      const tempoMs      = Date.now() - inicio;
      const tempoSegundos = tempoMs / 1000;

      console.log(`\n✅ INSERT concluído em: ${tempoSegundos.toFixed(2)}s`);
      console.log(
        tempoSegundos < LIMITE_INSERT_SEGUNDOS
          ? `   → APROVADO ✅  (threshold: ${LIMITE_INSERT_SEGUNDOS}s)`
          : `   → REPROVADO ❌  — possível erro de indexação na Primary Key!`
      );

      expect(tempoSegundos).toBeLessThan(LIMITE_INSERT_SEGUNDOS);
    },
    // Timeout do teste: 2 minutos (geração pode variar conforme hardware/Docker)
    120_000
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 2 — EXPLAIN ANALYZE: Index Scan obrigatório (não Seq Scan)
  // ══════════════════════════════════════════════════════════════════════════
  it(
    '2. Busca por email com 1M registros deve usar Index Scan (não Seq Scan)',
    async () => {
      // Busca no meio do dataset para evitar cache de extremos
      const emailAlvo = `${PREFIXO_EMAIL}500000${DOMINIO_EMAIL}`;

      console.log(`\n🔍 Executando EXPLAIN ANALYZE para: ${emailAlvo}`);

      // SELECT com colunas explícitas — sem SELECT * (boas práticas)
      const resultado = await client.query(
        `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
         SELECT id, name, email FROM users WHERE email = $1`,
        [emailAlvo]
      );

      const plano = resultado.rows.map(r => r['QUERY PLAN']).join('\n');

      console.log('\n📋 Plano de Execução (EXPLAIN ANALYZE):\n');
      console.log(plano);

      // ── Diagnóstico ──────────────────────────────────────────────────────
      const usaIndexScan = /Index Scan/i.test(plano);
      const usaSeqScan   = /Seq Scan/i.test(plano);

      if (usaIndexScan) {
        console.log('\n✅ APROVADO — PostgreSQL usou Index Scan (índice ativo na coluna email)');
      } else if (usaSeqScan) {
        console.log('\n❌ REPROVADO — PostgreSQL usou Seq Scan (tabela sem índice em email)');
        console.log('   → AÇÃO: Criar índice: CREATE INDEX ON users (email);');
      }

      expect(usaIndexScan).toBe(true);
      expect(usaSeqScan).toBe(false);
    },
    30_000
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 3 — Tempo de execução real da busca por índice
  // ══════════════════════════════════════════════════════════════════════════
  it(
    `3. Busca por email com índice deve responder em menos de ${LIMITE_BUSCA_MS}ms`,
    async () => {
      // Busca em posição diferente do teste anterior (evita page cache)
      const emailAlvo = `${PREFIXO_EMAIL}750000${DOMINIO_EMAIL}`;

      const resultado = await client.query(
        `EXPLAIN (ANALYZE, FORMAT TEXT)
         SELECT id, name, email FROM users WHERE email = $1`,
        [emailAlvo]
      );

      const plano = resultado.rows.map(r => r['QUERY PLAN']).join('\n');
      const tempoMs = extrairTempoExecucaoMs(plano);

      console.log(`\n⚡ Execution Time reportado pelo PostgreSQL: ${tempoMs}ms`);

      if (tempoMs === null) {
        console.warn('   ⚠️  Não foi possível extrair Execution Time do plano.');
      } else if (tempoMs < LIMITE_BUSCA_MS) {
        console.log(`   → APROVADO ✅  (threshold: ${LIMITE_BUSCA_MS}ms)`);
      } else {
        console.log(
          `   → REPROVADO ❌  — busca lenta mesmo com índice.\n` +
          `      Verifique fragmentação do índice (REINDEX TABLE users;)`
        );
      }

      expect(tempoMs).not.toBeNull();
      expect(tempoMs).toBeLessThan(LIMITE_BUSCA_MS);
    },
    30_000
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 4 — Contagem de registros (integridade do volume inserido)
  // ══════════════════════════════════════════════════════════════════════════
  it(
    '4. Banco deve confirmar exatamente 1.000.000 registros de teste inseridos',
    async () => {
      const { rows } = await client.query(
        `SELECT COUNT(*)::int AS total FROM users WHERE email LIKE $1`,
        [`${PREFIXO_EMAIL}%${DOMINIO_EMAIL}`]
      );

      const total = rows[0].total;
      console.log(`\n📊 Total de registros de volume no banco: ${total.toLocaleString()}`);

      expect(total).toBe(TOTAL_REGISTROS);
    },
    30_000
  );
});
