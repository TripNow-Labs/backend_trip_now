'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Índice composto sugerido pelo EverSQL para a tabela cidades
    await queryInterface.addIndex('cidades', ['nome', 'pais_id'], {
      name: 'cidades_idx_nome_pais_id'
    });

    // Índice composto sugerido pelo EverSQL para a tabela atracoes_turisticas
    await queryInterface.addIndex('atracoes_turisticas', ['nome', 'cidade_id'], {
      name: 'atracoes_turistica_idx_nome_cidade_id'
    });

    // Índice composto com ordenação DESC para otimizar a listagem de roteiros
    await queryInterface.addIndex('roteiros', [
      'user_id', 
      { name: 'criado_em', order: 'DESC' }
    ], {
      name: 'roteiros_idx_user_id_criado_em'
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverte a criação dos índices em caso de rollback (desfazer a migration)
    await queryInterface.removeIndex('cidades', 'cidades_idx_nome_pais_id');
    await queryInterface.removeIndex('atracoes_turisticas', 'atracoes_turistica_idx_nome_cidade_id');
    await queryInterface.removeIndex('roteiros', 'roteiros_idx_user_id_criado_em');
  }
};