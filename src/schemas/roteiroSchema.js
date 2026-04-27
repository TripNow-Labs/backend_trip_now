const { z } = require('zod');

const createRoteiroSchema = z.object({
  cidade: z.object({
    nome: z.string().min(1, 'O nome da cidade é obrigatório.'),
    descricao: z.string().optional(),
    url_imagem: z.string().url('URL da imagem inválida.').optional().or(z.literal(''))
  }),
  pais: z.object({
    nome: z.string().min(1, 'O nome do país é obrigatório.'),
    moeda: z.string().optional(),
    continente: z.string().optional()
  }),
  roteiro: z.object({
    data_inicio: z.string().min(1, 'A data de início é obrigatória.'), // Ou z.date() se vier como objeto Date
    duracao_dias: z.number().int().positive('A duração em dias deve ser positiva.'),
    numero_pessoas: z.number().int().positive().optional(),
    orcamento_total: z.number().nonnegative().optional(),
    horario_preferencial: z.string().optional()
  }),
  dias: z.array(z.any()).optional() // Detalhes dos dias e atrações
});

module.exports = { createRoteiroSchema };
