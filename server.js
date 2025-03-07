const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://seu_usuario:sua_senha@localhost:5432/seu_banco'
});

app.use(cors());
app.use(bodyParser.json());

// Endpoint para buscar todos os favoritos
app.get('/favorites', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM favorites');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
});

// Endpoint para adicionar um novo favorito
app.post('/favorites', async (req, res) => {
  try {
    const { id, text, image } = req.body;
    
    // Verifica se o favorito já existe
    const exists = await pool.query('SELECT * FROM favorites WHERE id = $1', [id]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Favorito já existe' });
    }
    
    await pool.query(
      'INSERT INTO favorites (id, text, image) VALUES ($1, $2, $3)',
      [id, text, image]
    );
    res.status(201).json({ message: 'Favorito adicionado com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ error: 'Erro ao adicionar favorito' });
  }
});

// Endpoint para remover um favorito pelo ID
app.delete('/favorites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM favorites WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Favorito não encontrado' });
    }
    
    res.json({ message: 'Favorito removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
