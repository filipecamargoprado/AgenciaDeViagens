
const pacotes = [
  {
    id: 1,
    destino: "Lisboa",
    cidade: "Lisboa",
    preco: 4000,
    vagas: 10,
    disponivel: true
  }
];

const reservas = [];

const weatherTranslations = {
  "clear": "Ensolarado",
  "sunny": "Ensolarado",
  "partly cloudy": "Parcialmente Nublado",
  "cloudy": "Nublado",
  "overcast": "Encoberto",
  "mist": "Névoa",
  "patchy rain nearby": "Chuva passageira",
  "light rain": "Chuva leve",
  "heavy rain": "Chuva forte",
  "snow": "Neve",
  "thunderstorm": "Tempestade"
};


exports.getPacotes = () => pacotes;


exports.criarPacote = (dados) => {
  const novoPacote = {
    id: pacotes.length + 1,
    destino: dados.destino,
    cidade: dados.cidade,
    preco: Number(dados.preco),
    vagas: Number(dados.vagas),
    disponivel: Number(dados.vagas) > 0
  };
  pacotes.push(novoPacote);
  return novoPacote;
};

exports.getReservas = () => reservas;

exports.getReservaPorId = (id) => {
    return reservas.find(r => r.id === Number(id));
};
exports.validarRegistro = (registro) => {
  return !!(registro && registro.cliente && registro.pacoteId && registro.pessoas);
};

// Jest #1 Service: calcular total com taxa de serviço e seguro
exports.calcularTotal = (precoPacote, seguro) => {
  const taxaServico = precoPacote * 0.08;
  const seguroFee = seguro ? precoPacote * 0.03 : 0;
  return precoPacote + taxaServico + seguroFee;
};

// Jest #2 Service: aplicar desconto de 10% para grupo +4 pessoas
exports.aplicarDesconto = (total, pessoas) => {
  if (pessoas > 4) {
    return total * 0.9;
  }
  return total;
};

// Conexão com API externa wttr.in
exports.fetchWeather = async (cidade) => {
  try {
    const response = await fetch(`https://wttr.in/${encodeURIComponent(cidade)}?format=j1`);
    if (!response.ok) {
      throw new Error("Erro na resposta do wttr.in");
    }
    const data = await response.json();
    const temp_C = data.current_condition[0].temp_C;
    const rawDesc = data.current_condition[0].weatherDesc[0].value.trim().toLowerCase();
    const condicao = weatherTranslations[rawDesc] || data.current_condition[0].weatherDesc[0].value.trim();
    return {
      temp: `${temp_C}°C`,
      condicao: condicao
    };
  } catch (error) {
    console.error(`Erro ao buscar clima para ${cidade}:`, error.message);
    // Fallback padrão se der erro ou timeout na API externa
    return {
      temp: "19°C",
      condicao: "Ensolarado"
    };
  }
};

// Cria reserva com regras de negócio completas
exports.criarReserva = async (dados) => {
  const { pacoteId, cliente, pessoas, seguro } = dados;
  
  const pacote = pacotes.find(p => p.id === Number(pacoteId));
  if (!pacote) {
    const err = new Error("Pacote não encontrado");
    err.status = 404;
    throw err;
  }
  
  if (pacote.vagas < pessoas) {
    const err = new Error("Pacote sem vagas disponíveis");
    err.status = 400;
    throw err;
  }
  
  // Buscar clima atual do destino
  const climaInfo = await exports.fetchWeather(pacote.cidade);
  const climaString = `${climaInfo.temp}, ${climaInfo.condicao}`;
  
  const totalSemDesconto = exports.calcularTotal(pacote.preco, seguro);
  const totalComDesconto = exports.aplicarDesconto(totalSemDesconto, pessoas);
  
  const taxaServico = pacote.preco * 0.08;
  const seguroFee = seguro ? pacote.preco * 0.03 : 0;
  
  // Decrementa vagas e atualiza disponibilidade
  pacote.vagas -= pessoas;
  pacote.disponivel = pacote.vagas > 0;
  
  const novaReserva = {
    id: reservas.length + 1,
    pacoteId: pacote.id,
    cliente,
    pessoas,
    seguro: !!seguro,
    taxaServico,
    total: totalComDesconto,
    clima: climaString
  };
  
  reservas.push(novaReserva);
  
  return {
    id: novaReserva.id,
    destino: pacote.destino,
    pessoas: novaReserva.pessoas,
    pacote: pacote.preco,
    taxa: taxaServico,
    seguro: seguroFee,
    total: totalComDesconto,
    clima: climaString,
    cliente: novaReserva.cliente
  };
};