import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RelatoriosVendas = () => {
  const [vendas, setVendas] = useState([]);
  const [dataFiltro, setDataFiltro] = useState('');
  const [erro, setErro] = useState('');

  // Função para buscar as vendas filtradas ou todas as vendas
  const fetchVendas = async (data) => {
    try {
      const response = await axios.get('http://localhost:5000/api/vendas', {
        params: { dataVenda: data }
      });
      setVendas(response.data);
      setErro('');  // Limpar mensagem de erro caso sucesso
    } catch (error) {
      console.error('Erro ao buscar vendas:', error.response?.data || error.message);
      setErro('Erro ao buscar vendas. Verifique a conexão com o servidor.');
    }
  };

  // Função que será chamada ao submeter o filtro de data
  const handleFilter = (e) => {
    e.preventDefault();
    if (dataFiltro) {
      const formattedDate = new Date(dataFiltro).toISOString().split('T')[0]; // Garantir formato ISO
      fetchVendas(formattedDate);  // Enviar a data formatada para o backend
    } else {
      fetchVendas();  // Buscar todas as vendas se a data não for fornecida
    }
  };

  useEffect(() => {
    // Buscar todas as vendas ao carregar a página
    fetchVendas();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-primary">Relatórios de Vendas</h2>

      {/* Formulário para filtrar por data */}
      <form onSubmit={handleFilter} className="mb-4">
        <div className="form-group">
          <label htmlFor="dataVenda">Filtrar por Data</label>
          <input
            type="date"
            id="dataVenda"
            className="form-control"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Buscar</button>
      </form>

      {/* Exibir erro, se houver */}
      {erro && <div className="alert alert-danger">{erro}</div>}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Data da Venda</th>
            <th>Produtos</th>
            <th>Total</th>
            <th>Método de Pagamento</th>
          </tr>
        </thead>
        <tbody>
          {vendas.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">Nenhuma venda registrada</td>
            </tr>
          ) : (
            vendas.map((venda, index) => (
              <tr key={index}>
                <td>{new Date(venda.dataVenda).toLocaleDateString()}</td>
                <td>
                  {venda.produtos.map((produto, i) => (
                    <div key={i}>
                      {produto.nome} - {produto.quantidade} x R$ {produto.preco.toFixed(2)}
                    </div>
                  ))}
                </td>
                <td>R$ {venda.total.toFixed(2)}</td>
                <td>{venda.metodoPagamento}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RelatoriosVendas;
