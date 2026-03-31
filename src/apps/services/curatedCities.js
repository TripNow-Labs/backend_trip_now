const fs = require('fs');
const path = require('path');
const { getWikipediaDescription, getWikipediaImage } = require('./wikipedia');
const { findCity, findAttractionByName } = require('./geoapify');
const { getCurrencyByCountryCode } = require('./currency');
const { getPexelsImage } = require('./pexels');

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');
const CURATED_CITIES_JSON_PATH = path.join(PROJECT_ROOT, 'data', 'curated-cities.json');

// Função para ler as cidades curadas do arquivo JSON
function getRawCuratedCities() {
    const fileContent = fs.readFileSync(CURATED_CITIES_JSON_PATH, 'utf8');
    return JSON.parse(fileContent);
}

async function fetchFromApiAndCache(cityName) {
    const normalizedCityName = cityName.trim().toLowerCase();
    
    console.log(`Buscando dados curados para \"${cityName}\" da API...`);
    const curatedCities = getRawCuratedCities();
    const cityData = curatedCities.find(c => c.name.toLowerCase() === normalizedCityName);

    if (!cityData) {
        console.error(`Cidade curada \"${cityName}\" não encontrada.`);
        return null;
    }

    const citySearchResult = await findCity(cityName);
    if (!citySearchResult) return null;

    const { lat, lon, country, country_code } = citySearchResult.properties;
    const currency = await getCurrencyByCountryCode(country_code) || 'USD';
    let cityImage = await getWikipediaImage({ attractionName: cityName });

    if (!cityImage) {
        cityImage = await getPexelsImage({ attractionName: cityName, city: cityName, country: country });
    }

    const touristSpots = await Promise.all(cityData.touristSpots.map(async (attractionName) => {
        const attractionDetails = await findAttractionByName(attractionName, lat, lon);
        const attractionDescription = await getWikipediaDescription(attractionName);
        let attractionImage = await getWikipediaImage({ attractionName: attractionName, city: cityName, country: country });

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

    const cityDescription = await getWikipediaDescription(cityName);

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
        pontos_turisticos: touristSpots.filter(Boolean),
    };

    return result;
}


async function getCuratedTouristCities(cityName) {
  return await fetchFromApiAndCache(cityName);
}

module.exports = { getCuratedTouristCities, getRawCuratedCities };
