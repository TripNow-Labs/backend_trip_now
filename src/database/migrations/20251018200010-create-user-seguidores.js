'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_seguidores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      seguidor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      seguido_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_seguidor_id', fields: ['seguidor_id'] },
        { name: 'idx_seguido_id', fields: ['seguido_id'] },
        { name: 'uq_seguidor', fields: ['seguidor_id', 'seguido_id'], unique: true },
      ]
    });
    // O CHECK constraint (seguidor_id != seguido_id) precisa ser adicionado com SQL puro
    // pois o Sequelize não o suporta de forma abstrata.
    await queryInterface.sequelize.query('ALTER TABLE "user_seguidores" ADD CONSTRAINT "chk_seguidor_nao_segue_a_si_mesmo" CHECK ("seguidor_id" != "seguido_id");');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_seguidores');
  },
};