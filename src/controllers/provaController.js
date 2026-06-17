const service = require('../services/provaService');

exports.ListarPacotes = async (req, res) => {
  try {
    const pacotes = service.getPacotes();
    const pacotesComClima = await Promise.all(pacotes.map(async (pacote) => {
      const clima = await service.fetchWeather(pacote.cidade);
      return {
        ...pacote,
        clima
      };
    }));
    res.json(pacotesComClima);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ListarReservas = (req, res) => {
  try {
    const reservas = service.getReservas();
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ListarReservaPorId = (req, res) => {
  try {
    const reserva = service.getReservaPorId(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }
    res.json(reserva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ConsultarClima = async (req, res) => {
  try {
    const clima = await service.fetchWeather(req.params.cidade);
    res.json(clima);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.CriarPacote = (req, res) => {
  try {
    const novoPacote = service.criarPacote(req.body);
    res.status(201).json(novoPacote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.CriarReserva = async (req, res) => {
  try {
    const resultado = await service.criarReserva(req.body);
    res.status(201).json({
      destino: resultado.destino,
      pessoas: resultado.pessoas,
      pacote: resultado.pacote,
      taxa: resultado.taxa,
      seguro: resultado.seguro,
      total: resultado.total
    });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
};

exports.ConfirmarViagem = (req, res) => {
  try {
    const { destino } = req.body;
    res.status(202).json({
      status: "aceito",
      mensagem: `Viagem para ${destino || "o destino"} confirmada`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};