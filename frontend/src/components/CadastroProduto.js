import React, { useState } from 'react';
import axios from 'axios';

const CadastroProduto = () => {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState(null); // Alteração para imagem
  const [estoque, setEstoque] = useState(''); // Campo de estoque
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !preco || !estoque || !imagem) { // Verifique se o campo de imagem foi preenchido
      setMensagem('Preencha todos os campos.');
      return;
    }

    const formData = new FormData(); // Usar FormData para enviar arquivos
    formData.append('nome', nome.toUpperCase()); // Nome convertido para caixa alta
    formData.append('preco', parseFloat(preco));
    formData.append('imagem', imagem); // Adicionando a imagem
    formData.append('estoque', parseInt(estoque, 10));

    try {
      // Verificar se o produto já existe
      const produtoExistente = await axios.get(`http://localhost:5000/api/produtos/${nome.toUpperCase()}`);
      
      if (produtoExistente.data) {
        const estoqueAtualizado = produtoExistente.data.estoque + parseInt(estoque, 10);
        await axios.put(`http://localhost:5000/api/produtos/${produtoExistente.data._id}`, { estoque: estoqueAtualizado });
        setMensagem(`Estoque do produto ${produtoExistente.data.nome} atualizado com sucesso!`);
      } else {
        // Se o produto não existir, crie um novo com imagem
        const response = await axios.post('http://localhost:5000/api/produtos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMensagem(`Produto ${response.data.nome} cadastrado com sucesso!`);
      }

      setNome('');
      setPreco('');
      setImagem(null); // Limpar o campo de imagem
      setEstoque('');
    } catch (error) {
      setMensagem('Erro ao cadastrar ou atualizar o produto. Tente novamente.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary">Cadastro de Produto / Atualização de Estoque</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data"> {/* Multipart para upload de arquivo */}
        <div className="form-group">
          <label>Nome do Produto</label>
          <input
            type="text"
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Preço</label>
          <input
            type="number"
            className="form-control"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Imagem do Produto</label> {/* Campo de upload da imagem */}
          <input
            type="file"
            className="form-control"
            onChange={(e) => setImagem(e.target.files[0])} // Capturar o arquivo de imagem
          />
        </div>
        <div className="form-group">
          <label>Quantidade no Estoque</label>
          <input
            type="number"
            className="form-control"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          {nome ? 'Cadastrar ou Atualizar Estoque' : 'Cadastrar Produto'}
        </button>
      </form>
      {mensagem && <p className="mt-3">{mensagem}</p>}
    </div>
  );
};

export default CadastroProduto;
