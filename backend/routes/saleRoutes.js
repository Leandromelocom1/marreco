const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Caixa = require('../models/Caixa');

// Rota para criar uma nova venda
router.post('/', async (req, res) => {
  try {
    const { produtos, total, metodoPagamento } = req.body;

    // Verificar se os campos essenciais foram fornecidos
    if (!Array.isArray(produtos) || produtos.length === 0 || typeof total !== 'number' || !metodoPagamento) {
      return res.status(400).json({ message: 'Dados da venda incompletos ou inválidos' });
    }

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
        console.error(`Estoque insuficiente para o produto ${produto.nome}. Estoque atual: ${produto.estoque}, solicitado: ${produtoVenda.quantidade}`);
        return res.status(400).json({ message: `Estoque insuficiente para o produto ${produto.nome}` });
      }

      // Atualizar o estoque do produto
      produto.estoque -= produtoVenda.quantidade;

      // Verificar se o estoque atingiu o mínimo e gerar alerta
      if (produto.estoque <= produto.estoqueMinimo) {
        console.log(`Alerta: Estoque do produto ${produto.nome} está no limite mínimo.`);
      }

      await produto.save(); // Salvar o produto
    }

    // Se tudo estiver OK, salvar a venda com os campos adequados
    const novaVenda = new Sale({
      produtos,
      total,
      metodoPagamento,
      dataVenda: new Date(), // Definir a data da venda
    });

    await novaVenda.save(); // Salvar a venda

    // Incrementar o número de pedidos no caixa
    caixaAberto.numeroPedidos += 1;
    await caixaAberto.save(); // Atualizar o caixa

    res.status(201).json({ venda: novaVenda, numeroPedidos: caixaAberto.numeroPedidos });
  } catch (error) {
    console.error('Erro ao processar a venda:', error.message); // Log detalhado do erro
    res.status(500).json({ message: 'Erro ao processar a venda', error: error.message });
  }
});

// Rota para buscar vendas (GET)
router.get('/', async (req, res) => {
  try {
    const vendas = await Sale.find();
    res.status(200).json(vendas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar vendas', error });
  }
});

module.exports = router;
