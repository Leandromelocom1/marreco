const mongoose = require('mongoose');

const caixaSchema = new mongoose.Schema({
  valorInicial: { type: Number, required: true },
  valorTotalDia: { type: Number, default: 0 },  // Valor total acumulado no dia
  formasPagamento: { type: Map, of: Number, default: {} },  // Armazenar diferentes formas de pagamento
  status: { type: String, default: 'fechado' },
  dataAbertura: { type: Date, default: Date.now },
  dataFechamento: { type: Date }
});

module.exports = mongoose.model('Caixa', caixaSchema);
