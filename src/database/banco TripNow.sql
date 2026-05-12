CREATE TYPE "tipo_usuario_enum" AS ENUM('usuario', 'admin');

CREATE TYPE "faixa_orcamento_enum" AS ENUM('economico', 'medio', 'premium');

CREATE TYPE "preferencia_duracao_enum" AS ENUM('fim_de_semana', 'curta', 'longa');

CREATE TYPE "status_parceiro_enum" AS ENUM('ativo', 'inativo', 'pendente', 'suspenso');

CREATE TYPE "tipo_desconto_enum" AS ENUM('percentual', 'valor_fixo');

CREATE TYPE "status_cupom_enum" AS ENUM(
  'ativo',
  'inativo',
  'pendente',
  'expirado',
  'suspenso'
);

CREATE TYPE "publico_alvo_enum" AS ENUM('todos', 'novos_usuarios', 'usuarios_premium');

CREATE TYPE "status_roteiro_enum" AS ENUM(
  'planejado',
  'em_andamento',
  'concluido',
  'cancelado'
);

CREATE TYPE "tipo_dado_enum" AS ENUM('booleano', 'inteiro', 'string', 'json');

CREATE TYPE "status_relatorio_enum" AS ENUM('pendente', 'processando', 'concluido', 'falhou');

CREATE TYPE "status_transacao_enum" AS ENUM('pendente', 'concluida', 'falhou', 'reembolsada');

CREATE TYPE "plano_assinatura_enum" AS ENUM('mensal', 'trimestral', 'anual');

