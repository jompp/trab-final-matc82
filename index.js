const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conexão com o banco de dados realizada com sucesso!");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS form_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numericField INTEGER,
      textField TEXT
    )
  `, (err) => {
    if (err) {
      console.error("Erro ao criar tabela:", err.message);
    } else {
      console.log("Tabela 'form_data' criada ou já existente.");
    }
  });
});

app.post('/submit-form', (req, res) => {
  const { numericField, textField } = req.body;

  if (!/^\d+$/.test(numericField)) {
    return res.status(422).json({ error: 'Campo numérico inválido: deve conter apenas números.' });
  }

  const numValue = parseInt(numericField, 10);

  const query = `INSERT INTO form_data (numericField, textField) VALUES (?, ?)`;
  db.run(query, [numValue, textField], function(err) {
    if (err) {
      console.error("Erro ao inserir dados:", err.message);
      return res.status(500).json({ error: 'Erro ao inserir dados no banco de dados.' });
    }
    res.json({ message: 'Dados inseridos com sucesso!', id: this.lastID });
  });
});

app.get('/dados', (req, res) => {
  const query = `SELECT * FROM form_data`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Erro ao recuperar dados:", err.message);
      return res.status(500).json({ error: 'Erro ao recuperar dados do banco de dados.' });
    }
    res.json({ data: rows });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
