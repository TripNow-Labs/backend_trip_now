
const genericDescriptions = [
  "oferece uma combinação perfeita entre cultura, lazer e boa gastronomia. Suas paisagens encantadoras e atrações variadas garantem experiências marcantes para todos os visitantes, seja em passeios históricos, naturais ou urbanos.",
  "com um ritmo acolhedor e cenários que parecem moldados pela natureza e pelo tempo, convida viajantes a desacelerar e apreciar cada detalhe. Cada rua, cada vista e cada encontro revelam novas histórias e encantos.",
  "é reconhecida como um importante destino turístico, destacando-se por sua infraestrutura de qualidade, diversidade cultural e atrativos que atendem públicos de todas as idades. Seu ambiente agradável proporciona uma experiência completa ao visitante.",
  "é o tipo de destino que transforma uma viagem em memória. Com atividades para todos os gostos, paisagens surpreendentes e um clima acolhedor, ela cria o cenário ideal para momentos únicos e inesquecíveis.",
  "é um lugar onde cada visitante encontra seu próprio motivo para se encantar: natureza, cultura, gastronomia, compras, tranquilidade ou aventura. A cidade oferece uma pluralidade de experiências que agradam tanto quem busca descanso quanto quem procura movimento.",
  "preserva sua identidade sem deixar de evoluir. Suas tradições, sabores e modos de vida convivem com novas tendências, formando um destino genuíno, cativante e cheio de personalidade.",
  "é um ótimo destino para quem deseja passear, explorar e relaxar. Com atrações para todos os gostos e uma atmosfera acolhedora, ela proporciona momentos agradáveis do início ao fim da viagem.",
  "é um lugar para se sentir parte de algo especial. Suas paisagens inspiram, seu povo acolhe e suas experiências emocionam. É um lugar que permanece na memória muito depois da viagem acabar.",
  "é ideal para quem busca tranquilidade e boas histórias para contar, a cidade reúne cenários relaxantes, passeios agradáveis e atividades que permitem aproveitar cada instante com leveza e bem-estar.",
  "moderna e tradicional na medida certa, reúne atrativos turísticos completos, serviços de qualidade e uma atmosfera vibrante. Seja para viagens rápidas ou estadias prolongadas, ela encanta e surpreende."
];

function getRandomDescription(cityName) {
    const randomIndex = Math.floor(Math.random() * genericDescriptions.length);
    const description = genericDescriptions[randomIndex];
    return `${cityName} ${description}`;
}

module.exports = { getRandomDescription };