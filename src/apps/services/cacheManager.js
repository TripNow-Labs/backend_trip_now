const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');
const CACHE_DIR = path.join(PROJECT_ROOT, 'cache');
const ADMIN_CACHE_FILE = 'tourist_data_geoapify.json';
const CACHE_EXPIRATION_MS = 1 * 60 * 1000; // 1 minuto

/**
 * Agenda a exclusão de um arquivo de cache após um determinado tempo.
 * @param {string} filePath O caminho completo para o arquivo.
 */
const scheduleDelete = (filePath) => {
  setTimeout(() => {
    // Verifica novamente se o arquivo existe antes de tentar excluir
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Falha ao excluir o arquivo de cache ${path.basename(filePath)}:`, err);
        } else {
          console.log(`Arquivo de cache ${path.basename(filePath)} excluído após 1 minuto.`);
        }
      });
    }
  }, CACHE_EXPIRATION_MS);
};

/**
 * Inicia o monitoramento do diretório de cache para novos arquivos.
 */
const watchCache = () => {
  console.log("Gerenciador de cache iniciado. Monitorando o diretório: ", CACHE_DIR);

  // Garante que o diretório de cache exista antes de tentar monitorá-lo.
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  // Verifica os arquivos que JÁ EXISTEM no cache ao iniciar o servidor.
  fs.readdir(CACHE_DIR, (err, files) => {
    if (err) {
      console.error('Erro ao ler o diretório de cache na inicialização:', err);
      return;
    }

    files.forEach(filename => {
      // Ignora o arquivo de admin e arquivos que não são JSON
      if (filename !== ADMIN_CACHE_FILE && filename.endsWith('.json')) {
        const filePath = path.join(CACHE_DIR, filename);
        console.log(`Arquivo de cache pré-existente encontrado: ${filename}. Agendando exclusão.`);
        scheduleDelete(filePath);
      }
    });
  });


  // O fs.watch pode ser instável em alguns sistemas, mas é eficiente.
  const watcher = fs.watch(CACHE_DIR, (eventType, filename) => {
    if (filename) {
        if (filename === ADMIN_CACHE_FILE || !filename.endsWith('.json')) {
            return;
        }

        const filePath = path.join(CACHE_DIR, filename);

        // Verifica se o arquivo realmente existe (o evento 'rename' também é acionado na exclusão)
        // O evento 'change' é mais confiável para detectar a criação/modificação de arquivos.
        if (eventType === 'change' && fs.existsSync(filePath)) {
            console.log(`Novo arquivo de cache detectado: ${filename}. Agendando exclusão em 1 minuto.`);
            scheduleDelete(filePath);
        }
    }
  });

  watcher.on('error', (err) => {
    console.error('Erro no monitor de arquivos de cache (fs.watch):', err);
  });
};

module.exports = { watchCache };
