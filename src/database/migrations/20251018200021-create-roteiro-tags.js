'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roteiro_tags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      roteiro_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roteiros',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      tag: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_roteiro_id', fields: ['roteiro_id'] },
        { name: 'uq_roteiro_tag', fields: ['roteiro_id', 'tag'], unique: true },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('roteiro_tags');
  },
};