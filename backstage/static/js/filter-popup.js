// JS para abrir/fechar o popup de filtro

document.addEventListener('DOMContentLoaded', function() {
  // Mostrar/esconder select de gênero conforme o tipo
  const tipoSelect = document.getElementById('tipoSelect');
  const filtroAno = document.getElementById('filtroAno');
  const filtroGenero = document.getElementById('filtroGenero');

  function updateFields() {
    if (tipoSelect.value === 'genero') {
      filtroGenero.style.display = '';
      filtroAno.style.display = 'none';
    } else if (tipoSelect.value === 'ano') {
      filtroGenero.style.display = 'none';
      filtroAno.style.display = '';
    } else {
      filtroGenero.style.display = 'none';
      filtroAno.style.display = 'none';
    }
  }
  tipoSelect.addEventListener('change', updateFields);
  updateFields();
  const filterBtn = document.getElementById('filterBtn');
  const filterPopup = document.getElementById('filterPopup');

  // Fecha o popup ao clicar fora dele
  window.addEventListener('click', function(e) {
    if (filterPopup.style.display === 'block' && !filterPopup.contains(e.target) && e.target !== filterBtn) {
      filterPopup.style.display = 'none';
    }
  });

  // Abre o popup ao clicar no botão
  filterBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    filterPopup.style.display = 'block';
  });
});
