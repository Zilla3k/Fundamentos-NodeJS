const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();

app.use(express.json());

const clientes = [];

// Middleware para otimizaçāo de busca do cpf
function verificarSeExisteContaCpf(req, res, next) {
  const { cpf } = req.headers;

  const cliente = clientes.find((cliente) => cliente.cpf === cpf);

  if (!cliente) {
    return res.status(400).json({ error: 'Cliente nāo encontrado!' });
  }

  req.cliente = cliente;

  return next();
}

function pegarQuantia(extrato) {
  const quantia = extrato.reduce((acc, operacao) => {
    if (operacao.tipo === 'credito') {
      return acc + operacao.valor;
    } else {
      return acc - operacao.valor;
    }
  }, 0);
  return quantia;
}

/**
 * CPF - string
 * Nome - string
 * id - uuidV4
 * Extrato - []
 */
app.post('/conta', (req, res) => {
  const { cpf, nome } = req.body;

  const clienteJaExiste = clientes.some((cliente) => cliente.cpf === cpf);

  if (clienteJaExiste) {
    return res.status(400).json({ error: 'Cliente ja existe!' });
  }

  clientes.push({
    cpf,
    nome,
    id: uuidV4(),
    extrato: [],
  });

  return res.status(201).send();
});

// app.use(verificarSeExisteContaCpf) // Todas as funçōes abaixo desta linha recebem o middleware como parâmetro

// Middleware é usado apenas nesta linha como parâmetro
app.get('/extrato', verificarSeExisteContaCpf, (req, res) => {
  const { cliente } = req;
  return res.json(cliente.extrato);
});

app.post('/deposito', verificarSeExisteContaCpf, (req, res) => {
  const { descricao, valor } = req.body;
  const { cliente } = req;

  const operacaoExtrato = {
    descricao,
    valor,
    data: new Date(),
    tipo: 'credito',
  };

  cliente.extrato.push(operacaoExtrato);
  return res.status(201).send();
});

app.post('/saque', verificarSeExisteContaCpf, (req, res) => {
  const { valor } = req.body;
  const { cliente } = req;

  const quantia = pegarQuantia(cliente.extrato);

  if (quantia < valor) {
    return res.status(400).json({ error: 'Saldo insuficiente!' });
  }

  const operacaoExtrato = {
    valor,
    data: new Date(),
    tipo: 'debito',
  };

  cliente.extrato.push(operacaoExtrato);
  return res.status(201).send();
});

app.get('/extrato/data', verificarSeExisteContaCpf, (req, res) => {
  const { cliente } = req;
  const { data } = req.query;

  const dataFormatada = new Date(data + ' 00:00');

  const extrato = cliente.extrato.filter(
    (extrato) =>
      extrato.data.toDateString() === new Date(dataFormatada).toDateString(),
  );

  return res.json(extrato);
});

app.listen(3333);
