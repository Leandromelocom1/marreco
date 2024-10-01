const express = require('express');
const router = express.Router();
const Caixa = require('../models/Caixa');

// Rota para abrir o caixa
router.post('/abrir', async (req, res) => {
  try {
    const { valorInicial } = req.body;
    const caixaAberto = await Caixa.findOne({ status: 'aberto' });

    if (caixaAberto) {
      return res.status(400).json({ message: 'Caixa já está aberto.' });
    }

    const novoCaixa = new Caixa({
      valorInicialCaixa: valorInicial,
      valorTotalDia: 0, // Inicializa o valor total das vendas no dia
      status: 'aberto',
      dataAbertura: new Date(),
    });

    await novoCaixa.save();
    res.status(201).json({ message: 'Caixa aberto com sucesso.', caixa: novoCaixa });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao abrir o caixa', error });
  }
});

// Rota para fechar o caixa
router.post('/fechar', async (req, res) => {
  try {
    const { valorFechamento } = req.body;
    const caixaAberto = await Caixa.findOne({ status: 'aberto' });

    if (!caixaAberto) {
      return res.status(400).json({ message: 'Nenhum caixa está aberto.' });
    }

    // Atualizar o status do caixa para fechado e gravar os dados finais
    caixaAberto.status = 'fechado';
    caixaAberto.valorFechamento = valorFechamento;
    caixaAberto.dataFechamento = new Date();
    caixaAberto.numeroPedidos = 0; // Opcionalmente zera o número de pedidos

    await caixaAberto.save();
    res.status(200).json({ message: 'Caixa fechado com sucesso.', caixa: caixaAberto });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fechar o caixa', error });
  }
});

// Rota para verificar o status do caixa
router.get('/status', async (req, res) => {
  try {
    const caixaAberto = await Caixa.findOne({ status: 'aberto' });
    if (!caixaAberto) {
      return res.status(200).json({ status: 'fechado', numeroPedidos: 0 });
    }

    res.status(200).json({ status: 'aberto', numeroPedidos: caixaAberto.numeroPedidos });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar status do caixa', error });
  }
});

// Rota para realizar a sangria
router.post('/sangria', async (req, res) => {
  try {
    // Verificar se existe um caixa aberto
    const caixaAberto = await Caixa.findOne({ status: 'aberto' });

    if (!caixaAberto) {
      return res.status(400).json({ message: 'Nenhum caixa está aberto para realizar a sangria.' });
    }

    // Zerar o valor total do dia mantendo o valor inicial
    caixaAberto.valorTotalDia = 0;  // Zerar o valor total das vendas do dia
    await caixaAberto.save();

    res.status(200).json({ message: 'Sangria realizada com sucesso.', caixa: caixaAberto });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao realizar a sangria', error });
  }
});

module.exports = router;
