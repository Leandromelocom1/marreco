const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Rota para listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const produtos = await Product.find();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error });
  }
});

// Rota para cadastrar um novo produto com código de barras
router.post('/', async (req, res) => {
  try {
    const { nome, preco, estoque, estoqueMinimo, codigoBarras } = req.body;

    const novoProduto = new Product({
      nome,
      preco: parseFloat(preco),
      estoque: parseInt(estoque, 10),
      estoqueMinimo: parseInt(estoqueMinimo, 10),
      codigoBarras // Adiciona o código de barras
    });

    const produtoSalvo = await novoProduto.save();
    res.status(201).json(produtoSalvo);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar o produto', error });
  }
});

// Rota para atualizar um produto existente com código de barras
router.put('/:id', async (req, res) => {
  try {
    const produto = await Product.findById(req.params.id);
    if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });

    // Atualiza os campos do produto
    produto.nome = req.body.nome || produto.nome;
    produto.preco = req.body.preco || produto.preco;
    produto.estoque = req.body.estoque || produto.estoque;
    produto.estoqueMinimo = req.body.estoqueMinimo || produto.estoqueMinimo;
    produto.codigoBarras = req.body.codigoBarras || produto.codigoBarras; // Atualiza o código de barras

    const produtoAtualizado = await produto.save();
    res.status(200).json(produtoAtualizado);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar o produto', error });
  }
});

// Rota para buscar um produto por código de barras
router.get('/codigoBarras/:codigoBarras', async (req, res) => {
  try {
    const produto = await Product.findOne({ codigoBarras: req.params.codigoBarras });
    if (!produto) return res.status(404).json(null);
    res.json(produto);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o produto pelo código de barras', error });
  }
});

module.exports = router;
