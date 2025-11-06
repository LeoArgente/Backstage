/**
 * Sistema de navegação e funcionalidades da página de configurações
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== Navegação entre seções =====
  const navItems = document.querySelectorAll('.settings-nav-item');
  const sections = document.querySelectorAll('.settings-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.dataset.section;

      // Remover active de todos
      navItems.forEach(nav => nav.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));

      // Adicionar active ao clicado
      item.classList.add('active');
      const targetSection = document.getElementById(`section-${sectionId}`);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      // Scroll suave para o topo da seção
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });

  // ===== Preview de foto de perfil =====
  const fotoInput = document.getElementById('foto_perfil');
  const fotoPreview = document.getElementById('foto-preview');
  const btnRemoverFotoContainer = document.querySelector('.profile-photo-actions');

  if (fotoInput && fotoPreview) {
    fotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];

      if (file) {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecione apenas arquivos de imagem.');
          fotoInput.value = '';
          return;
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('A imagem deve ter no máximo 5MB.');
          fotoInput.value = '';
          return;
        }

        // Criar preview
        const reader = new FileReader();
        reader.onload = (event) => {
          // Atualizar a imagem de preview
          if (fotoPreview.tagName === 'IMG') {
            fotoPreview.src = event.target.result;
          }

          // Mostrar botão de remover se ainda não existir
          const existingBtn = document.getElementById('btn-remover-foto');
          if (!existingBtn && btnRemoverFotoContainer) {
            const removerBtn = document.createElement('button');
            removerBtn.type = 'button';
            removerBtn.className = 'btn btn-danger';
            removerBtn.id = 'btn-remover-foto';
            removerBtn.textContent = 'Remover Foto';

            // Adicionar event listener ao novo botão
            removerBtn.addEventListener('click', handleRemoverFoto);

            // Inserir antes do span de ajuda
            const helpText = btnRemoverFotoContainer.querySelector('.form-help');
            btnRemoverFotoContainer.insertBefore(removerBtn, helpText);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ===== Função para remover foto de perfil =====
  function handleRemoverFoto() {
    if (confirm('Tem certeza que deseja remover sua foto de perfil?')) {
      // Criar formulário para enviar a requisição de remoção
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = window.location.href;

      // Adicionar CSRF token
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'csrfmiddlewaretoken';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);

      // Adicionar campo secao
      const secaoInput = document.createElement('input');
      secaoInput.type = 'hidden';
      secaoInput.name = 'secao';
      secaoInput.value = 'perfil';
      form.appendChild(secaoInput);

      // Adicionar campo remover_foto
      const removerInput = document.createElement('input');
      removerInput.type = 'hidden';
      removerInput.name = 'remover_foto';
      removerInput.value = 'true';
      form.appendChild(removerInput);

      // Enviar formulário
      document.body.appendChild(form);
      form.submit();
    }
  }

  // Aplicar evento ao botão de remover se ele existir na página
  const btnRemoverFoto = document.getElementById('btn-remover-foto');
  if (btnRemoverFoto) {
    btnRemoverFoto.addEventListener('click', handleRemoverFoto);
  }

  // ===== Contador de caracteres para bio =====
  const bioTextarea = document.getElementById('bio');
  if (bioTextarea) {
    const maxLength = bioTextarea.getAttribute('maxlength');
    const formHelp = bioTextarea.nextElementSibling;

    bioTextarea.addEventListener('input', () => {
      const currentLength = bioTextarea.value.length;
      formHelp.textContent = `${currentLength}/${maxLength} caracteres`;
    });

    // Inicializar contador
    const currentLength = bioTextarea.value.length;
    if (currentLength > 0) {
      formHelp.textContent = `${currentLength}/${maxLength} caracteres`;
    }
  }

  // ===== Formatação automática do código =====
  const codigoInput = document.getElementById('codigo');
  if (codigoInput) {
    codigoInput.addEventListener('input', (e) => {
      let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

      // Formatar como XXXX-XXXX-XXXX
      if (value.length > 0) {
        const parts = [];
        for (let i = 0; i < value.length; i += 4) {
          parts.push(value.substr(i, 4));
        }
        value = parts.join('-');
      }

      e.target.value = value;
    });
  }

  // ===== Auto-hide de mensagens =====
  const messages = document.querySelectorAll('.message');
  messages.forEach(message => {
    setTimeout(() => {
      message.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => {
        message.remove();
      }, 300);
    }, 5000);
  });

  // ===== Validação de formulários =====
  const forms = document.querySelectorAll('.settings-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const secao = form.querySelector('[name="secao"]').value;

      if (secao === 'conta') {
        const username = form.querySelector('[name="username"]').value.trim();
        const email = form.querySelector('[name="email"]').value.trim();

        if (!username) {
          e.preventDefault();
          alert('Nome de usuário é obrigatório.');
          return;
        }

        if (!email) {
          e.preventDefault();
          alert('Email é obrigatório.');
          return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          e.preventDefault();
          alert('Por favor, insira um email válido.');
          return;
        }
      }

      if (secao === 'perfil') {
        const instagram = form.querySelector('[name="instagram"]').value.trim();
        const twitter = form.querySelector('[name="twitter"]').value.trim();

        // Validar URLs de redes sociais
        const urlRegex = /^https?:\/\/.+/;

        if (instagram && !urlRegex.test(instagram)) {
          e.preventDefault();
          alert('Por favor, insira uma URL válida para o Instagram (deve começar com http:// ou https://).');
          return;
        }

        if (twitter && !urlRegex.test(twitter)) {
          e.preventDefault();
          alert('Por favor, insira uma URL válida para o Twitter (deve começar com http:// ou https://).');
          return;
        }
      }

      if (secao === 'codigo') {
        const codigo = form.querySelector('[name="codigo"]').value.trim();

        if (!codigo) {
          e.preventDefault();
          alert('Por favor, insira um código.');
          return;
        }

        // Validar formato XXXX-XXXX-XXXX
        const codigoRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        if (!codigoRegex.test(codigo)) {
          e.preventDefault();
          alert('O código deve estar no formato XXXX-XXXX-XXXX.');
          return;
        }
      }
    });
  });
});

// Animação de slide out para mensagens
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      transform: translateX(150%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
