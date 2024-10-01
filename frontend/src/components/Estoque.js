import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Estoque = () => {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [codigoBarras, setCodigoBarras] = useState(''); // Novo campo código de barras
  const [estoque, setEstoque] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/produtos');
        setProdutos(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    fetchProdutos();
  }, []);

  const cadastrarOuAtualizarProduto = async (e) => {
    e.preventDefault();

    try {
      const produto = {
        nome: nome.toUpperCase(),
        preco,
        codigoBarras, // Inclui o código de barras
        estoque,
        estoqueMinimo
      };

      if (produtoSelecionado) {
        // Atualizar o produto existente
        const response = await axios.put(`http://localhost:5000/api/produtos/${produtoSelecionado}`, produto);
        setMensagem(`Produto ${response.data.nome} atualizado com sucesso!`);
      } else {
        // Cadastrar um novo produto
        const response = await axios.post('http://localhost:5000/api/produtos', produto);
        setMensagem(`Produto ${response.data.nome} cadastrado com sucesso!`);
        setProdutos([...produtos, response.data]); 
      }

      // Limpar campos do formulário
      setNome('');
      setPreco('');
      setCodigoBarras(''); // Limpa o campo de código de barras
      setEstoque('');
      setEstoqueMinimo('');
      setProdutoSelecionado('');

    } catch (error) {
      if (error.response && error.response.data.message) {
        setMensagem(error.response.data.message);
      } else {
        setMensagem('Erro ao processar o produto.');
      }
    }
  };

  const selecionarProduto = (e) => {
    const produtoId = e.target.value;
    const produto = produtos.find(p => p._id === produtoId);

    if (produto) {
      setNome(produto.nome);
      setPreco(produto.preco);
      setCodigoBarras(produto.codigoBarras); // Preenche o código de barras
      setEstoque(produto.estoque);
      setEstoqueMinimo(produto.estoqueMinimo);
      setProdutoSelecionado(produtoId);
    } else {
      setNome('');
      setPreco('');
      setCodigoBarras(''); 
      setEstoque('');
      setEstoqueMinimo('');
      setProdutoSelecionado('');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary">Gerenciamento de Estoque</h2>

      <div className="form-group">
        <label>Selecione um Produto Cadastrado</label>
        <div className="d-flex">
          <select className="form-control" onChange={selecionarProduto} value={produtoSelecionado}>
            <option value="">-- Selecione um Produto --</option>
            {produtos.map(produto => (
              <option key={produto._id} value={produto._id}>
                {produto.nome}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-success ml-2"
            onClick={() => setProdutoSelecionado('')}
          >
            + Novo Produto
          </button>
        </div>
      </div>

      <form onSubmit={cadastrarOuAtualizarProduto}>
        <div className="form-group">
          <label>Nome do Produto</label>
          <input
            type="text"
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Preço</label>
          <input
            type="number"
            className="form-control"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Código de Barras</label>
          <input
            type="text"
            className="form-control"
            value={codigoBarras} 
            onChange={(e) => setCodigoBarras(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Estoque</label>
          <input
            type="number"
            className="form-control"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Estoque Mínimo</label>
          <input
            type="number"
            className="form-control"
            value={estoqueMinimo}
            onChange={(e) => setEstoqueMinimo(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          {produtoSelecionado ? 'Atualizar Produto' : 'Cadastrar Produto'}
        </button>
      </form>

      {mensagem && <p className="mt-3">{mensagem}</p>}
    </div>
  );
};

export default Estoque;
