// routes/vendaRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

// Rota acessível para vendedores e administradores
router.get('/vendas', verifyToken, (req, res) => {
  if (req.userRole !== 'vendedor' && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  res.send('Área de vendas - acesso liberado para vendedores e admins.');
});

module.exports = router;
