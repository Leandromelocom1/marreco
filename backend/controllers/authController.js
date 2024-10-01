const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Gerar o token JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Senha incorreta' });

    const token = generateToken(user);

    res.status(200).json({ token, user: { id: user._id, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error });
  }
};

// Registro
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = new User({ username, password, role });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar o usuário', error });
  }
};
