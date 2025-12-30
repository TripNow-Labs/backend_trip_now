'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Verifica se já existe para não duplicar
    const exists = await queryInterface.rawSelect('assinaturas', {
      where: { id_assinatura: 1 },
    }, ['id_assinatura']);

    if (!exists) {
      await queryInterface.bulkInsert('assinaturas', [{
        id_assinatura: 1,
        plano: 'gratuito',
        status: 'ativo',
      }]);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('assinaturas', { id_assinatura: 1 }, {});
  }
};