// Login Page JavaScript - Modal de Cadastro

// Funções globais para controle do modal
window.openSignupModal = function() {
    const modal = document.getElementById('signup-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const input = document.getElementById('signup-username');
            if (input) input.focus();
        }, 100);
    }
};

window.closeSignupModal = function() {
    const modal = document.getElementById('signup-modal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';

    const form = document.getElementById('signup-form');
    if (form) form.reset();

    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input').forEach(el => {
        el.classList.remove('error', 'success');
    });

    const messages = document.getElementById('signup-messages');
    if (messages) messages.innerHTML = '';
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('signup-modal');
    const form = document.getElementById('signup-form');
    const submitBtn = document.getElementById('signup-submit');
    const messages = document.getElementById('signup-messages');

    if (!modal || !form || !submitBtn || !messages) {
        console.error('Elementos do modal não encontrados');
        return;
    }

    // Botões
    const openBtn = document.getElementById('open-signup-btn');
    const closeBtn = document.getElementById('close-signup-btn');
    const cancelBtn = document.getElementById('cancel-signup-btn');

    if (openBtn) openBtn.onclick = window.openSignupModal;
    if (closeBtn) closeBtn.onclick = window.closeSignupModal;
    if (cancelBtn) cancelBtn.onclick = window.closeSignupModal;

    // Fechar clicando fora
    modal.onclick = function(e) {
        if (e.target === modal) window.closeSignupModal();
    };

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            window.closeSignupModal();
        }
    });

    // Utilitários
    function getCookie(name) {
        let value = null;
        if (document.cookie) {
            document.cookie.split(';').forEach(cookie => {
                const parts = cookie.trim().split('=');
                if (parts[0] === name) value = decodeURIComponent(parts[1]);
            });
        }
        return value;
    }

    function showError(fieldName, message) {
        const error = document.getElementById(fieldName + '-error');
        const input = document.getElementById('signup-' + fieldName);
        if (error) error.textContent = message;
        if (input) {
            input.classList.add('error');
            input.classList.remove('success');
        }
    }

    function showSuccess(fieldName) {
        const error = document.getElementById(fieldName + '-error');
        const input = document.getElementById('signup-' + fieldName);
        if (error) error.textContent = '';
        if (input) {
            input.classList.remove('error');
            input.classList.add('success');
        }
    }

    function showMessage(msg, type = 'error') {
        messages.innerHTML = `<div class="${type}-message">${msg}</div>`;
    }

    function clearErrors() {
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input').forEach(el => {
            el.classList.remove('error', 'success');
        });
        messages.innerHTML = '';
    }

    function validate(field, value) {
        switch (field) {
            case 'username':
                if (!value.trim()) {
                    showError('username', 'Nome de usuário é obrigatório');
                    return false;
                }
                if (value.length < 3) {
                    showError('username', 'Mínimo de 3 caracteres');
                    return false;
                }
                showSuccess('username');
                return true;

            case 'email':
                if (!value.trim()) {
                    showError('email', 'Email é obrigatório');
                    return false;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    showError('email', 'Email inválido');
                    return false;
                }
                showSuccess('email');
                return true;

            case 'password1':
                if (!value) {
                    showError('password1', 'Senha é obrigatória');
                    return false;
                }
                if (value.length < 8) {
                    showError('password1', 'Mínimo de 8 caracteres');
                    return false;
                }
                showSuccess('password1');
                const p2 = document.getElementById('signup-password2');
                if (p2 && p2.value) validate('password2', p2.value);
                return true;

            case 'password2':
                const p1 = document.getElementById('signup-password1');
                if (!value) {
                    showError('password2', 'Confirmação obrigatória');
                    return false;
                }
                if (p1 && value !== p1.value) {
                    showError('password2', 'Senhas não coincidem');
                    return false;
                }
                showSuccess('password2');
                return true;

            default:
                return true;
        }
    }

    // Validação em tempo real
    ['username', 'email', 'password1', 'password2'].forEach(field => {
        const input = document.getElementById('signup-' + field);
        if (!input) return;

        input.addEventListener('blur', function() {
            validate(field, this.value);
        });

        input.addEventListener('input', function() {
            if (field === 'username' && this.value.length >= 3) {
                validate(field, this.value);
            } else if (field === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
                validate(field, this.value);
            } else if (field === 'password1' && this.value.length >= 8) {
                validate(field, this.value);
            } else if (field === 'password2' && this.value.length > 0) {
                const p1 = document.getElementById('signup-password1');
                if (p1 && this.value === p1.value) validate(field, this.value);
            }
        });
    });

    // Submissão do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();

        const data = {
            username: document.getElementById('signup-username')?.value.trim() || '',
            email: document.getElementById('signup-email')?.value.trim() || '',
            password1: document.getElementById('signup-password1')?.value || '',
            password2: document.getElementById('signup-password2')?.value || ''
        };

        let valid = true;
        for (let field in data) {
            if (!validate(field, data[field])) valid = false;
        }

        if (!valid) {
            showMessage('Corrija os erros acima');
            return;
        }

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        fetch('/api/registrar/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                showMessage(result.message, 'success');
                setTimeout(() => window.location.href = '/', 1500);
            } else if (result.errors) {
                for (let field in result.errors) {
                    if (field === 'general') {
                        showMessage(result.errors[field]);
                    } else {
                        showError(field, result.errors[field]);
                    }
                }
            }
        })
        .catch(err => {
            console.error('Erro:', err);
            showMessage('Erro de conexão. Tente novamente.');
        })
        .finally(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        });
    });
});
