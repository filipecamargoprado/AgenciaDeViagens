const express = require('express');
const pedidosRoutes = require('./routes/provaRoute');
const app = express();

app.use(express.json());

app.use(pedidosRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => console.log('Servidor rodando'));
}

module.exports = app;