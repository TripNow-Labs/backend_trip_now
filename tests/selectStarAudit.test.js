/**
 * ============================================================
 *  AUDITORIA DE OTIMIZAÇÃO DE QUERIES — SELECT * (TripNow)
 * ============================================================
 *  Objetivo : Garantir que nenhuma query do sistema busque
 *             colunas desnecessárias via SELECT * ou findAll()
 *             sem a cláusula `attributes` restritiva.
 *
 *  Método   : Análise estática do código-fonte (sem conexão ao DB).
 *             Varre todos os arquivos .js em src/.
 *
 *  Por quê  : SELECT * puxa colunas pesadas como `descricao` (TEXT),
 *             `url_imagem_capa` (TEXT), `password_hash` para a
 *             memória — desperdício de I/O em queries de listagem.
 *
 *  Como executar:
 *    npx jest tests/selectStarAudit.test.js --verbose
 * ============================================================
 */

const fs   = require('fs');
const path = require('path');

// ── Caminho raiz do código-fonte ──────────────────────────────────────────────
const SRC_DIR         = path.resolve(__dirname, '../src');
const CONTROLLERS_DIR = path.join(SRC_DIR, 'apps', 'controllers');

// ── Helper: varredura recursiva de arquivos .js ───────────────────────────────
function listarArquivosJS(dir, lista = []) {
  if (!fs.existsSync(dir)) return lista;
  for (const item of fs.readdirSync(dir)) {
    const caminho = path.join(dir, item);
    const stat    = fs.statSync(caminho);
    if (stat.isDirectory() && !['node_modules', '.git', 'migrations'].includes(item)) {
      listarArquivosJS(caminho, lista);
    } else if (item.endsWith('.js')) {
      lista.push(caminho);
    }
  }
  return lista;
}

// ── Helper: extrai trechos de código com contexto de linha ───────────────────
function encontrarOcorrencias(conteudo, regex) {
  const linhas    = conteudo.split('\n');
  const resultado = [];
  linhas.forEach((linha, idx) => {
    if (regex.test(linha) && !linha.trim().startsWith('//') && !linha.trim().startsWith('*')) {
      resultado.push({ linha: idx + 1, conteudo: linha.trim() });
    }
  });
  return resultado;
}

