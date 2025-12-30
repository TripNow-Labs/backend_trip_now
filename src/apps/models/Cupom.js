'use strict';
const { Model, Sequelize } = require('sequelize');

class Cupom extends Model {
  
  static init(sequelize) {
    super.init({
      parceiro_id: Sequelize.INTEGER,
      cidade_id: Sequelize.INTEGER,
      nome_parceiro: Sequelize.STRING,
      titulo: Sequelize.STRING,
      descricao: Sequelize.TEXT,
      tipo_desconto: Sequelize.ENUM('percentual', 'valor_fixo'),
      valor_desconto: Sequelize.DECIMAL,
      moeda: Sequelize.STRING,
      categoria: Sequelize.STRING,
      valido_ate: Sequelize.DATEONLY,
      codigo_cupom: Sequelize.STRING,
      termos_condicoes: Sequelize.TEXT,
      esta_ativo: Sequelize.BOOLEAN,
      status: Sequelize.ENUM('ativo', 'inativo', 'pendente', 'expirado', 'suspenso'),
      maximo_usos: Sequelize.INTEGER,
      usos_atuais: Sequelize.INTEGER,
      maximo_usos_por_usuario: Sequelize.INTEGER,
      url_imagem: Sequelize.TEXT,
      prioridade: Sequelize.INTEGER,
      compra_minima: Sequelize.DECIMAL,
      publico_alvo: Sequelize.ENUM('todos', 'novos_usuarios', 'usuarios_premium'),
      criado_por: Sequelize.INTEGER,
      aprovado_por: Sequelize.INTEGER,
      aprovado_em: Sequelize.DATE,
    }, {
      sequelize,
      modelName: 'Cupom',
      tableName: 'cupons',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Parceiro, { foreignKey: 'parceiro_id', as: 'parceiro' });
      this.belongsTo(models.Cidade, { foreignKey: 'cidade_id', as: 'cidade' });
      this.belongsTo(models.Users, { foreignKey: 'criado_por', as: 'criador' });
      this.belongsTo(models.Users, { foreignKey: 'aprovado_por', as: 'aprovador' });

      this.hasMany(models.UserCupom, { foreignKey: 'cupom_id', as: 'cuponsUsuario' });
      this.hasMany(models.AnalyticsCupons, { foreignKey: 'cupom_id', as: 'analytics' });
      this.hasMany(models.TransacoesReceita, { foreignKey: 'cupom_id', as: 'transacoes' });

      this.belongsToMany(models.Users, {
        through: models.UserCupom,
        foreignKey: 'cupom_id',
        otherKey: 'user_id',
        as: 'Users',
      });
    }
}

module.exports = Cupom;
