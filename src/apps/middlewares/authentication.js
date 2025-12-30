const jwt = require('jsonwebtoken');
const { promisify } = require('util');

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unset token!' });
    }

    // O header deve ser: "Bearer ASDFGHJKL..."
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Unauthorized!' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token mal formatado (scheme).' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não definido no .env'); 
        }
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        req.userId = decoded.userId;

        return next();

    } catch (err) {
        console.error('Erro de Autenticação:', err.message);
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};