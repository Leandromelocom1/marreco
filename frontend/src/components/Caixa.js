import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Caixa = () => {
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [numeroPedidos, setNumeroPedidos] = useState(1);
  const [valorInicialCaixa, setValorInicialCaixa] = useState(0);
  const [valorTotalDia, setValorTotalDia] = useState(0);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [inputValorInicial, setInputValorInicial] = useState('');
  const [dataAbertura, setDataAbertura] = useState('');
  const [sangriaFeita, setSangriaFeita] = useState(false);

  useEffect(() => {
    const caixaStatus = localStorage.getItem('caixaAberto');
    const pedidos = localStorage.getItem('numeroPedidos');
    const valorInicial = localStorage.getItem('valorInicialCaixa');
    const dataAberturaCaixa = localStorage.getItem('dataAbertura');

    setCaixaAberto(caixaStatus === 'true');
    setNumeroPedidos(pedidos ? parseInt(pedidos, 10) : 1);
    setValorInicialCaixa(valorInicial ? parseFloat(valorInicial) : 0);
    setDataAbertura(dataAberturaCaixa || '');
  }, []);

  const abrirCaixa = () => {
    if (inputValorInicial === '' || isNaN(inputValorInicial)) {
      alert('Por favor, insira um valor inicial válido para o caixa.');
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];

    setValorInicialCaixa(parseFloat(inputValorInicial));
    localStorage.setItem('valorInicialCaixa', inputValorInicial);
    localStorage.setItem('caixaAberto', 'true');
    localStorage.setItem('dataAbertura', hoje);
    setDataAbertura(hoje);
    setCaixaAberto(true);
    setSangriaFeita(false);
    alert('Caixa aberto. Você pode começar a vender.');
  };

  const fecharCaixa = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vendas', {
        params: { dataVenda: dataAbertura }
      });
      const vendasDoDia = response.data;

      let valorTotal = 0;
      const formasPag = {};

      vendasDoDia.forEach((venda) => {
        valorTotal += venda.total;
        formasPag[venda.metodoPagamento] = (formasPag[venda.metodoPagamento] || 0) + venda.total;
      });

      setValorTotalDia(valorTotal);
      setFormasPagamento(Object.entries(formasPag));

      setCaixaAberto(false);
      localStorage.setItem('caixaAberto', 'false');
      setNumeroPedidos(1);
      localStorage.setItem('numeroPedidos', '1');
      localStorage.removeItem('dataAbertura');
      alert('Caixa fechado. Resumo do dia exibido abaixo.');
    } catch (error) {
      console.error('Erro ao fechar o caixa:', error);
      alert('Erro ao fechar o caixa. Tente novamente.');
    }
  };

  const fazerSangria = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/caixa/sangria');
      
      if (response.status === 200) {
        setValorTotalDia(0);
        setFormasPagamento([]);
        setSangriaFeita(true);
        alert('Sangria realizada. Valores recebidos foram zerados.');
      }
    } catch (error) {
      console.error('Erro ao realizar a sangria:', error);
      alert('Erro ao realizar a sangria.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary">Controle de Caixa</h2>
      <p>Status do Caixa: {caixaAberto ? 'Aberto' : 'Fechado'}</p>
      <p>Número de Pedidos: {numeroPedidos}</p>

      {!caixaAberto && (
        <>
          <div className="form-group">
            <label htmlFor="valorInicial">Valor Inicial em Dinheiro no Caixa:</label>
            <input
              type="number"
              className="form-control"
              id="valorInicial"
              value={inputValorInicial}
              onChange={(e) => setInputValorInicial(e.target.value)}
            />
          </div>
          <button className="btn btn-primary mt-3" onClick={abrirCaixa}>
            Abrir Caixa
          </button>
        </>
      )}

      {caixaAberto && (
        <button className="btn btn-warning" onClick={fecharCaixa}>
          Fechar Caixa
        </button>
      )}

      {valorTotalDia > 0 && !sangriaFeita && (
        <div className="mt-5">
          <h3>Resumo do Dia</h3>
          <p>Valor Inicial no Caixa: R$ {valorInicialCaixa.toFixed(2)}</p>
          <p>Valor Total Recebido: R$ {valorTotalDia.toFixed(2)}</p>

          <h4>Formas de Pagamento:</h4>
          <ul>
            {formasPagamento.map(([forma, valor]) => (
              <li key={forma}>
                {forma}: R$ {valor.toFixed(2)}
              </li>
            ))}
          </ul>

          <button className="btn btn-danger mt-3" onClick={fazerSangria}>
            Fazer Sangria
          </button>
        </div>
      )}

      {sangriaFeita && (
        <div className="mt-5 alert alert-success">
          <h4>Sangria realizada</h4>
          <p>Os valores recebidos foram zerados e o caixa está pronto para uma nova operação.</p>
        </div>
      )}
    </div>
  );
};

export default Caixa;
