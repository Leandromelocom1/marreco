// Carregar variáveis de ambiente
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Iniciar o app Express
const app = express();

// Configurações de middleware
app.use(cors()); // Permitir requisições de outros domínios
app.use(express.json()); // Parsear JSON automaticamente nas requisições

// Função para conectar ao MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1); // Finalizar o processo em caso de falha na conexão
  }
};

// Chamar a função de conexão ao banco de dados
connectDB();

// Servir arquivos de imagem de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota de teste para verificar se a API está funcionando
app.get('/', (req, res) => {
  res.send('🚀 API de Restaurante Funcionando');
});

// Importar e usar as rotas
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const caixaRoutes = require('./routes/caixaRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/produtos', productRoutes); // Rotas de produtos
app.use('/api/vendas', saleRoutes); // Rotas de vendas
app.use('/api/caixa', caixaRoutes); // Rotas de caixa
app.use('/api/auth', authRoutes); // Rotas de autenticação
app.use('/api/admin', adminRoutes); // Rotas de administrador

// Middleware para capturar erros de rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Middleware de erro global para captura de erros no servidor
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err.stack);
  res.status(500).json({ message: 'Erro no servidor', error: err.message });
});

// Definir a porta do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
