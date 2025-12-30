'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cupons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      parceiro_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'parceiros',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      cidade_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'cidades',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      nome_parceiro: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
      },
      tipo_desconto: {
        type: Sequelize.ENUM('percentual', 'valor_fixo'),
        allowNull: false,
      },
      valor_desconto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      moeda: {
        type: Sequelize.STRING(10),
      },
      categoria: {
        type: Sequelize.STRING(50),
      },
      valido_ate: {
        type: Sequelize.DATEONLY,
      },
      codigo_cupom: {
        type: Sequelize.STRING(50),
      },
      termos_condicoes: {
        type: Sequelize.TEXT,
      },
      esta_ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      status: {
        type: Sequelize.ENUM('ativo', 'inativo', 'pendente', 'expirado', 'suspenso'),
        defaultValue: 'ativo',
      },
      maximo_usos: {
        type: Sequelize.INTEGER,
      },
      usos_atuais: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      maximo_usos_por_usuario: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      url_imagem: {
        type: Sequelize.TEXT,
      },
      prioridade: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      compra_minima: {
        type: Sequelize.DECIMAL(10, 2),
      },
      publico_alvo: {
        type: Sequelize.ENUM('todos', 'novos_usuarios', 'usuarios_premium'),
        defaultValue: 'todos',
      },
      criado_por: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      aprovado_por: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      aprovado_em: {
        type: Sequelize.DATE,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_parceiro_id', fields: ['parceiro_id'] },
        { name: 'idx_cidade_id', fields: ['cidade_id'] },
        { name: 'idx_status', fields: ['status'] },
        { name: 'idx_valido_ate', fields: ['valido_ate'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cupons');
  },
};