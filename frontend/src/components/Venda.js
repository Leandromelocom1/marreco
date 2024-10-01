import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Venda.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom'; // Importando useNavigate

const Venda = () => {
  const [carrinho, setCarrinho] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [total, setTotal] = useState(0);
  const [mostrarPagamento, setMostrarPagamento] = useState(false); 
  const [numeroPedido, setNumeroPedido] = useState(1); 
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [codigoBarras, setCodigoBarras] = useState(''); 
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [imprimirCupom, setImprimirCupom] = useState(false); 
  const [cupomEmitido, setCupomEmitido] = useState(null); 
  const navigate = useNavigate(); // Hook para redirecionamento

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get('http://192.168.0.78:5000/api/produtos');
        setProdutos(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    fetchProdutos();

    const caixaStatus = localStorage.getItem('caixaAberto');
    const pedidoAtual = localStorage.getItem('numeroPedidos');
    
    setCaixaAberto(caixaStatus === 'true');
    setNumeroPedido(pedidoAtual ? parseInt(pedidoAtual, 10) : 1);
  }, []);

  const adicionarProdutoPorCodigoBarras = (codigoBarras) => {
    const produto = produtos.find(p => p.codigoBarras === codigoBarras);

    if (!produto) {
      alert('Produto não encontrado.');
      return;
    }

    adicionarProduto(produto);
    setCodigoBarras(''); 
  };

  const adicionarProduto = (produto) => {
    if (!caixaAberto) {
      alert('Você precisa abrir o caixa antes de adicionar produtos.');
      return;
    }

    const itemExistente = carrinho.find((item) => item._id === produto._id);

    if (produto.estoque <= 0) {
      alert(`Produto ${produto.nome} está esgotado!`);
      return;
    }

    if (produto.estoque <= produto.estoqueMinimo) {
      alert(`Atenção: Estoque baixo para o produto ${produto.nome}.`);
    }

    if (itemExistente) {
      alert(`Produto ${produto.nome} já está no carrinho.`);
      return;
    }

    setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    setTotal(total + produto.preco);
    setProdutoSelecionado(produto._id);
  };

  const alterarQuantidade = (produto, novaQuantidade) => {
    const novaQuantidadeNumerica = parseInt(novaQuantidade, 10);
    if (novaQuantidadeNumerica > produto.estoque) {
      alert(`Quantidade excede o estoque disponível de ${produto.nome}. Estoque atual: ${produto.estoque}`);
      return;
    }
    if (novaQuantidadeNumerica >= 1) {
      const novoCarrinho = carrinho.map((item) =>
        item._id === produto._id ? { ...item, quantidade: novaQuantidadeNumerica } : item
      );
      const totalAtualizado = novoCarrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
      setCarrinho(novoCarrinho);
      setTotal(totalAtualizado);
    }
  };

  const removerProduto = (produto) => {
    const novoCarrinho = carrinho.filter((item) => item._id !== produto._id);
    setCarrinho(novoCarrinho);
    setTotal(total - produto.preco * produto.quantidade);
  };

  const finalizarCompra = () => {
    if (!caixaAberto) {
      alert('Você precisa abrir o caixa antes de realizar vendas.');
      return;
    }

    if (carrinho.length > 0) {
      setMostrarPagamento(true);
    } else {
      alert('Carrinho está vazio!');
    }
  };

  const confirmarPagamento = async (metodoPagamento) => {
    try {
      const venda = {
        produtos: carrinho.map(item => ({
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade
        })),
        total,
        metodoPagamento,
        numeroPedido,
      };

      await axios.post('http://192.168.0.78:5000/api/vendas', venda);

      const cupom = {
        pedido: numeroPedido,
        itens: carrinho,
        total,
        emitidoEm: new Date(),
        metodoPagamento,
      };
      setCupomEmitido(cupom);

      const novoNumeroPedido = numeroPedido + 1;
      setCarrinho([]);
      setTotal(0);
      setMostrarPagamento(false);
      setNumeroPedido(novoNumeroPedido);
      localStorage.setItem('numeroPedidos', novoNumeroPedido);

      setImprimirCupom(true); 

      // Redirecionar para a página inicial ou para uma página de sucesso após a venda
      navigate('/'); 

    } catch (error) {
      console.error('Erro ao salvar a venda:', error.response?.data || error.message);
      alert('Erro ao finalizar a compra, verifique os dados e tente novamente.');
    }
  };

  const imprimirCupomFiscal = () => {
    window.print();
  };

  const cancelarCompra = () => {
    setCarrinho([]);
    setTotal(0);
  };

  const fecharModalPagamento = () => {
    setMostrarPagamento(false);
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-lg-8 mb-4">
          <h2 className="text-primary">Produtos Disponíveis</h2>

          {/* Campo para leitura de código de barras */}
          <div className="form-group">
            <label htmlFor="codigoBarras">Código de Barras</label>
            <input
              type="text"
              id="codigoBarras"
              className="form-control"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  adicionarProdutoPorCodigoBarras(codigoBarras);
                }
              }}
              placeholder="Escaneie ou digite o código de barras"
            />
          </div>

          <div className="row">
            {produtos.length === 0 ? (
              <p>Nenhum produto disponível.</p>
            ) : (
              produtos.map((produto) => (
                <div key={produto._id} className="col-md-2 mb-4">
                  <div
                    className={`card shadow-sm h-100 ${produto.estoque === 0 ? 'apagado' : ''} ${produtoSelecionado === produto._id ? 'selecionado' : ''}`}
                    onClick={() => adicionarProduto(produto)}
                    style={{ cursor: produto.estoque > 0 ? 'pointer' : 'not-allowed' }}
                  >
                    <div className="card-body text-center">
                      <span style={{ fontSize: '3rem' }}>{produto.estoque > 0 ? produto.icone : '❌'}</span>
                      <h5 className="card-title mt-3">{produto.nome}</h5>
                      <p className="card-text">R$ {produto.preco.toFixed(2)}</p>
                      <p className="text-danger">
                        {produto.estoque === 0 ? 'Estoque esgotado!' : (produto.estoque <= produto.estoqueMinimo ? 'Estoque baixo!' : '')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <h3 className="text-primary">Pedido #{numeroPedido}</h3>
            {carrinho.length === 0 ? (
              <p className="text-muted">Carrinho vazio</p>
            ) : (
              <ul className="list-group list-group-flush mb-3">
                {carrinho.map((item, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      {item.nome} - R$ {item.preco.toFixed(2)}
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => alterarQuantidade(item, e.target.value)}
                        className="ml-2 form-control d-inline-block"
                        style={{ width: '60px' }}
                      />
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removerProduto(item)}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <h4 className="font-weight-bold">Valor Total: R$ {total.toFixed(2)}</h4>
            <button className="btn btn-success btn-block mb-2" onClick={finalizarCompra}>
              Receber e Finalizar
            </button>
            <button className="btn btn-secondary btn-block" onClick={cancelarCompra}>
              Cancelar
            </button>
          </div>

          {mostrarPagamento && (
            <>
              <div className="pagamento-overlay" onClick={fecharModalPagamento}></div>
              <div className="pagamento-modal bg-light p-4 position-relative">
                <button
                  className="btn-close position-absolute top-0 end-0"
                  aria-label="Fechar"
                  onClick={fecharModalPagamento}
                ></button>
                <h2>Forma de Pagamento</h2>
                <button className="btn btn-primary mb-2" onClick={() => confirmarPagamento('Dinheiro')}>Dinheiro</button>
                <button className="btn btn-secondary mb-2" onClick={() => confirmarPagamento('Cartão de Crédito')}>Cartão de Crédito</button>
                <button className="btn btn-success mb-2" onClick={() => confirmarPagamento('Cartão de Débito')}>Cartão de Débito</button>
                <button className="btn btn-warning mb-2" onClick={() => confirmarPagamento('Mumbuca')}>Mumbuca</button>
              </div>
            </>
          )}

          {imprimirCupom && (
            <div id="cupom-fiscal" className="cupom-imprimir">
              <h3>Cupom Fiscal - Pedido #{cupomEmitido?.pedido}</h3>
              <p><strong>CNPJ:</strong> 99.999.999/9999-99</p>
              <p><strong>Endereço:</strong> Rua Principal, 123, Centro, Cidade</p>
              <hr />
              <h4>Detalhes da Venda:</h4>
              <ul>
                {cupomEmitido?.itens.map((item, index) => (
                  <li key={index}>
                    {item.nome} - Quantidade: {item.quantidade} - R$ {item.preco.toFixed(2)}
                  </li>
                ))}
              </ul>
              <hr />
              <p><strong>Total:</strong> R$ {cupomEmitido?.total.toFixed(2)}</p>
              <p><strong>Forma de Pagamento:</strong> {cupomEmitido?.metodoPagamento}</p>
              <button className="btn btn-primary" onClick={imprimirCupomFiscal}>Imprimir</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Venda;
