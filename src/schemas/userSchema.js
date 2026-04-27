const { z } = require('zod');

const createUserSchema = z.object({
  name: z.preprocess(
    (val) => (val === undefined || val === null ? '' : val),
    z.string().min(1, 'O nome é obrigatório.').min(2, 'O nome deve ter pelo menos 2 caracteres.').max(100, 'O nome é muito longo.')
  ),
  user_name: z.preprocess(
    (val) => (val === undefined || val === null ? '' : val),
    z.string().min(1, 'O nome de usuário é obrigatório.').min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.').max(30, 'O nome de usuário é muito longo.')
  ),
  email: z.preprocess(
    (val) => (val === undefined || val === null ? '' : val),
    z.string().min(1, 'O e-mail é obrigatório.').email('Formato de e-mail inválido.')
  ),
  password: z.preprocess(
    (val) => (val === undefined || val === null ? '' : val),
    z.string().min(1, 'A senha é obrigatória.').min(6, 'A senha deve ter pelo menos 6 caracteres.')
  )
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').max(100, 'O nome é muito longo.').optional(),
  user_name: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.').max(30, 'O nome de usuário é muito longo.').optional(),
  email: z.string().email('Formato de e-mail inválido.').optional(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.').optional(),
  biografia: z.string().max(500, 'A biografia não pode exceder 500 caracteres.').optional(),
  rede_social: z.string().url('Formato de URL inválido.').optional().or(z.literal('')),
  telefone: z.string().optional(),
  data_nascimento: z.string().optional(), // Pode ser refinado para data válida
  cidade: z.string().optional(),
  pais: z.string().optional()
});

module.exports = { createUserSchema, updateUserSchema };
