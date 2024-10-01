const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Caixa = require('../models/Caixa');
const Product = require('../models/Product'); // Certifique-se de importar o modelo de produto

// Rota para criar uma nova venda
router.post('/', async (req, res) => {
  try {
    const { produtos, total, metodoPagamento } = req.body;

    // Verificar se o caixa está aberto
    const caixaAberto = await Caixa.findOne({ status: 'aberto' });

    if (!caixaAberto) {
      return res.status(400).json({ message: 'Caixa está fechado. Abra o caixa para realizar vendas.' });
    }

    // Verificar o estoque de cada produto antes de realizar a venda
    for (const produtoVenda of produtos) {
      const produto = await Product.findOne({ nome: produtoVenda.nome });

      if (!produto) {
        console.error(`Produto não encontrado: ${produtoVenda.nome}`);
        return res.status(404).json({ message: `Produto ${produtoVenda.nome} não encontrado` });
      }

      if (produto.estoque < produtoVenda.quantidade) {
        console.error(`Estoque insuficiente para o produto ${produto.nome}.`);
        return res.status(400).json({ message: `Estoque insuficiente para o produto ${produto.nome}` });
      }

      produto.estoque -= produtoVenda.quantidade;

      await produto.save(); // Salvar o produto atualizado
    }

    // Salvar a venda
    const novaVenda = new Sale({
      produtos,
      total,
      metodoPagamento,
      dataVenda: new Date(),
    });

    await novaVenda.save();

    // Incrementar o número de pedidos no caixa
    caixaAberto.numeroPedidos += 1;
    await caixaAberto.save();

    res.status(201).json({ venda: novaVenda, numeroPedidos: caixaAberto.numeroPedidos });
  } catch (error) {
    console.error('Erro ao processar a venda:', error.message);
    res.status(500).json({ message: 'Erro ao processar a venda', error: error.message });
  }
});

// Rota para buscar vendas
router.get('/', async (req, res) => {
  try {
    const vendas = await Sale.find();
    res.status(200).json(vendas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar vendas', error });
  }
});

module.exports = router;
