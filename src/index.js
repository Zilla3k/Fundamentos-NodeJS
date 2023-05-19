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

app.listen(3333);
