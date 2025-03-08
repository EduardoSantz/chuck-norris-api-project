const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Endpoint para buscar todos os favoritos
app.get('/favorites', async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany();
    res.json(favorites);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
});

// Endpoint para adicionar um novo favorito
app.post('/favorites', async (req, res) => {
  try {
    const { id, text, image } = req.body;
    
    const exists = await prisma.favorite.findUnique({
      where: { id }
    });
    
    if (exists) {
      return res.status(400).json({ error: 'Favorito já existe' });
    }
    
    const newFavorite = await prisma.favorite.create({
      data: { id, text, image }
    });
    
    res.status(201).json(newFavorite);
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ error: 'Erro ao adicionar favorito' });
  }
});

// Endpoint para remover um favorito pelo ID
app.delete('/favorites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFavorite = await prisma.favorite.delete({
      where: { id }
    });
    
    res.json(deletedFavorite);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Favorito não encontrado' });
    }
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});