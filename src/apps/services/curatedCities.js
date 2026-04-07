const fs = require('fs');
const path = require('path');
const { getWikipediaDescription, getWikipediaImage } = require('./wikipedia');
const { findCity, findAttractionByName } = require('./geoapify');
const { getCurrencyByCountryCode } = require('./currency');
const { getPexelsImage } = require('./pexels');
const { getPixabayImage } = require('./pixabay');
const { searchLocations, getCityDetails, getLocationPhotos } = require('./tripadvisorApiService');

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');
const CURATED_CITIES_JSON_PATH = path.join(PROJECT_ROOT, 'data', 'curated-cities.json');

// Função para ler as cidades curadas do arquivo JSON
function getRawCuratedCities() {
    const fileContent = fs.readFileSync(CURATED_CITIES_JSON_PATH, 'utf8');
    return JSON.parse(fileContent);
}

async function fetchFromApiAndCache(cityData) {
    const { name: cityName, touristSpots: spots } = cityData;

    console.log(`Buscando dados curados para "${cityName}" da API com TripAdvisor como apoio...`);

    if (!spots || !Array.isArray(spots)) {
        console.error(`A cidade curada "${cityName}" não possui uma lista de 'touristSpots'.`);
        return null;
    }

    const citySearchResult = await findCity(cityName);
    if (!citySearchResult) return null;

    const { lat, lon, country, country_code } = citySearchResult.properties;
    const currency = await getCurrencyByCountryCode(country_code) || 'USD';
    
    // Identifica o ID da cidade no TripAdvisor para pegar FOTO PRINCIPAL e DESCRIÇÃO
    const citySearch = await searchLocations(cityName, 'geos');
    const cityLocationId = citySearch && citySearch.length > 0 ? citySearch[0].location_id : null;

    let cityImage = null;
    let cityDescription = null;

    if (cityLocationId) {
        cityImage = await getLocationPhotos(cityLocationId);
        const cityDetailsData = await getCityDetails(cityLocationId);
        cityDescription = cityDetailsData?.description;
    }

    if (!cityDescription) {
        cityDescription = await getWikipediaDescription(cityName);
    }
    
    // Fallbacks para foto da Cidade
    if (!cityImage) {
        cityImage = await getPixabayImage({ cityName: cityName, country: country });
    }
    if (!cityImage) {
        cityImage = await getPexelsImage({ attractionName: cityName, city: cityName, country: country });
    }

    // Processamento de cada ponto turístico da Curadoria (JSON)
    const processedTouristSpots = await Promise.all(spots.map(async (attractionName) => {
        const attractionDetails = await findAttractionByName(attractionName, lat, lon);
        const attractionDescription = await getWikipediaDescription(attractionName);
        
        let attractionImage = null;
        // Bate no TripAdvisor para extrair a FOTO PRINCIPAL do Ponto Curado
        const attrSearch = await searchLocations(attractionName, 'attractions');
        const attrLocationId = attrSearch && attrSearch.length > 0 ? attrSearch[0].location_id : null;
        if (attrLocationId) {
            attractionImage = await getLocationPhotos(attrLocationId);
        }

        // Fallbacks gratuitos
        if (!attractionImage) {
            attractionImage = await getPixabayImage({ cityName: attractionName, country: cityName });
        }
        if (!attractionImage) {
            attractionImage = await getPexelsImage({ attractionName: attractionName, city: cityName, country: country });
        }
        
        const props = attractionDetails?.properties || {};

        return {
            nome: attractionName,
            categoria: 'geral',
            descricao: attractionDescription,
            moeda: currency,
            e_gratuito: !props.charge,
            avaliacao: props.rank?.importance || 0,
            url_imagem: attractionImage || '',
            endereco: props.formatted || 'Endereço indisponível',
            latitude: attractionDetails?.geometry.coordinates[1] || null,
            longitude: attractionDetails?.geometry.coordinates[0] || null,
            tipo: 'desconhecido',
            website: props.website || null,
            telefone: props.contact?.phone || null,
            horario_funcionamento: props.opening_hours || null,
            acessibilidade_cadeira_de_rodas: props.wheelchair || 'não informado'
        };
    }));

    const result = {
        pais: { nome: country, continente: citySearchResult.properties.continent, moeda: currency },
        cidade: {
            nome: cityName,
            descricao: cityDescription,
            populacao: null,
            url_imagem: cityImage || '',
            custo_medio_diario: null,
            latitude: lat,
            longitude: lon
        },
        pontos_turisticos: processedTouristSpots.filter(Boolean),
    };

    return result;
}


async function getCuratedTouristCities(cityObject) {
  return await fetchFromApiAndCache(cityObject);
}

module.exports = { getCuratedTouristCities, getRawCuratedCities };
