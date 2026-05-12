-- =============================================================================
-- EXPLAIN ANALYZE — Análise de plano de execução das queries principais
-- =============================================================================
-- Como executar: abra o psql ou pgAdmin e rode cada bloco separadamente.
-- Substitua os valores de exemplo (user_id = 1, etc.) por valores reais do banco.
--
-- O que observar no resultado:
--   "Index Scan using ..." → índice sendo usado ✓
--   "Seq Scan on ..."      → varredura completa (índice NÃO usado)
--   "actual time=X..Y"    → X = tempo até 1ª linha, Y = tempo total (ms)
--   "rows=N"               → linhas retornadas
-- =============================================================================


-- -----------------------------------------------------------------------------
-- QUERY 1: Login — Busca de usuário por e-mail
-- Índice esperado: UNIQUE em users.email (criado automaticamente)
-- -----------------------------------------------------------------------------
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, email, password_hash, name, tipo_usuario, esta_ativo
FROM users
WHERE email = 'teste@email.com';


-- -----------------------------------------------------------------------------
-- QUERY 2: Listagem de roteiros do usuário com JOIN em cidades e países
-- Índice esperado: roteiros_idx_user_id_criado_em
-- -----------------------------------------------------------------------------
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  r.id, r.titulo, r.status, r.e_publico, r.criado_em,
  c.id AS cidade_id, c.nome AS cidade_nome, c.url_imagem,
  p.id AS pais_id,  p.nome AS pais_nome
FROM roteiros r
LEFT JOIN cidades c ON r.cidade_id = c.id
LEFT JOIN paises  p ON c.pais_id   = p.id
WHERE r.user_id = 1                -- <- substitua por um user_id real
ORDER BY r.criado_em DESC;


-- -----------------------------------------------------------------------------
-- QUERY 3: Busca de cidade por nome (usado na criação de roteiro)
-- Índice esperado: cidades_idx_nome_pais_id
-- -----------------------------------------------------------------------------
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, nome, pais_id, url_imagem, custo_medio_diario, moeda
FROM cidades
WHERE nome ILIKE '%Paris%'
ORDER BY nome;


-- -----------------------------------------------------------------------------
-- QUERY 4: Busca de atrações por cidade
-- Índice esperado: atracoes_turisticas_idx_cidade_id
-- -----------------------------------------------------------------------------
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, nome, categoria, duracao_horas, preco, avaliacao
FROM atracoes_turisticas
WHERE cidade_id = 1                -- <- substitua por um cidade_id real
ORDER BY avaliacao DESC NULLS LAST;


-- -----------------------------------------------------------------------------
-- QUERY 5: Notificações não lidas de um usuário
-- Índice esperado: notificacoes_idx_user_id
-- -----------------------------------------------------------------------------
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, tipo, titulo, mensagem, criado_em
FROM notificacoes
WHERE user_id = 1                  -- <- substitua por um user_id real
  AND foi_lida = FALSE
ORDER BY criado_em DESC;


-- -----------------------------------------------------------------------------
-- QUERY 6: Roteiro com todas as atrações do dia
-- Índices esperados: roteiro_atracoes_uq_roteiro_id_atracao_id, atracoes_turisticas PK
-- -----------------------------------------------------------------------------
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  ra.numero_dia, ra.ordem_no_dia, ra.horario,
  a.nome, a.categoria, a.duracao_horas, a.endereco
FROM roteiro_atracoes ra
JOIN atracoes_turisticas a ON ra.atracao_id = a.id
WHERE ra.roteiro_id = 1            -- <- substitua por um roteiro_id real
ORDER BY ra.numero_dia, ra.ordem_no_dia;


-- =============================================================================
-- COMPARAÇÃO: ANTES e DEPOIS dos índices
-- Para testar o impacto dos índices, desative-os temporariamente:
-- =============================================================================

-- Desabilita uso de índices (apenas para comparação — use em ambiente de dev):
-- SET enable_indexscan  = OFF;
-- SET enable_bitmapscan = OFF;

-- Rode a query desejada aqui para ver o tempo SEM índice:
-- EXPLAIN (ANALYZE, BUFFERS) SELECT ...;

-- Reabilita:
-- SET enable_indexscan  = ON;
-- SET enable_bitmapscan = ON;
