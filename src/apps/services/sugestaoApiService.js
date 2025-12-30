require('dotenv').config();
const { getWikipediaDescription, getWikipediaImage } = require('./wikipedia');
const { getCurrencyByCountryCode } = require('./currency');
const { getPexelsImage } = require('./pexels');

const API_KEY = process.env.GEOAPIFY_API_KEY;

/**
 * Função auxiliar para buscar as coordenadas de uma cidade.
 * @param {string} cityName
 * @returns {Promise<object|null>}
 */
async function findCityCoords(cityName) {
    const url = `https://api.geoapify.com/v1/geocode/search?city=${encodeURIComponent(cityName)}&lang=pt&apiKey=${API_KEY}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Timeout de 15 segundos

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        return data.features.length > 0 ? data.features[0] : null;
    } catch (error) {
        console.error('SugestaoApiService findCityCoords error:', error);
        return null;
    }
}

/**
 * Processa a lista de atrações da API para o formato esperado pela aplicação.
 * @param {Array} attractions - Array de atrações da API Geoapify.
 * @param {object} cityInfo - Informações da cidade (nome, país, etc.).
 * @param {string} currency - Código da moeda.
 * @returns {Promise<Array>}
 */
async function processAttractions(attractions, cityInfo, currency) {
    return Promise.all(attractions.map(async (attraction) => {
        const props = attraction.properties;
        const name = props.name;

        let tipo = "desconhecido";
        if (props.categories && props.categories.length > 0) {
            // Pega a categoria mais específica
            tipo = props.categories.find(c => c.includes('.')) || props.categories[0];
            tipo = tipo.split('.').pop();
        }

        let image = await getWikipediaImage({ attractionName: name, city: cityInfo.name, country: cityInfo.country });
        if (!image) {
            image = await getPexelsImage({ attractionName: name, city: cityInfo.name, country: cityInfo.country, attractionType: tipo });
        }
        const description = await getWikipediaDescription(`${name}, ${cityInfo.name}`, 'landmark');

        return {
            nome: name || 'Nome não disponível',
            categoria: 'geral',
            descricao: description,
            moeda: currency,
            e_gratuito: !props.charge,
            avaliacao: props.rank?.importance || 0,
            url_imagem: image || '',
            endereco: props.formatted || 'Endereço não disponível',
            latitude: props.lat,
            longitude: props.lon,
            tipo: tipo,
            website: props.website || null,
            telefone: props.contact?.phone || null,
            horario_funcionamento: props.opening_hours || null,
            acessibilidade_cadeira_de_rodas: props.wheelchair || 'não informado'
        };
    }));
}

/**
 * Busca sugestões de atrações para uma cidade, com filtro opcional de categoria.
 * @param {string} cityName - Nome da cidade.
 * @param {string|null} category - Categoria para filtrar (ex: 'museum').
 * @returns {Promise<Array>}
 */
async function findSuggestions(cityName, category = null) {
    // Removendo o log anterior para manter o console limpo.
    console.log(`\n[DEBUG] Iniciando findSuggestions para cidade: "${cityName}" com categoria: "${category}"`);
    const cityData = await findCityCoords(cityName);
    if (!cityData) return [];

    const { lat, lon, country, country_code, city: localizedCityName, place_id: placeId } = cityData.properties;
    const currency = await getCurrencyByCountryCode(country_code);

    // --- LÓGICA DE MAPEAMENTO DE CATEGORIAS ---
    // Este mapa "traduz" nossas categorias internas para as categorias exatas da API Geoapify.
    const categoryMap = {
        'museum': 'entertainment.museum',
        'restaurant': 'catering.restaurant',
        'park': 'leisure.park',
        'hotel': 'accommodation.hotel',
        'praia': 'beach',
        'museu': 'entertainment.museum'
    };

    let categoriesQuery;
    if (category) {
        // Usa o mapa para encontrar a categoria correta da API.
        categoriesQuery = categoryMap[category] || category;
    } else {
        // Caso geral sem filtro, busca por atrações turísticas gerais.
        categoriesQuery = 'tourism.attraction';
    }

    // --- LÓGICA CORRETA: Usando o filtro por 'place_id' como sugerido pela documentação ---
    const filterQuery = `place:${placeId}`;
    const url = `https://api.geoapify.com/v2/places?categories=${categoriesQuery}&filter=${filterQuery}&limit=20&lang=pt&apiKey=${API_KEY}&details=contact,opening_hours,charge,wheelchair,website`;
    console.log(`[DEBUG] URL da API montada: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Timeout de 15 segundos

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        const attractionsFromApi = data.features || [];
        console.log(`[DEBUG] API retornou ${attractionsFromApi.length} atrações para a busca.`);

        if (attractionsFromApi.length === 0) {
            return [];
        }

        // Processa as atrações para o formato final
        return await processAttractions(attractionsFromApi, { name: localizedCityName, country }, currency);

    } catch (error) {
        console.error(`SugestaoApiService findSuggestions error for "${cityName}" with category "${category}":`, error);
        return [];
    }
}

module.exports = { findSuggestions };