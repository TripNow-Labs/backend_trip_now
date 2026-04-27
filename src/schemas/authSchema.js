const { z } = require('zod');

const authSchema = z.object({
  email: z.string().email('Formato de e-mail inválido.').optional(),
  user_name: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.').optional(),
  password: z.preprocess(
    (val) => (val === undefined || val === null ? '' : val),
    z.string().min(1, 'A senha é obrigatória.').min(6, 'A senha deve ter pelo menos 6 caracteres.')
  )
}).refine(data => data.email || data.user_name, {
  message: 'É necessário fornecer um e-mail ou um nome de usuário.',
  path: ['email', 'user_name']
});

module.exports = { authSchema };
