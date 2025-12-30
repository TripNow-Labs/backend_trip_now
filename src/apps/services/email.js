require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: `"Trip Now" <${process.env.MAIL_USER}>`,
    to: to,
    subject: 'Código de Verificação - Trip Now',
    text: `Seu código de verificação é: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #00bcd4;">Trip Now</h1>
        </div>
        <div style="border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
            <h2>Bem-vindo!</h2>
            <p>Para ativar sua conta e começar a criar roteiros incríveis, use o código abaixo:</p>
            <div style="background-color: #f8fcfd; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; border-radius: 5px; color: #333; margin: 20px 0;">
                ${code}
            </div>
            <p style="font-size: 0.9em; color: #666;">Se você não solicitou este código, ignore este e-mail.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail de verificação enviado para ${to} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail de verificação:', error);
    return false;
  }
};

module.exports = { sendVerificationEmail };