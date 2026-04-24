const xss = require('xss');

/**
 * Middleware para sanitizar inputs e evitar ataques de Cross-Site Scripting (XSS).
 * Percorre os objetos de corpo da requisição (body), parâmetros de rota (params)
 * e query string (query), aplicando o filtro xss() em todos os campos.
 */
const xssSanitizer = (req, res, next) => {
    const sanitizeObject = (obj) => {
        if (!obj) return obj;
        
        const sanitizedData = Array.isArray(obj) ? [] : {};
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (typeof value === 'string') {
                sanitizedData[key] = xss(value);
            } else if (typeof value === 'object' && value !== null) {
                // Recursão para limpar objetos e arrays aninhados
                sanitizedData[key] = sanitizeObject(value);
            } else {
                sanitizedData[key] = value;
            }
        }
        return sanitizedData;
    };

    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);

    next();
};

module.exports = xssSanitizer;
