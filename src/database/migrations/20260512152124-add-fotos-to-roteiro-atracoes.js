'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adicionando a coluna 'fotos' na tabela 'roteiro_atracoes'
    await queryInterface.addColumn('roteiro_atracoes', 'fotos', {
      type: Sequelize.ARRAY(Sequelize.STRING), // Define como uma lista de textos
      defaultValue: [], // Começa como uma lista vazia para não quebrar o front
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Caso precise desfazer a migração, removemos a coluna
    await queryInterface.removeColumn('roteiro_atracoes', 'fotos');
  }
};