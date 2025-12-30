const Users = require('../models/Users');
const db = require('../../database');
const { sendVerificationEmail } = require('../services/email');
const verificationCodes = new Map();

class UserController {

  // --- 1. CRIA USUÁRIO E ENVIA CÓDIGO (Etapa 1 do Cadastro) ---
  async createUserVerify(req, res) {
    const { name, user_name, email, password } = req.body;

    try {
      // Verifica se já existe
      const userExists = await Users.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ message: 'Este e-mail já está em uso.' });
      }

      // Cria o usuário INATIVO (com id_assinatura padrão 1 para não quebrar FK)
      const user = await Users.create({
        name,
        user_name,
        email,
        password, // O model vai criptografar
        tipo_usuario: 'usuario',
        esta_ativo: false,
        id_assinatura: 1
      });

      // Gera código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Salva na memória
      verificationCodes.set(email, code);

      // Envia E-mail
      const emailSent = await sendVerificationEmail(email, code);
      if (!emailSent) {
        console.warn(`Falha ao enviar e-mail para ${email}. Código gerado: ${code}`);
      }

      return res.status(200).json({ message: 'Usuário criado. Verifique seu e-mail.' });

    } catch (error) {
      console.error('Erro no cadastro:', error);
      return res.status(500).json({ message: 'Erro ao criar usuário.', error: error.message });
    }
  }

  // --- 2. VALIDAR CÓDIGO E ATIVAR CONTA (Etapa 2 do Cadastro) ---
  async createUserVerifyCode(req, res) {
    const { email, code } = req.body;

    try {
      const storedCode = verificationCodes.get(email);

      if (!storedCode || storedCode !== code) {
        return res.status(400).json({ message: 'Código inválido ou expirado.' });
      }

      const user = await Users.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado para ativação.' });
      }

      // Ativa o usuário
      user.esta_ativo = true;
      await user.save();

      // Limpa o código da memória
      verificationCodes.delete(email);

      return res.status(200).json({ message: 'Conta verificada com sucesso!' });

    } catch (error) {
      console.error('Erro na verificação:', error);
      return res.status(500).json({ message: 'Erro ao verificar código.' });
    }
  }

  // --- 3. CRIAR USUÁRIO DIRETO (Admin ou Legado) ---
  async create(req, res) {
    const { name, user_name, email, password, tipo_usuario } = req.body;
    
    const verifyUser = await Users.findOne({ where: { email: email } });
    if (verifyUser) return res.status(400).send({ message: 'User already exists' });

    try {
      const user = await Users.create({
        name, user_name, email, password, tipo_usuario,
        esta_ativo: true,
        id_assinatura: 1
      });
      return res.status(201).send({ message: 'User created' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar usuário.', error: error.message });
    }
  }

  // --- 4. BUSCAR PERFIL DO USUÁRIO LOGADO ---
  async getProfile(req, res) {
    try {
      const { userId } = req;

      if (!userId) {
        return res.status(401).json({ message: 'Token inválido.' });
      }

      const user = await Users.findByPk(userId, {
        attributes: { exclude: ['password', 'password_hash'] }
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      let nomeCidade = user.cidade;
      let nomePais = user.pais;

      const userProfile = {
        id: user.id,
        name: user.name,
        user_name: user.user_name,
        email: user.email,
        telefone: user.telefone,
        data_nascimento: user.data_nascimento,
        cidade: nomeCidade, 
        pais: nomePais,
        biografia: user.biografia,
        rede_social: user.rede_social,
        url_foto_perfil: user.url_foto_perfil
      };

      return res.status(200).json(userProfile);

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({ message: 'Falha ao buscar perfil.', details: error.message });
    }
  }

  // --- 5. ATUALIZAR USUÁRIO (PUT) ---
  async updateUser(req, res) {
    try {
      const { id } = req.params; 
      // Recebe todos os campos possíveis
      const { 
        user_name, email, password, name, 
        biografia, rede_social, telefone, 
        data_nascimento, cidade, pais, url_foto_perfil 
      } = req.body;

      const user = await Users.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
      }

      // Atualiza apenas o que foi enviado
      if (user_name) user.user_name = user_name;
      if (email) user.email = email;
      if (name) user.name = name;
      if (biografia) user.biografia = biografia;
      if (rede_social) user.rede_social = rede_social;
      if (telefone) user.telefone = telefone;
      if (data_nascimento) user.data_nascimento = data_nascimento;
      if (cidade) user.cidade = cidade; // Salva string direto
      if (pais) user.pais = pais;       // Salva string direto
      if (url_foto_perfil) user.url_foto_perfil = url_foto_perfil;
      
      if (password) user.password = password; // Hook fará o hash

      await user.save();

      return res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
    } catch (err) {
      return res.status(500).json({ error: `Erro ao atualizar: ${err.message}` });
    }
  }

  // --- 6. DELETAR USUÁRIO ---
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await Users.findByPk(id);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
      
      await user.destroy();
      return res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao deletar usuário: ' + err.message });
    }
  }

}

module.exports = new UserController();