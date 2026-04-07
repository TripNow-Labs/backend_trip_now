const axios = require('axios');
const API_KEY = process.env.TRIPADVISOR_API_KEY;

/**
 * 1. Faz uma busca simples no TripAdvisor retornando o Location ID e o Objeto.
 * Pode ser usada tanto para achar a cidade quanto para listar suas atrações.
 */
async function searchLocations(query, category = 'geos') {
    const url = `https://api.content.tripadvisor.com/api/v1/location/search`;
    try {
        const response = await axios.get(url, {
            params: {
                searchQuery: query,
                category: category, // 'geos' para cidades, 'attractions' para pontos turísticos
                language: 'pt',
                key: API_KEY
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Erro no Location Search do TripAdvisor:", error.message);
        return null; // Retorna null em vez de quebrar
    }
}

/**
 * 2. Traz a descrição rica da cidade buscando pelos detalhes do Location ID.
 */
async function getCityDetails(locationId) {
    const url = `https://api.content.tripadvisor.com/api/v1/location/${locationId}/details`;
    try {
        const response = await axios.get(url, {
            params: {
                language: 'pt',
                currency: 'BRL',
                key: API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erro no Location Details do TripAdvisor:", error.message);
        return null;
    }
}

/**
 * 3. Busca a foto principal do local (Cidade ou Atração turística)
 */
async function getLocationPhotos(locationId) {
    const url = `https://api.content.tripadvisor.com/api/v1/location/${locationId}/photos`;
    try {
        const response = await axios.get(url, {
            params: {
                language: 'pt',
                key: API_KEY
            }
        });
        const photos = response.data.data;
        if (photos && photos.length > 0) {
            // Retorna a melhor foto disponível (grande/original)
            const images = photos[0].images;
            return images.original?.url || images.large?.url || images.medium?.url || null;
        }
        return null;
    } catch (error) {
        console.error("Erro no Location Photos do TripAdvisor:", error.message);
        return null;
    }
}

module.exports = {
    searchLocations,
    getCityDetails,
    getLocationPhotos
};
