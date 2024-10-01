const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema do usuário
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, // Email único e obrigatório
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'vendedor'], default: 'vendedor' } // Tipos de usuários
});

// Middleware para criptografar a senha antes de salvar o usuário
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar a senha inserida com a senha criptografada no banco
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
