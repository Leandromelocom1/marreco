const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Rota de administração
router.get('/admin', verifyToken, verifyAdmin, (req, res) => {
  res.send('Área administrativa. Somente para administradores.');
});

module.exports = router;
