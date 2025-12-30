const axios = require('axios');
const { pexelsApiKey } = require('../../configs/db');

if (!pexelsApiKey) {
  console.error("ATENÇÃO: A chave da API do Pexels (PEXELS_API_KEY) não foi encontrada no seu arquivo .env. As buscas por imagens no Pexels não funcionarão.");
}

const pexelsApi = axios.create({
  baseURL: 'https://api.pexels.com/v1',
  headers: {
    Authorization: pexelsApiKey,
  },
});

async function getPexelsImage(searchParams) {
  if (!pexelsApiKey) {
    return null;
  }

  const { attractionName, city, country, attractionType } = searchParams;

  const queries = [];

  if (attractionName) {
    queries.push(`${attractionName} ${city} ${country} tourist spot`);
    queries.push(`${attractionName} ${city} landmark`);
    queries.push(`${attractionName} ${attractionType}`);
    queries.push(attractionName);
  }

  if (city) {
    queries.push(`${city} ${country} cityscape`);
    queries.push(`${city} travel destination`);
    queries.push(`${city} landscape`);
    queries.push(city);
  }

  const uniqueQueries = [...new Set(queries.map(q => q.replace(/undefined|null/g, '').trim().replace(/ +/g, ' ')).filter(Boolean))];

  for (const query of uniqueQueries) {
    try {
      console.log(`Buscando imagem no Pexels para: "${query}"`);
      const response = await pexelsApi.get('/search', {
        params: {
          query,
          per_page: 5, // Fetch 5 images instead of 1
          orientation: 'landscape'
        },
      });

      if (response.data.photos.length > 0) {
        console.log(`Imagens encontradas no Pexels para a busca: "${query}"`);
        // Select a random photo from the results
        const randomIndex = Math.floor(Math.random() * response.data.photos.length);
        const photo = response.data.photos[randomIndex];

        // CONSTRUÇÃO DA URL OTIMIZADA:
        // Adicionamos os parâmetros 'w' (width) e 'h' (height) à URL original da imagem.
        // A API do Pexels irá redimensionar a imagem para nós.
        return `${photo.src.original}?auto=compress&cs=tinysrgb&w=370&h=200&fit=crop`;
      }
    } catch (error) {
      if (error.response && error.response.status !== 401) {
        console.error(`Erro ao buscar imagem no Pexels para a busca "${query}":`, error.message);
      }
    }
  }
  
  console.log(`Nenhuma imagem encontrada no Pexels para os parâmetros: ${JSON.stringify(searchParams)}`);
  return null;
}

module.exports = {
  getPexelsImage,
};
