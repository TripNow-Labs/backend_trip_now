
const genericLandmarkDescriptions = [
  "é um marco na cidade, oferecendo uma visão única da cultura e história local.",
  "é um lugar imperdível, conhecido por sua beleza e importância na região.",
  "oferece uma experiência memorável, combinando lazer, aprendizado e vistas espetaculares.",
  "é um refúgio de tranquilidade e beleza, perfeito para explorar e tirar fotos incríveis.",
  "é conhecido por sua arquitetura única e sua relevância para a cidade, atraindo visitantes do mundo todo.",
  "é um espaço que conta a história da região e encanta pela sua atmosfera.",
  "é ideal para um passeio, oferecendo atividades e cenários para todos os gostos.",
  "proporciona uma experiência enriquecedora, revelando detalhes sobre a cultura e a beleza natural da área."
];

function getRandomLandmarkDescription(landmarkName) {
    const randomIndex = Math.floor(Math.random() * genericLandmarkDescriptions.length);
    const description = genericLandmarkDescriptions[randomIndex];
    return `${landmarkName} ${description}`;
}

module.exports = { getRandomLandmarkDescription };