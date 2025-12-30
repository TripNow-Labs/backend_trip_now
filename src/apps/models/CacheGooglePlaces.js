'use strict';
const { Model, Sequelize } = require('sequelize');

class CacheGooglePlaces extends Model {
    static associate(models) {
      // No associations defined
    }
  
  static init(sequelize) {
    super.init({
      // Este campo é a Primary Key, por isso não pode ser simplificado
      place_id: {
        type: Sequelize.STRING(100),
        primaryKey: true,
        allowNull: false,
        field: 'place_id',
      },
      tipo: Sequelize.STRING,
      dados_json: Sequelize.JSON,
      // 'atualizado_em' removido daqui (controlado por timestamps)
    }, {
      sequelize,
      modelName: 'CacheGooglePlaces',
      tableName: 'cache_google_places',
      timestamps: true,
      createdAt: false,
      updatedAt: 'atualizado_em',
    });
    return this;
  }
}

module.exports = CacheGooglePlaces;
