const formulario = document.getElementById("formVaga");

formulario.addEventListener("submit", function (event) {
  event.preventDefault();

  const empresa = document.getElementById("empresa").value;
  const vaga = document.getElementById("vaga").value;
  const local = document.getElementById("local").value;
  const descricao = document.getElementById("descricao").value;

  const tabela = document.getElementById("listaVagas");

  const novaLinha = document.createElement("tr");

  novaLinha.innerHTML = `
        <td>${empresa}</td>
        <td>${vaga}</td>
        <td>${local}</td>
        <td>${descricao}</td>
        <td>
            <button class="remover">Remover</button>
        </td>
    `;

  tabela.appendChild(novaLinha);

  formulario.reset();
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("remover")) {
    event.target.parentElement.parentElement.remove();
  }
});
