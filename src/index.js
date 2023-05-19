const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();

app.use(express.json());

const clientes = [];

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

app.get('/extrato/:cpf', (req, res) => {
  const { cpf } = req.params;

  const cliente = clientes.find((cliente) => cliente.cpf === cpf);

  if (!cliente) {
    return res.status(400).json({ error: 'Cliente nāo encontrado!' });
  }

  return res.json(cliente.extrato);
});

app.listen(3333);
