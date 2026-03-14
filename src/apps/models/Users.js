const { Model, Sequelize } = require('sequelize');
const bcryptjs = require('bcryptjs');

class Users extends Model {
    static init(sequelize) {
        super.init(
            {
                email: Sequelize.STRING,
                password_hash: Sequelize.STRING,
                password: Sequelize.VIRTUAL,
                user_name: Sequelize.STRING,
                name: Sequelize.STRING,
                id_assinatura: Sequelize.INTEGER,
                tipo_usuario: Sequelize.ENUM('usuario', 'admin'),
                telefone: Sequelize.STRING,
                data_nascimento: Sequelize.DATEONLY, // Ideal para datas sem fuso/hora no Postgres
                cidade: Sequelize.STRING,
                pais: Sequelize.STRING,
                biografia: Sequelize.TEXT,
                rede_social: Sequelize.STRING,
                url_foto_perfil: Sequelize.TEXT,
                esta_ativo: Sequelize.BOOLEAN,
                ultimo_login_em: Sequelize.DATE,
            },
            {
                sequelize,
                modelName: 'Users',
                tableName: 'users',
                timestamps: true,
                createdAt: 'criado_em',
                updatedAt: 'atualizado_em',
            }
        );

        // Hook para criar o hash da senha antes de salvar
        this.addHook('beforeSave', async (user) => {
            if (user.password) {
                user.password_hash = await bcryptjs.hash(user.password, 8);
            }
        });

        return this;
    }

    static associate(models) {
        // 1:1
        this.hasOne(models.PreferenciasUsuario, { foreignKey: 'user_id', as: 'preferencias' });
        this.belongsTo(models.Assinatura, { foreignKey: 'id_assinatura', as: 'assinatura' });

        // 1:N
        this.hasMany(models.InteressesUsuario, { foreignKey: 'user_id', as: 'interesses' });
        this.hasMany(models.ConquistasUsuario, { foreignKey: 'user_id', as: 'conquistasUsuario' });
        this.hasMany(models.Roteiro, { foreignKey: 'user_id', as: 'roteiros' });
        this.hasMany(models.RoteiroCurtida, { foreignKey: 'user_id', as: 'curtidasDadas' });
        this.hasMany(models.RoteiroComentarios, { foreignKey: 'user_id', as: 'comentarios' });
        this.hasMany(models.UserCupom, { foreignKey: 'user_id', as: 'cuponsUsuario' });
        this.hasMany(models.UserPaisesVisitados, { foreignKey: 'user_id', as: 'paisesVisitadosUsuario' });
        this.hasMany(models.RoteirosSalvos, { foreignKey: 'user_id', as: 'roteirosSalvosUsuario' });
        this.hasMany(models.Notificacoes, { foreignKey: 'user_id', as: 'notificacoes' });
        this.hasMany(models.LogsAtividades, { foreignKey: 'user_id', as: 'logs' });

        // Chaves estrangeiras 'específicas'
        this.hasMany(models.Parceiro, { foreignKey: 'criado_por', as: 'parceirosCriados' });
        this.hasMany(models.Cupom, { foreignKey: 'criado_por', as: 'cuponsCriados' });
        this.hasMany(models.Cupom, { foreignKey: 'aprovado_por', as: 'cuponsAprovados' });
        this.hasMany(models.ConfiguracoesSistema, { foreignKey: 'atualizado_por', as: 'configuracoesAtualizadas' });
        this.hasMany(models.Relatorios, { foreignKey: 'gerado_por', as: 'relatoriosGerados' });
        this.hasMany(models.TransacoesReceita, { foreignKey: 'user_id', as: 'transacoes' });
        
        // Associações de 'Seguidores'
        this.hasMany(models.UserSeguidores, { foreignKey: 'seguidor_id', as: 'seguindoRel' });
        this.hasMany(models.UserSeguidores, { foreignKey: 'seguido_id', as: 'seguidoresRel' });

        // N:M
        this.belongsToMany(models.Conquista, {
            through: models.ConquistasUsuario,
            foreignKey: 'user_id',
            otherKey: 'conquista_id',
            as: 'conquistas',
        });
        this.belongsToMany(models.Roteiro, {
            through: models.RoteiroCurtida,
            foreignKey: 'user_id',
            otherKey: 'roteiro_id',
            as: 'roteirosCurtidos',
        });
        this.belongsToMany(models.Cupom, {
            through: models.UserCupom,
            foreignKey: 'user_id',
            otherKey: 'cupom_id',
            as: 'cupons',
        });
        this.belongsToMany(models.Pais, {
            through: models.UserPaisesVisitados,
            foreignKey: 'user_id',
            otherKey: 'pais_id',
            as: 'paisesVisitados',
        });
        this.belongsToMany(models.Roteiro, {
            through: models.RoteirosSalvos,
            foreignKey: 'user_id',
            otherKey: 'roteiro_id',
            as: 'roteirosSalvos',
        });
        
        // Seguidores N:M (para o mesmo modelo)
        this.belongsToMany(this, {
            as: 'seguindo',
            through: models.UserSeguidores,
            foreignKey: 'seguidor_id',
            otherKey: 'seguido_id',
        });
        this.belongsToMany(this, {
            as: 'seguidores',
            through: models.UserSeguidores,
            foreignKey: 'seguido_id',
            otherKey: 'seguidor_id',
        });
    }

    // Método para verificar a senha
    checkPassword(password) {
        return bcryptjs.compare(password, this.password_hash);
    }
}

module.exports = Users;