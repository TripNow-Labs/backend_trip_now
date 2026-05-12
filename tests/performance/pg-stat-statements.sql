-- =============================================================================
-- pg_stat_statements — Monitoramento de queries lentas
-- =============================================================================
-- PASSO 1: Habilitar a extensão (execute uma única vez como superusuário)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Verifique se foi habilitada:
SELECT * FROM pg_available_extensions WHERE name = 'pg_stat_statements';


-- =============================================================================
-- PASSO 2: Adicionar ao postgresql.conf (reiniciar o PostgreSQL após)
-- =============================================================================
-- Localize o arquivo postgresql.conf (normalmente em /etc/postgresql/*/main/)
-- e adicione ou descomente as linhas abaixo:
--
--   shared_preload_libraries = 'pg_stat_statements'
--   pg_stat_statements.track = all
--   pg_stat_statements.max   = 10000
--
-- Depois reinicie o PostgreSQL:
--   sudo systemctl restart postgresql
--
-- No Windows (como Administrador):
--   net stop postgresql-x64-16
--   net start postgresql-x64-16


-- =============================================================================
-- PASSO 3: Zerar as estatísticas antes de rodar os testes
-- (execute isso logo antes de iniciar o k6 ou pgbench)
-- =============================================================================

SELECT pg_stat_statements_reset();


-- =============================================================================
-- PASSO 4: Consultar as queries mais lentas (execute após os testes)
-- =============================================================================

-- Top 10 queries com maior tempo médio de execução:
SELECT
  LEFT(query, 100)                              AS query_resumida,
  calls                                         AS total_execucoes,
  ROUND(mean_exec_time::numeric, 2)             AS media_ms,
  ROUND(total_exec_time::numeric, 2)            AS total_ms,
  ROUND(stddev_exec_time::numeric, 2)           AS desvio_padrao_ms,
  rows                                          AS total_linhas
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 10;


-- Top 10 queries mais executadas (maior volume):
SELECT
  LEFT(query, 100)                              AS query_resumida,
  calls                                         AS total_execucoes,
  ROUND(mean_exec_time::numeric, 2)             AS media_ms,
  ROUND((total_exec_time / calls)::numeric, 2)  AS ms_por_chamada
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY calls DESC
LIMIT 10;


-- Queries com maior tempo total acumulado (maior impacto no banco):
SELECT
  LEFT(query, 100)                              AS query_resumida,
  calls                                         AS total_execucoes,
  ROUND(total_exec_time::numeric, 2)            AS total_acumulado_ms,
  ROUND(mean_exec_time::numeric, 2)             AS media_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY total_exec_time DESC
LIMIT 10;


-- =============================================================================
-- PASSO 5: Monitorar cache do banco (hit rate)
-- Ideal: cache_hit_rate acima de 95%
-- =============================================================================

SELECT
  sum(heap_blks_read)                                       AS leituras_disco,
  sum(heap_blks_hit)                                        AS leituras_cache,
  ROUND(
    sum(heap_blks_hit)::numeric /
    NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100, 2
  )                                                         AS cache_hit_rate_pct
FROM pg_statio_user_tables;


-- =============================================================================
-- PASSO 6: Verificar uso real dos índices
-- =============================================================================

SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan                                      AS vezes_usado,
  idx_tup_read                                  AS linhas_lidas,
  idx_tup_fetch                                 AS linhas_buscadas
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Índices que NUNCA foram usados (candidatos a remoção em produção):
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY tablename;
