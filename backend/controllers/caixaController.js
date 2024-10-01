const Caixa = require('../models/Caixa');

// Rota para realizar a sangria
const fazerSangria = async (req, res) => {
  try {
    // Verificar se existe um caixa aberto
    const caixaAberto = await Caixa.findOne({ status: 'aberto' });

    if (!caixaAberto) {
      return res.status(400).json({ message: 'Nenhum caixa está aberto para realizar a sangria.' });
    }

    // Zerar o valor total do dia e as formas de pagamento, mantendo o valor inicial
    caixaAberto.valorTotalDia = 0;  // Zerar o valor total das vendas do dia
    caixaAberto.formasPagamento = {};  // Zerar as formas de pagamento
    await caixaAberto.save();

    res.status(200).json({ message: 'Sangria realizada com sucesso.', caixa: caixaAberto });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao realizar a sangria', error });
  }
};

module.exports = {
  fazerSangria
};
