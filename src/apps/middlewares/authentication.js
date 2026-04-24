const jwt = require('jsonwebtoken');
const { promisify } = require('util');

module.exports = async (req, res, next) => {
    // Tenta pegar o token primeiramente dos cookies (prática mais segura, HttpOnly)
    // Se não existir, utiliza o cabeçalho Authorization como fallback para compatibilidade.
    let token = req.cookies?.token;

    if (!token) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Unset token!' });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({ error: 'Unauthorized!' });
        }

        const [scheme, parsedToken] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ error: 'Token mal formatado (scheme).' });
        }
        
        token = parsedToken;
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não definido no .env'); 
        }
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        req.userId = decoded.userId;
        req.tipoUsuario = decoded.tipo_usuario; // Extrai o cargo da payload para liberar uso de RBAC

        return next();

    } catch (err) {
        console.error('Erro de Autenticação:', err.message);
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};