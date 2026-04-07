const { Router } = require('express');
const UserController = require('../apps/controllers/UserController');
const AuthenticateMiddleware = require('../apps/middlewares/authentication');
const { storage } = require('../configs/cloudinary');
// cloudinary ----
const multer = require('multer'); // 1. Importa a biblioteca
const upload = multer({ storage });

const userRoutes = new Router();

// Rotas Públicas (Cadastro/Verificação)
userRoutes.post('/createuserverify', UserController.createUserVerify);
userRoutes.post('/createuserverifycode', UserController.createUserVerifyCode);

userRoutes.patch('/profile-image',AuthenticateMiddleware,upload.single('foto'),UserController.updateProfileImage);

// Rotas Protegidas (Perfil)
userRoutes.get('/profile', AuthenticateMiddleware, UserController.getProfile);
userRoutes.put('/:id', AuthenticateMiddleware, UserController.updateUser);
userRoutes.delete('/:id', AuthenticateMiddleware, UserController.deleteUser);

module.exports = userRoutes;
