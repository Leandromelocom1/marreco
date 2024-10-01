import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Cardapio = () => {
  const { mesa } = useParams(); // Pega o número da mesa da URL
  const [pedido, setPedido] = useState([]);

  const cardapio = [
    { id: 1, nome: 'Hamburguer', preco: 5.0 },
    { id: 2, nome: 'Coca-Cola', preco: 3.0 },
    { id: 3, nome: 'Pizza', preco: 15.0 },
    { id: 4, nome: 'Suco', preco: 4.0 },
    // Adicione mais itens ao cardápio
  ];

  const adicionarAoPedido = (item) => {
    setPedido([...pedido, item]);
  };

  return (
    <div>
      <h2>Cardápio - Mesa {mesa}</h2>
      <div>
        {cardapio.map((item) => (
          <div key={item.id}>
            <span>{item.nome} - R${item.preco.toFixed(2)}</span>
            <button onClick={() => adicionarAoPedido(item)}>Adicionar</button>
          </div>
        ))}
      </div>

      <h3>Pedido Atual</h3>
      <ul>
        {pedido.map((item, index) => (
          <li key={index}>{item.nome} - R${item.preco.toFixed(2)}</li>
        ))}
      </ul>

      <h3>Total: R${pedido.reduce((total, item) => total + item.preco, 0).toFixed(2)}</h3>
    </div>
  );
};

export default Cardapio;
