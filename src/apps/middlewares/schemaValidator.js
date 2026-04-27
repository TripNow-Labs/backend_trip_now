/**
 * Middleware para validar dados de entrada (req.body) contra um schema do Zod.
 * @param {import('zod').ZodSchema} schema O schema Zod a ser utilizado.
 */
const schemaValidator = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        // Formata as mensagens de erro de forma clara utilizando 'issues'
        const messageError = result.error.issues.map(err => {
            const field = err.path.join('.');
            return field ? `${field}: ${err.message}` : err.message;
        });

        return res.status(422).json({
            schemaError: messageError,
        });
    }

    // Substitui o body com os dados validados e tipados pelo Zod
    req.body = result.data;
    return next();
};

module.exports = schemaValidator;