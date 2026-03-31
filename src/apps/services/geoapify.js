require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getWikipediaDescription, getWikipediaImage } = require('./wikipedia');
const { getCurrencyByCountryCode } = require('./currency');
const { getPexelsImage } = require('./pexels');

const API_KEY = process.env.GEOAPIFY_API_KEY;
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');

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
    const normalizedCityName = cityName.trim().toLowerCase();

    console.log(`Buscando dados de busca para \"${cityName}\" da API...`);
    const cityData = await findCity(cityName);
    if (!cityData) return null;

    const { lat, lon, country, country_code, city: localizedCityName, continent } = cityData.properties;
    
    let cityImage = await getWikipediaImage({ attractionName: localizedCityName });
    if (!cityImage) {
        cityImage = await getPexelsImage({ attractionName: localizedCityName, city: localizedCityName, country: country });
    }

    const [attractions, cityDescription, currency] = await Promise.all([
        findAttractions(lat, lon),
        getWikipediaDescription(localizedCityName, 'city'),
        getCurrencyByCountryCode(country_code)
    ]);

    const attractionsDetails = await Promise.all(attractions.map(async (attraction) => {
        const props = attraction.properties;
        const name = props.name;

        let tipo = "desconhecido";
        if (props.categories && props.categories.length > 1) {
            tipo = props.categories[1].split('.').pop();
        } else if (props.categories && props.categories.length > 0) {
            tipo = props.categories[0];
        }

        let image = await getWikipediaImage({
            attractionName: name,
            city: localizedCityName,
            country: country,
            attractionType: tipo
        });

        if (!image) {
            image = await getPexelsImage({
                attractionName: name,
                city: localizedCityName,
                country: country,
                attractionType: tipo
            });
        }

        const description = await getWikipediaDescription(`${name}, ${localizedCityName}`, 'landmark');

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

    const result = {
        pais: { nome: country, continente: continent, moeda: currency },
        cidade: {
            nome: localizedCityName,
            descricao: cityDescription,
            url_imagem: cityImage || '',
            continente: continent
        },
        pontos_turisticos: attractionsDetails
    };
    

    return result;
}

module.exports = { findCity, findAttractions, findAttractionByName, searchCityWithAttractions };
