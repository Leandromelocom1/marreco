const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ message: 'Nenhum token fornecido.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ message: 'Falha ao autenticar o token.' });

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// Middleware para garantir que o usuário seja admin
const verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito aos administradores.' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
