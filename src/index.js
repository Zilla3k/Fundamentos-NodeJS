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
  const id = uuidV4();

  clientes.push({
    cpf,
    nome,
    id,
    extrato: [],
  });

  return res.status(201).send();
});

app.listen(3333);