CREATE TYPE "status_assinatura_enum" AS ENUM('ativa', 'cancelada', 'inadimplente', 'expirada');

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" "VARCHAR(255)" UNIQUE NOT NULL,
  "password_hash" "VARCHAR(255)" NOT NULL,
  "user_name" "VARCHAR(255)" NOT NULL,
  "name" "VARCHAR(255)" NOT NULL,
  "tipo_usuario" tipo_usuario_enum NOT NULL DEFAULT 'usuario',
  "telefone" "VARCHAR(50)",
  "data_nascimento" DATE,
  "cidade" "VARCHAR(100)",
  "pais" "VARCHAR(100)",
  "biografia" TEXT,
  "rede_social" "VARCHAR(100)",
  "url_foto_perfil" TEXT,
  "esta_ativo" BOOLEAN DEFAULT TRUE,
  "id_assinatura" INT,
  "ultimo_login_em" TIMESTAMP,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "preferencias_usuario" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "faixa_orcamento" faixa_orcamento_enum DEFAULT 'medio',
  "preferencia_duracao" preferencia_duracao_enum DEFAULT 'curta',
  "notificacao_promocoes" BOOLEAN DEFAULT TRUE,
  "notificacao_lembretes" BOOLEAN DEFAULT TRUE,
  "notificacao_clima" BOOLEAN DEFAULT FALSE,
  "notificacao_comunidade" BOOLEAN DEFAULT TRUE,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "interesses_usuario" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "tipo_interesse" "VARCHAR(50)" NOT NULL,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "conquistas" (
  "id" SERIAL PRIMARY KEY,
  "nome" "VARCHAR(100)" NOT NULL,
  "descricao" TEXT NOT NULL,
  "icone" "VARCHAR(50)",
  "tipo_requisito" "VARCHAR(50)",
  "valor_requisito" INT,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "conquistas_usuario" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "conquista_id" INT NOT NULL,
  "desbloqueado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "paises" (
  "id" SERIAL PRIMARY KEY,
  "nome" "VARCHAR(100)" NOT NULL,
  "continente" "VARCHAR(50)" NOT NULL,
  "moeda" "VARCHAR(10)",
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "cidades" (
  "id" SERIAL PRIMARY KEY,
  "nome" "VARCHAR(100)" NOT NULL,
  "pais_id" INT NOT NULL,
  "descricao" TEXT,
  "populacao" INT,
  "url_imagem" TEXT,
  "custo_medio_diario" "NUMERIC(10,2)",
  "moeda" "VARCHAR(10)",
  "avaliacao" "NUMERIC(3,2)",
  "tipo" "VARCHAR(50)",
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "atracoes_turisticas" (
  "id" SERIAL PRIMARY KEY,
  "cidade_id" INT NOT NULL,
  "nome" "VARCHAR(255)" NOT NULL,
  "categoria" "VARCHAR(50)",
  "descricao" TEXT,
  "duracao_horas" "NUMERIC(3,1)",
  "preco" "NUMERIC(10,2)",
  "moeda" "VARCHAR(10)",
  "e_gratuito" BOOLEAN DEFAULT FALSE,
  "avaliacao" "NUMERIC(3,2)",
  "url_imagem" TEXT,
  "endereco" TEXT,
  "latitude" "NUMERIC(10,8)",
  "longitude" "NUMERIC(11,8)",
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "parceiros" (
  "id" SERIAL PRIMARY KEY,
  "razao_social" "VARCHAR(255)" NOT NULL,
  "nome_contato" "VARCHAR(255)",
  "email" "VARCHAR(255)" UNIQUE NOT NULL,
  "telefone" "VARCHAR(50)",
  "website" "VARCHAR(255)",
  "categoria" "VARCHAR(50)",
  "endereco" TEXT,
  "cidade_id" INT,
  "url_logo" TEXT,
  "descricao" TEXT,
  "data_inicio_contrato" DATE,
  "data_fim_contrato" DATE,
  "taxa_comissao" "NUMERIC(5,2)",
  "status" status_parceiro_enum DEFAULT 'ativo',
  "total_cupons_criados" INT DEFAULT 0,
  "total_cupons_usados" INT DEFAULT 0,
  "total_receita_gerada" "NUMERIC(12,2)" DEFAULT 0,
  "avaliacao" "NUMERIC(3,2)",
  "criado_por" INT,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "cupons" (
  "id" SERIAL PRIMARY KEY,
  "parceiro_id" INT,
  "cidade_id" INT,
  "nome_parceiro" "VARCHAR(255)" NOT NULL,
  "titulo" "VARCHAR(255)" NOT NULL,
  "descricao" TEXT,
  "tipo_desconto" tipo_desconto_enum NOT NULL,
  "valor_desconto" "NUMERIC(10,2)" NOT NULL,
  "moeda" "VARCHAR(10)",
  "categoria" "VARCHAR(50)",
  "valido_ate" DATE,
  "codigo_cupom" "VARCHAR(50)",
  "termos_condicoes" TEXT,
  "esta_ativo" BOOLEAN DEFAULT TRUE,
  "status" status_cupom_enum DEFAULT 'ativo',
  "maximo_usos" INT,
  "usos_atuais" INT DEFAULT 0,
  "maximo_usos_por_usuario" INT DEFAULT 1,
  "url_imagem" TEXT,
  "prioridade" INT DEFAULT 0,
  "compra_minima" "NUMERIC(10,2)",
  "publico_alvo" publico_alvo_enum DEFAULT 'todos',
  "criado_por" INT,
  "aprovado_por" INT,
  "aprovado_em" TIMESTAMP,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "roteiros" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "cidade_id" INT NOT NULL,
  "titulo" "VARCHAR(255)" NOT NULL,
  "descricao" TEXT,
  "duracao_dias" INT NOT NULL,
  "data_inicio" DATE,
  "numero_pessoas" INT DEFAULT 1,
  "horario_preferencial" "VARCHAR(50)",
  "orcamento_total" "NUMERIC(10,2)",
  "moeda" "VARCHAR(10)",
  "status" status_roteiro_enum DEFAULT 'planejado',
  "e_publico" BOOLEAN DEFAULT FALSE,
  "permitir_comentarios" BOOLEAN DEFAULT TRUE,
  "permitir_copia" BOOLEAN DEFAULT TRUE,
  "mostrar_custos" BOOLEAN DEFAULT TRUE,
  "url_imagem_capa" TEXT,
  "contagem_visualizacoes" INT DEFAULT 0,
  "contagem_compartilhamentos" INT DEFAULT 0,
  "contagem_copias" INT DEFAULT 0,
  "avaliacao" INT,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "roteiro_atracoes" (
  "id" SERIAL PRIMARY KEY,
  "roteiro_id" INT NOT NULL,
  "atracao_id" INT NOT NULL,
  "numero_dia" INT NOT NULL,
  "horario" "VARCHAR(50)",
  "ordem_no_dia" INT,
  "anotacoes" TEXT,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "roteiro_tags" (
  "id" SERIAL PRIMARY KEY,
  "roteiro_id" INT NOT NULL,
  "tag" "VARCHAR(50)" NOT NULL,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "roteiro_curtidas" (
  "id" SERIAL PRIMARY KEY,
  "roteiro_id" INT NOT NULL,
  "user_id" INT NOT NULL,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "roteiro_comentarios" (
  "id" SERIAL PRIMARY KEY,
  "roteiro_id" INT NOT NULL,
  "user_id" INT NOT NULL,
  "texto_comentario" TEXT NOT NULL,
  "comentario_pai_id" INT,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "user_cupons" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "cupom_id" INT NOT NULL,
  "roteiro_id" INT,
  "usado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "user_seguidores" (
  "id" SERIAL PRIMARY KEY,
  "seguidor_id" INT NOT NULL,
  "seguido_id" INT NOT NULL,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  CHECK (seguidor_id != seguido_id)
);

CREATE TABLE "user_paises_visitados" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "pais_id" INT NOT NULL,
  "visitado_em" DATE,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "roteiro_despesas" (
  "id" SERIAL PRIMARY KEY,
  "roteiro_id" INT NOT NULL,
  "categoria" "VARCHAR(50)" NOT NULL,
  "descricao" "VARCHAR(255)",
  "valor" "NUMERIC(10,2)" NOT NULL,
  "moeda" "VARCHAR(10)",
  "data" DATE,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "roteiros_salvos" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "roteiro_id" INT NOT NULL,
  "salvo_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "api_cache" (
  "chave_pesquisa" "VARCHAR(255)" PRIMARY KEY NOT NULL,
  "resultado_json" JSONB NOT NULL,
  "data_expiracao" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "created_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "notificacoes" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "tipo" "VARCHAR(50)" NOT NULL,
  "titulo" "VARCHAR(255)" NOT NULL,
  "mensagem" TEXT,
  "url_link" TEXT,
  "foi_lida" BOOLEAN DEFAULT FALSE,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "metricas_sistema" (
  "id" SERIAL PRIMARY KEY,
  "data" DATE UNIQUE NOT NULL,
  "contagem_usuarios_ativos" INT DEFAULT 0,
  "contagem_novos_usuarios" INT DEFAULT 0,
  "contagem_total_usuarios" INT DEFAULT 0,
  "contagem_roteiros_criados" INT DEFAULT 0,
  "contagem_total_roteiros" INT DEFAULT 0,
  "contagem_cupons_ativos" INT DEFAULT 0,
  "contagem_cupons_usados" INT DEFAULT 0,
  "receita_total" "NUMERIC(12,2)" DEFAULT 0,
  "total_visualizacoes_pagina" INT DEFAULT 0,
  "duracao_media_sessao" INT,
  "taxa_rejeicao" "NUMERIC(5,2)",
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "logs_atividades" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT,
  "tipo_acao" "VARCHAR(50)" NOT NULL,
  "tipo_entidade" "VARCHAR(50)",
  "entidade_id" INT,
  "descricao" TEXT,
  "metadados" JSONB,
  "endereco_ip" "VARCHAR(45)",
  "user_agent" TEXT,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "analytics_cupons" (
  "id" SERIAL PRIMARY KEY,
  "cupom_id" INT NOT NULL,
  "data" DATE NOT NULL,
  "contagem_visualizacoes" INT DEFAULT 0,
  "contagem_cliques" INT DEFAULT 0,
  "contagem_usos" INT DEFAULT 0,
  "receita_gerada" "NUMERIC(10,2)" DEFAULT 0,
  "taxa_conversao" "NUMERIC(5,2)",
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "configuracoes_sistema" (
  "id" SERIAL PRIMARY KEY,
  "chave_configuracao" "VARCHAR(100)" UNIQUE NOT NULL,
  "valor_configuracao" TEXT,
  "tipo_dado" tipo_dado_enum NOT NULL,
  "categoria" "VARCHAR(50)",
  "descricao" TEXT,
  "e_publico" BOOLEAN DEFAULT FALSE,
  "atualizado_por" INT,
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "relatorios" (
  "id" SERIAL PRIMARY KEY,
  "gerado_por" INT,
  "tipo_relatorio" "VARCHAR(50)" NOT NULL,
  "titulo" "VARCHAR(255)" NOT NULL,
  "descricao" TEXT,
  "inicio_periodo" DATE,
  "fim_periodo" DATE,
  "filtros" JSONB,
  "url_arquivo" TEXT,
  "formato_arquivo" "VARCHAR(10)",
  "status" status_relatorio_enum DEFAULT 'concluido',
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "transacoes_receita" (
  "id" SERIAL PRIMARY KEY,
  "parceiro_id" INT,
  "cupom_id" INT,
  "user_id" INT,
  "roteiro_id" INT,
  "tipo_transacao" "VARCHAR(50)",
  "valor" "NUMERIC(10,2)" NOT NULL,
  "moeda" "VARCHAR(10)",
  "valor_comissao" "NUMERIC(10,2)",
  "taxa_comissao" "NUMERIC(5,2)",
  "status" status_transacao_enum DEFAULT 'pendente',
  "data_pagamento" DATE,
  "descricao" TEXT,
  "metadados" JSONB,
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "assinaturas" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "plano" plano_assinatura_enum NOT NULL,
  "status" status_assinatura_enum DEFAULT 'ativa',
  "valor" "NUMERIC(10,2)" NOT NULL,
  "moeda" "VARCHAR(10)" DEFAULT 'BRL',
  "data_inicio" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "data_fim" TIMESTAMP NOT NULL,
  "renovacao_automatica" BOOLEAN DEFAULT TRUE,
  "metodo_pagamento" "VARCHAR(50)",
  "criado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "atualizado_em" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX "users_idx_tipo_usuario" ON "users" ("tipo_usuario");

CREATE INDEX "preferencias_usuario_idx_user_id" ON "preferencias_usuario" ("user_id");

CREATE UNIQUE INDEX "interesses_usuario_idx_user_id_tipo_interesse" ON "interesses_usuario" ("user_id", "tipo_interesse");

CREATE UNIQUE INDEX "conquistas_usuario_idx_user_id_conquista_id" ON "conquistas_usuario" ("user_id", "conquista_id");

CREATE INDEX "paises_idx_continente" ON "paises" ("continente");

CREATE INDEX "cidades_idx_pais_id" ON "cidades" ("pais_id");

CREATE INDEX "cidades_idx_tipo" ON "cidades" ("tipo");

CREATE INDEX "atracoes_turisticas_idx_cidade_id" ON "atracoes_turisticas" ("cidade_id");

CREATE INDEX "atracoes_turisticas_idx_categoria" ON "atracoes_turisticas" ("categoria");

CREATE INDEX "parceiros_idx_status" ON "parceiros" ("status");

CREATE INDEX "parceiros_idx_categoria" ON "parceiros" ("categoria");

CREATE INDEX "cupons_idx_parceiro_id" ON "cupons" ("parceiro_id");

CREATE INDEX "cupons_idx_cidade_id" ON "cupons" ("cidade_id");

CREATE INDEX "cupons_idx_status" ON "cupons" ("status");

CREATE INDEX "cupons_idx_valido_ate" ON "cupons" ("valido_ate");

CREATE INDEX "roteiros_idx_user_id" ON "roteiros" ("user_id");

CREATE INDEX "roteiros_idx_cidade_id" ON "roteiros" ("cidade_id");

CREATE INDEX "roteiros_idx_status" ON "roteiros" ("status");

CREATE INDEX "roteiros_idx_e_publico" ON "roteiros" ("e_publico");

CREATE INDEX "roteiros_idx_criado_em" ON "roteiros" ("criado_em");

CREATE UNIQUE INDEX "roteiro_atracoes_idx_roteiro_id_atracao_id" ON "roteiro_atracoes" ("roteiro_id", "atracao_id");

CREATE UNIQUE INDEX "roteiro_tags_idx_roteiro_id_tag" ON "roteiro_tags" ("roteiro_id", "tag");

CREATE UNIQUE INDEX "roteiro_curtidas_idx_roteiro_id_user_id" ON "roteiro_curtidas" ("roteiro_id", "user_id");

CREATE INDEX "roteiro_curtidas_idx_user_id" ON "roteiro_curtidas" ("user_id");

CREATE INDEX "roteiro_comentarios_idx_roteiro_id" ON "roteiro_comentarios" ("roteiro_id");

CREATE INDEX "roteiro_comentarios_idx_user_id" ON "roteiro_comentarios" ("user_id");

CREATE UNIQUE INDEX "user_cupons_idx_user_id_cupom_id" ON "user_cupons" ("user_id", "cupom_id");

CREATE INDEX "user_cupons_idx_cupom_id" ON "user_cupons" ("cupom_id");

CREATE UNIQUE INDEX "user_seguidores_idx_seguidor_id_seguido_id" ON "user_seguidores" ("seguidor_id", "seguido_id");

CREATE INDEX "user_seguidores_idx_seguido_id" ON "user_seguidores" ("seguido_id");

CREATE UNIQUE INDEX "user_paises_visitados_idx_user_id_pais_id" ON "user_paises_visitados" ("user_id", "pais_id");

CREATE INDEX "roteiro_despesas_idx_roteiro_id" ON "roteiro_despesas" ("roteiro_id");

CREATE UNIQUE INDEX "roteiros_salvos_idx_user_id_roteiro_id" ON "roteiros_salvos" ("user_id", "roteiro_id");

CREATE INDEX "notificacoes_idx_user_id" ON "notificacoes" ("user_id");

CREATE INDEX "notificacoes_idx_foi_lida" ON "notificacoes" ("foi_lida");

CREATE INDEX "logs_atividades_idx_user_id" ON "logs_atividades" ("user_id");

CREATE INDEX "logs_atividades_idx_tipo_acao" ON "logs_atividades" ("tipo_acao");

CREATE INDEX "logs_atividades_idx_criado_em" ON "logs_atividades" ("criado_em");

CREATE UNIQUE INDEX "analytics_cupons_idx_cupom_id_data" ON "analytics_cupons" ("cupom_id", "data");

CREATE INDEX "analytics_cupons_idx_data" ON "analytics_cupons" ("data");

CREATE INDEX "configuracoes_sistema_idx_categoria" ON "configuracoes_sistema" ("categoria");

CREATE INDEX "relatorios_idx_gerado_por" ON "relatorios" ("gerado_por");

CREATE INDEX "relatorios_idx_tipo_relatorio" ON "relatorios" ("tipo_relatorio");

CREATE INDEX "relatorios_idx_criado_em" ON "relatorios" ("criado_em");

CREATE INDEX "transacoes_receita_idx_parceiro_id" ON "transacoes_receita" ("parceiro_id");

CREATE INDEX "transacoes_receita_idx_status" ON "transacoes_receita" ("status");

CREATE INDEX "transacoes_receita_idx_criado_em" ON "transacoes_receita" ("criado_em");

CREATE INDEX "assinaturas_idx_user_id" ON "assinaturas" ("user_id");

CREATE INDEX "assinaturas_idx_status" ON "assinaturas" ("status");

ALTER TABLE "preferencias_usuario"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "interesses_usuario"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "conquistas_usuario"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "conquistas_usuario"
ADD FOREIGN KEY ("conquista_id") REFERENCES "conquistas" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cidades"
ADD FOREIGN KEY ("pais_id") REFERENCES "paises" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "atracoes_turisticas"
ADD FOREIGN KEY ("cidade_id") REFERENCES "cidades" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "parceiros"
ADD FOREIGN KEY ("cidade_id") REFERENCES "cidades" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "parceiros"
ADD FOREIGN KEY ("criado_por") REFERENCES "users" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cupons"
ADD FOREIGN KEY ("parceiro_id") REFERENCES "parceiros" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cupons"
ADD FOREIGN KEY ("cidade_id") REFERENCES "cidades" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cupons"
ADD FOREIGN KEY ("criado_por") REFERENCES "users" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cupons"
ADD FOREIGN KEY ("aprovado_por") REFERENCES "users" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiros"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiros"
ADD FOREIGN KEY ("cidade_id") REFERENCES "cidades" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiro_atracoes"
ADD FOREIGN KEY ("roteiro_id") REFERENCES "roteiros" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiro_atracoes"
ADD FOREIGN KEY ("atracao_id") REFERENCES "atracoes_turisticas" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiro_tags"
ADD FOREIGN KEY ("roteiro_id") REFERENCES "roteiros" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiro_curtidas"
ADD FOREIGN KEY ("roteiro_id") REFERENCES "roteiros" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiro_curtidas"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiro_comentarios"
ADD FOREIGN KEY ("roteiro_id") REFERENCES "roteiros" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiro_comentarios"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiro_comentarios"
ADD FOREIGN KEY ("comentario_pai_id") REFERENCES "roteiro_comentarios" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_cupons"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_cupons"
ADD FOREIGN KEY ("cupom_id") REFERENCES "cupons" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_cupons"
ADD FOREIGN KEY ("roteiro_id") REFERENCES "roteiros" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_seguidores"
ADD FOREIGN KEY ("seguidor_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_seguidores"
ADD FOREIGN KEY ("seguido_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_paises_visitados"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_paises_visitados"
ADD FOREIGN KEY ("pais_id") REFERENCES "paises" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiro_despesas"
ADD FOREIGN KEY ("roteiro_id") REFERENCES "roteiros" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiros_salvos"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roteiros_salvos"
ADD FOREIGN KEY ("roteiro_id") REFERENCES "roteiros" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notificacoes"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "logs_atividades"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "analytics_cupons"
ADD FOREIGN KEY ("cupom_id") REFERENCES "cupons" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "configuracoes_sistema"
ADD FOREIGN KEY ("atualizado_por") REFERENCES "users" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "relatorios"
ADD FOREIGN KEY ("gerado_por") REFERENCES "users" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "transacoes_receita"
ADD FOREIGN KEY ("parceiro_id") REFERENCES "parceiros" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "transacoes_receita"
ADD FOREIGN KEY ("cupom_id") REFERENCES "cupons" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "transacoes_receita"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "transacoes_receita"
ADD FOREIGN KEY ("roteiro_id") REFERENCES "roteiros" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "assinaturas"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "users"
ADD FOREIGN KEY ("id_assinatura") REFERENCES "assinaturas" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;