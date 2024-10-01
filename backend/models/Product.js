const mongoose = require('mongoose');

// Definição do esquema do produto
const productSchema = new mongoose.Schema({
  nome: { type: String, required: [true, 'O nome do produto é obrigatório'] },
  preco: { type: Number, required: [true, 'O preço do produto é obrigatório'] },
  estoque: { type: Number, required: [true, 'A quantidade de estoque é obrigatória'] },
  estoqueMinimo: { type: Number, default: 0, required: [true, 'O estoque mínimo é obrigatório'] },
  codigoBarras: { type: String, required: [true, 'O código de barras é obrigatório'], unique: true }, // Novo campo código de barras
});

module.exports = mongoose.model('Product', productSchema);
