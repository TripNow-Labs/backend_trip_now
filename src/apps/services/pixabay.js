require('dotenv').config();
const axios = require('axios');

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

if (!PIXABAY_API_KEY) {
  console.error("ATENÇÃO: A chave da API do Pixabay (PIXABAY_API_KEY) não foi encontrada no seu arquivo .env. As buscas por imagens no Pixabay não funcionarão.");
}

async function getPixabayImage(searchParams) {
  if (!PIXABAY_API_KEY) {
    return null;
  }

  const { cityName, country } = searchParams;

  // Monta as queries de busca
  const queries = [];
  if (cityName && country) {
    queries.push(`${cityName} ${country}`);
  }
  if (cityName) {
    queries.push(cityName);
  }

  for (const query of queries) {
    try {
      console.log(`Buscando imagem no Pixabay para: "${query}"`);
      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: PIXABAY_API_KEY,
          q: query,
          image_type: 'photo',
          orientation: 'horizontal',
          per_page: 5,
          safesearch: true
        }
      });

      if (response.data && response.data.hits && response.data.hits.length > 0) {
        console.log(`Imagens encontradas no Pixabay para a busca: "${query}"`);
        const randomIndex = Math.floor(Math.random() * response.data.hits.length);
        const photo = response.data.hits[randomIndex];
        
        return photo.webformatURL; // A URL em tamanho médio (max 640px)
      }
    } catch (error) {
      console.error(`Erro ao buscar imagem no Pixabay para a busca "${query}":`, error.message);
    }
  }

  console.log(`Nenhuma imagem encontrada no Pixabay para os parâmetros: ${JSON.stringify(searchParams)}`);
  return null;
}

module.exports = {
  getPixabayImage,
};