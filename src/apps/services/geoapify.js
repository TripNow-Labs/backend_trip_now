require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getWikipediaDescription, getWikipediaImage } = require('./wikipedia');
const { getCurrencyByCountryCode } = require('./currency');
const { getPexelsImage } = require('./pexels');
const { getPixabayImage } = require('./pixabay');
const { searchLocations, getCityDetails, getLocationPhotos } = require('./tripadvisorApiService');

const API_KEY = process.env.GEOAPIFY_API_KEY;

if (!API_KEY) {
    console.error("Erro: A variável de ambiente GEOAPIFY_API_KEY não está definida.");
    process.exit(1);
}

async function findCity(cityName) {
    const url = `https://api.geoapify.com/v1/geocode/search?city=${encodeURIComponent(cityName)}&lang=pt&apiKey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.features.length > 0 ? data.features[0] : null;
    } catch (error) {
        console.error('Geoapify findCity error:', error);
        return null;
    }
}

async function findAttractions(lat, lon) {
    const url = `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:${lon},${lat},5000&limit=20&lang=pt&apiKey=${API_KEY}&details=contact,opening_hours,charge,wheelchair,website`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.features || [];
    } catch (error) {
        console.error('Geoapify findAttractions error:', error);
        return [];
    }
}

async function findAttractionByName(name, lat, lon) {
    const url = `https://api.geoapify.com/v2/places?categories=tourism.attraction&text=${encodeURIComponent(name)}&filter=circle:${lon},${lat},50000&limit=1&lang=pt&apiKey=${API_KEY}&details=contact,opening_hours,charge,wheelchair,website`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.features.length > 0 ? data.features[0] : null;
    } catch (error) {
        console.error(`Geoapify findAttractionByName error for ${name}:`, error);
        return null;
    }
}

async function searchCityWithAttractions(cityName) {
    console.log(`Buscando dados para "${cityName}" usando o TripAdvisor como inteligência base...`);
    
    // 1. Usa o TripAdvisor para pegar o Nome Oficial da Cidade e seu ID
    const citySearch = await searchLocations(cityName, 'geos');
    if (!citySearch || citySearch.length === 0) {
        console.log(`Cidade "${cityName}" não encontrada no TripAdvisor.`);
        return null; // A rota tratará este 404
    }
    
    const cityLocationId = citySearch[0].location_id;
    const exactCityName = citySearch[0].name;

    // 2. Faz buscas em paralelo para otimizar velocidade estrutural
    const [cityDetailsData, cityDataGeoapify, attractionsData] = await Promise.all([
        getCityDetails(cityLocationId), // Descrição da Cidade via TripAdvisor
        findCity(exactCityName),        // Coordenadas via Geoapify
        searchLocations(cityName, 'attractions') // Lista de atrações via TripAdvisor
    ]);

    const cityDescription = cityDetailsData?.description || await getWikipediaDescription(exactCityName, 'city');
    
    if (!cityDataGeoapify) {
        console.log(`Aviso: Dados geográficos não encontrados no Geoapify para "${exactCityName}".`);
        return null;
    }

    const { lat, lon, country, country_code, continent } = cityDataGeoapify.properties;
    
    // Imagem da cidade PRINCIPAL do TripAdvisor (fallback nas gratuitas)
    let cityImage = await getLocationPhotos(cityLocationId);
    if (!cityImage) {
        cityImage = await getPixabayImage({ cityName: exactCityName, country: country });
    }
    if (!cityImage) {
        cityImage = await getPexelsImage({ attractionName: exactCityName, city: exactCityName, country: country });
    }

    const currency = await getCurrencyByCountryCode(country_code);

    // TripAdvisor retorna os Nomes e IDs de Atrações. Limitamos a 8 para não estourar requests de API
    let atracoesList = (attractionsData && attractionsData.length > 0) 
        ? attractionsData.slice(0, 8).map(item => ({ name: item.name, location_id: item.location_id }))
        : [];

    // 3. Demais APIs complementam os CUSTOS PESADOS e DETALHES (Zero Cost via Geoapify, Pixabay, Pexels e Wiki)
    const attractionsDetails = await Promise.all(atracoesList.map(async (attr) => {
        const { name, location_id } = attr;
        // Geoapify para Endereços e Coordenadas
        const attractionGeo = await findAttractionByName(name, lat, lon);
        const props = attractionGeo ? attractionGeo.properties : {};

        let tipo = "desconhecido";
        if (props.categories && props.categories.length > 1) {
            tipo = props.categories[1].split('.').pop();
        } else if (props.categories && props.categories.length > 0) {
            tipo = props.categories[0];
        }

        // FOTO PRIMÁRIA DO TRIPADVISOR
        let image = await getLocationPhotos(location_id);
        
        // Fallbacks gratuitos caso o TripAdvisor venha sem foto
        if (!image) {
            image = await getPixabayImage({ cityName: name, country: exactCityName });
        }
        if (!image) {
            image = await getWikipediaImage({ attractionName: name, city: exactCityName, country: country, attractionType: tipo });
        }

        // Wikipedia para Descrição da atração
        const description = await getWikipediaDescription(`${name}, ${exactCityName}`, 'landmark');

        return {
            nome: name,
            categoria: 'geral',
            descricao: description,
            moeda: currency,
            e_gratuito: props.charge ? false : true,
            avaliacao: props.rank?.importance || 0,
            url_imagem: image || '',
            endereco: props.formatted || 'Endereço não disponível',
            latitude: props.lat || null,
            longitude: props.lon || null,
            tipo: tipo,
            website: props.website || null,
            telefone: props.contact?.phone || null,
            horario_funcionamento: props.opening_hours || null,
            acessibilidade_cadeira_de_rodas: props.wheelchair || 'não informado'
        };
    }));

    const result = {
        pais: { nome: country, continente: continent, moeda: currency },
        cidade: {
            nome: exactCityName,
            descricao: cityDescription,
            url_imagem: cityImage || '',
            continente: continent
        },
        pontos_turisticos: attractionsDetails
    };

    return result;
}

module.exports = { findCity, findAttractions, findAttractionByName, searchCityWithAttractions };
