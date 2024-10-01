const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  produtos: [
    {
      nome: { type: String, required: true },
      preco: { type: Number, required: true },
      quantidade: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  metodoPagamento: { type: String, required: true },
  dataVenda: { type: Date, default: Date.now }
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
