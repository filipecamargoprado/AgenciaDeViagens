const express = require('express');
const routes = express.Router();
const controller = require('../controllers/provaController');

routes.get('/pacotes', controller.ListarPacotes);
routes.get('/reservas', controller.ListarReservas);
routes.get('/reservas/:id', controller.ListarReservaPorId);
routes.get('/clima/:cidade', controller.ConsultarClima);

routes.post('/pacotes', controller.CriarPacote);
routes.post('/reservas', controller.CriarReserva);

// Evento M5 — Viagem Confirmada
routes.post('/eventos/viagem-confirmada', controller.ConfirmarViagem);

module.exports = routes;