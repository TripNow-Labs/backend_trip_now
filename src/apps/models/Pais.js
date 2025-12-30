'use strict';
const { Model, Sequelize } = require('sequelize');

class Pais extends Model {
  static init(sequelize) {
    super.init({
      nome: Sequelize.STRING,
      continente: {
        type: Sequelize.STRING,
        allowNull: true
      },
      moeda: Sequelize.STRING,
    }, {
      sequelize,
      modelName: 'Pais',
      tableName: 'paises',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }

  static associate(models) {
      this.hasMany(models.Cidade, { foreignKey: 'pais_id', as: 'cidades' });
      this.hasMany(models.UserPaisesVisitados, { foreignKey: 'pais_id', as: 'visitas' });
      this.belongsToMany(models.Users, {
        through: models.UserPaisesVisitados,
        foreignKey: 'pais_id',
        otherKey: 'user_id',
        as: 'visitantes',
      });
    }
}

module.exports = Pais;
