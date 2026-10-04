const formulario = document.getElementById("formulario");
const cepInput = document.getElementById("cep");
const resultado = document.getElementById("resultado");

const origem = "Rua Germano Franck, 613, Fortaleza, CE, Brasil";

formulario.addEventListener("submit", async function (event) {
  event.preventDefault();

  const cep = cepInput.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    resultado.innerHTML = "<p>Digite um CEP válido.</p>";
    return;
  }

  resultado.innerHTML = "<p>Calculando...</p>";

  try {
    // CONSULTA O CEP
    const respostaCep = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    const dadosCep = await respostaCep.json();

    if (dadosCep.erro) {
      resultado.innerHTML = "<p>CEP não encontrado.</p>";
      return;
    }

    // Monta o endereço completo
    const endereco = `
            ${dadosCep.logradouro},
            ${dadosCep.bairro},
            ${dadosCep.localidade},
            ${dadosCep.uf},
            Brasil
        `;

    // LOCALIZA A ORIGEM
    const respostaOrigem = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(origem)}`,
    );

    const dadosOrigem = await respostaOrigem.json();

    if (dadosOrigem.length === 0) {
      resultado.innerHTML = `
                <p>Não foi possível localizar a UNINASSAU.</p>
            `;
      return;
    }

    // LOCALIZA O DESTINO
    const respostaDestino = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(endereco)}`,
    );

    const dadosDestino = await respostaDestino.json();

    if (dadosDestino.length === 0) {
      // Segunda tentativa usando somente cidade, bairro e CEP
      const buscaAlternativa = `
                ${dadosCep.bairro},
                ${dadosCep.localidade},
                ${dadosCep.uf},
                ${cep},
                Brasil
            `;

      const respostaAlternativa = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(buscaAlternativa)}`,
      );

      const dadosAlternativa = await respostaAlternativa.json();

      if (dadosAlternativa.length === 0) {
        resultado.innerHTML = `
                    <p>
                        O CEP foi encontrado, mas não foi possível
                        localizar o endereço no mapa.
                    </p>
                `;
        return;
      }

      dadosDestino.push(dadosAlternativa[0]);
    }

    // COORDENADAS
    const origemLat = dadosOrigem[0].lat;
    const origemLon = dadosOrigem[0].lon;

    const destinoLat = dadosDestino[0].lat;
    const destinoLon = dadosDestino[0].lon;

    // CALCULA A ROTA
    const respostaRota = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origemLon},${origemLat};${destinoLon},${destinoLat}?overview=false`,
    );

    const dadosRota = await respostaRota.json();

    if (dadosRota.code !== "Ok") {
      resultado.innerHTML = `
                <p>Não foi possível calcular a distância.</p>
            `;
      return;
    }

    // DISTÂNCIA EM KM
    const distanciaKm = dadosRota.routes[0].distance / 1000;

    // VALOR ESTIMADO DO UBER MOTO
    const taxaInicial = 5;
    const valorPorKm = 2;

    const precoUberMoto = taxaInicial + distanciaKm * valorPorKm;

    resultado.innerHTML = `
            <h3>Resultado</h3>

            <p>
                <strong>Destino:</strong><br>
                ${dadosCep.logradouro}, ${dadosCep.bairro}<br>
                ${dadosCep.localidade} - ${dadosCep.uf}
            </p>

            <p>
                <strong>CEP:</strong> ${cep}
            </p>

            <p>
                <strong>Distância:</strong>
                ${distanciaKm.toFixed(2)} km
            </p>

            <p>
                <strong>Uber Moto estimado:</strong>
                R$ ${precoUberMoto.toFixed(2).replace(".", ",")}
            </p>

            <p class="preco">
                Frete: R$ ${precoUberMoto.toFixed(2).replace(".", ",")}
            </p>
        `;
  } catch (erro) {
    console.error(erro);

    resultado.innerHTML = `
            <p>
                Erro ao consultar as APIs.
                Verifique sua conexão e tente novamente.
            </p>
        `;
  }
});
