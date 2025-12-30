const axios = require('axios');
const { getRandomDescription } = require('../utils/genericDescriptions');
const { getRandomLandmarkDescription } = require('../utils/genericLandmarkDescriptions');

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
  }
});

async function getWikipediaDescription(title, type = 'city') {
  const url = `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`;
  try {
    const response = await axiosInstance.get(url);
    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId === '-1' || !pages[pageId].extract) {
      console.log(`Descrição não encontrada para \"${title}\", usando descrição genérica.`);
      return type === 'city' ? getRandomDescription(title) : getRandomLandmarkDescription(title);
    }
    return pages[pageId].extract;
  } catch (error) {
    console.error(`Erro ao buscar descrição da Wikipedia para \"${title}\":`, error.message);
    console.log(`Usando descrição genérica para \"${title}\" devido a erro.`);
    return type === 'city' ? getRandomDescription(title) : getRandomLandmarkDescription(title);
  }
}

async function getWikipediaImage(searchParams) {
  const { attractionName } = searchParams;
  
  try {
    const encodedTitle = encodeURIComponent(attractionName);
    const wikiApiUrl = `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodedTitle}&prop=pageimages&pithumbsize=500&format=json&origin=*`;

    const responseWiki = await axiosInstance.get(wikiApiUrl);
    const dataWiki = responseWiki.data;

    const pages = dataWiki.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === "-1") {
      console.warn(`Artigo \"${attractionName}\" não encontrado na Wikipedia.`);
      return null;
    }

    const pageData = pages[pageId];
    const fileName = pageData.pageimage;

    if (!fileName) {
      console.warn(`Artigo \"${attractionName}\" não possui imagem principal.`);
      return null;
    }

    const commonsApiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&iiurlwidth=370&iiurlheight=200&format=json&origin=*`;
    
    const responseCommons = await axiosInstance.get(commonsApiUrl);
    const dataCommons = responseCommons.data;

    const commonsPages = dataCommons.query.pages;
    const filePageId = Object.keys(commonsPages)[0];

    const imageData = commonsPages[filePageId];
    const imageInfo = imageData?.imageinfo?.[0];
    if (imageInfo?.thumburl) {
      return imageInfo.thumburl;
    } else {
      console.warn(`Arquivo \"${fileName}\" não encontrado no Wikimedia Commons.`);
      return null;
    }

  } catch (error) {
    console.error(`Erro ao buscar imagem para \"${attractionName}\" na Wikipedia:`, error.message);
    return null;
  }
}

module.exports = { getWikipediaDescription, getWikipediaImage };