// ── Helper: encontra blocos findAll sem `attributes:` no nível raiz ──────────
function encontrarFindAllSemAttributes(conteudo, nomeArquivo) {
  const violacoes = [];

  // Divide o arquivo em cada ocorrência de findAll(
  const partes = conteudo.split(/\.findAll\s*\(/);

  for (let i = 1; i < partes.length; i++) {
    // Captura até 1200 caracteres após o findAll( para analisar o bloco de opções
    const bloco = partes[i].substring(0, 1200);

    // Calcula a linha aproximada onde este findAll( começa
    const conteudoAte = partes.slice(0, i).join('.findAll(') + '.findAll(';
    const linhaAprox  = conteudoAte.split('\n').length;

    // Se o bloco não tiver nenhum `attributes:`, é uma violação potencial
    if (!bloco.includes('attributes:')) {
      // Extrai a primeira linha do bloco para contexto
      const primeiraLinha = bloco.split('\n')[0].trim().substring(0, 80);
      violacoes.push({
        arquivo: path.relative(SRC_DIR, nomeArquivo),
        linha:   linhaAprox,
        trecho:  `.findAll(${primeiraLinha}...`,
        motivo:  'findAll() sem `attributes:` → potencial SELECT * implícito',
      });
    }
  }

  return violacoes;
}

// =============================================================================
describe('🔍 Auditoria de Queries — Eliminação de SELECT * (Análise Estática)', () => {

  let todosArquivos;
  let arquivosControllers;

  beforeAll(() => {
    todosArquivos       = listarArquivosJS(SRC_DIR);
    arquivosControllers = listarArquivosJS(CONTROLLERS_DIR);

    console.log(`\n📂 Arquivos .js escaneados em src/: ${todosArquivos.length}`);
    console.log(`📂 Controllers escaneados       : ${arquivosControllers.length}`);
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 1 — Nenhum arquivo deve conter "SELECT *" em query raw
  // ══════════════════════════════════════════════════════════════════════════
  it('1. Nenhuma query SQL raw deve conter SELECT * (colunas desnecessárias)', () => {
    const violacoes = [];

    // Regex: captura SELECT * mas ignora comentários e strings de documentação
    const REGEX_SELECT_STAR = /SELECT\s+\*/i;

    for (const arquivo of todosArquivos) {
      const conteudo     = fs.readFileSync(arquivo, 'utf-8');
      const ocorrencias  = encontrarOcorrencias(conteudo, REGEX_SELECT_STAR);

      for (const oc of ocorrencias) {
        violacoes.push({
          arquivo: path.relative(SRC_DIR, arquivo),
          linha:   oc.linha,
          trecho:  oc.conteudo.substring(0, 100),
        });
      }
    }

    // ── Relatório de saída ────────────────────────────────────────────────
    if (violacoes.length > 0) {
      console.log('\n🚨 Violações de SELECT * encontradas:');
      console.log('─'.repeat(60));
      violacoes.forEach(v => {
        console.log(`  ❌ ${v.arquivo}  (linha ${v.linha})`);
        console.log(`     → "${v.trecho}"`);
      });
      console.log('\n  💡 Correção: substitua SELECT * pelas colunas necessárias.');
      console.log('     Ex: SELECT id, nome, email FROM users WHERE ...');
    } else {
      console.log('\n  ✅ APROVADO — Nenhum SELECT * encontrado no código-fonte.');
    }

    expect(violacoes).toHaveLength(0);
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 2 — findAll() nos controllers devem declarar `attributes:`
  // ══════════════════════════════════════════════════════════════════════════
  it('2. Controllers: todo findAll() deve restringir colunas com `attributes:`', () => {
    const violacoes = [];

    for (const arquivo of arquivosControllers) {
      const conteudo = fs.readFileSync(arquivo, 'utf-8');
      const v        = encontrarFindAllSemAttributes(conteudo, arquivo);
      violacoes.push(...v);
    }

    // ── Relatório de saída ────────────────────────────────────────────────
    if (violacoes.length > 0) {
      console.log('\n⚠️  findAll() sem restrição de colunas (SELECT * implícito):');
      console.log('─'.repeat(60));
      violacoes.forEach(v => {
        console.log(`  ❌ ${v.arquivo}  (linha ~${v.linha})`);
        console.log(`     → ${v.trecho}`);
        console.log(`     💡 ${v.motivo}`);
      });
      console.log('\n  💡 Exemplo de correção:');
      console.log('     Roteiro.findAll({');
      console.log('       attributes: ["id", "titulo", "data_inicio", "status"],');
      console.log('       where: { user_id: userId },');
      console.log('       ...                                                   ');
      console.log('     })');
    } else {
      console.log('\n  ✅ APROVADO — Todos os findAll() declaram `attributes:`.');
    }

    expect(violacoes).toHaveLength(0);
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 3 — Campos sensíveis não devem aparecer em listagens amplas
  // ══════════════════════════════════════════════════════════════════════════
  it('3. Campos sensíveis (password_hash, token) não devem vazar em listagens', () => {
    const CAMPOS_SENSIVEIS = ['password_hash', 'refresh_token', 'verification_token'];
    const violacoes        = [];

    // Regex para findAll/findOne que inclua o campo sensível nas colunas selecionadas
    for (const arquivo of arquivosControllers) {
      const conteudo = fs.readFileSync(arquivo, 'utf-8');

      for (const campo of CAMPOS_SENSIVEIS) {
        // Detecta se o campo sensível aparece em `attributes:` de INCLUSÃO (perigoso)
        // IGNORA o padrão correto: `attributes: { exclude: ['campo'] }` (exclusão intencional)
        const regexInclusao = new RegExp(`attributes\\s*:\\s*\\[[^\\]]*['"]${campo}['"]`, 'i');
        const regexExclusao = new RegExp(`exclude\\s*:\\s*\\[[^\\]]*['"]${campo}['"]`, 'i');

        // Só é violação real se o campo aparecer em lista de INCLUSÃO, não de exclusão
        if (regexInclusao.test(conteudo) && !regexExclusao.test(conteudo)) {
          const linhas = conteudo.split('\n');
          linhas.forEach((linha, idx) => {
            if (
              linha.includes(campo) &&
              linha.includes("'") &&
              !linha.trim().startsWith('//') &&
              !/exclude/i.test(linha)   // ignora linhas que são parte de um exclude:
            ) {
              violacoes.push({
                arquivo: path.relative(SRC_DIR, arquivo),
                linha:   idx + 1,
                campo,
                trecho:  linha.trim().substring(0, 80),
              });
            }
          });
        }
      }
    }

    if (violacoes.length > 0) {
      console.log('\n🔐 ALERTA — Campos sensíveis expostos em listagens:');
      violacoes.forEach(v => {
        console.log(`  ❌ ${v.arquivo}:${v.linha} — campo "${v.campo}"`);
        console.log(`     → "${v.trecho}"`);
      });
    } else {
      console.log('\n  ✅ APROVADO — Nenhum campo sensível exposto em listagens.');
    }

    expect(violacoes).toHaveLength(0);
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  TESTE 4 — Relatório de cobertura da auditoria
  // ══════════════════════════════════════════════════════════════════════════
  it('4. Gerar relatório de cobertura da auditoria de queries', () => {
    let totalFindAll = 0;
    let comAttributes = 0;
    let semAttributes = 0;

    for (const arquivo of arquivosControllers) {
      const conteudo = fs.readFileSync(arquivo, 'utf-8');
      const matches  = conteudo.match(/\.findAll\s*\(/g) || [];
      totalFindAll  += matches.length;

      // Analisa cada bloco
      const violacoes = encontrarFindAllSemAttributes(conteudo, arquivo);
      semAttributes  += violacoes.length;
      comAttributes  += matches.length - violacoes.length;
    }

    const percentualCorrecto = totalFindAll > 0
      ? ((comAttributes / totalFindAll) * 100).toFixed(1)
      : '100.0';

    console.log('\n📊 Relatório de Cobertura — Auditoria de Queries:');
    console.log('─'.repeat(50));
    console.log(`   Total de findAll() encontrados : ${totalFindAll}`);
    console.log(`   Com attributes (correto)        : ${comAttributes} ✅`);
    console.log(`   Sem attributes (violação)        : ${semAttributes} ${semAttributes > 0 ? '❌' : '✅'}`);
    console.log(`   Cobertura de boas práticas       : ${percentualCorrecto}%`);
    console.log('─'.repeat(50));

    // Este teste é informativo — não falha, apenas reporta
    expect(totalFindAll).toBeGreaterThanOrEqual(0);
  });
});
