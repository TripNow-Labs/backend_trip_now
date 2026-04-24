/**
 * Middleware para Controle de Acesso Baseado em Cargos (RBAC)
 * @param {string[]} allowedRoles Array de permissões (ex: ['admin'], ou ['admin', 'usuario'])
 */
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        // Se o request não contiver um tipoUsuario (falha no authentication.js) ou 
        // se o cargo não constar no array de permitidos, rejeitamos o acesso.
        if (!req.tipoUsuario || !allowedRoles.includes(req.tipoUsuario)) {
            return res.status(403).json({
                error: 'Você não tem a permissão de administrador necessária para realizar essa ação.'
            });
        }
        next();
    };
};

module.exports = authorizeRoles;
