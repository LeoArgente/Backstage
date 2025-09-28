// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const signupModal = document.getElementById('signup-modal');
    const signupForm = document.getElementById('signup-form');
    const signupSubmit = document.getElementById('signup-submit');
    const signupMessages = document.getElementById('signup-messages');

    // Form inputs
    const usernameInput = document.getElementById('signup-username');
    const emailInput = document.getElementById('signup-email');
    const password1Input = document.getElementById('signup-password1');
    const password2Input = document.getElementById('signup-password2');

    // Error elements
    const usernameError = document.getElementById('username-error');
    const emailError = document.getElementById('email-error');
    const password1Error = document.getElementById('password1-error');
    const password2Error = document.getElementById('password2-error');

    // CSRF Token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Clear errors
    function clearErrors() {
        const errorElements = [usernameError, emailError, password1Error, password2Error];
        const inputElements = [usernameInput, emailInput, password1Input, password2Input];

        errorElements.forEach(el => {
            el.textContent = '';
        });

        inputElements.forEach(el => {
            el.classList.remove('error', 'success');
        });

        signupMessages.innerHTML = '';
    }

    // Show error for specific field
    function showFieldError(fieldName, message) {
        const errorElement = document.getElementById(fieldName + '-error');
        const inputElement = document.getElementById('signup-' + fieldName) ||
                           document.getElementById('signup-' + fieldName.replace('password', 'password'));

        if (errorElement && inputElement) {
            errorElement.textContent = message;
            inputElement.classList.add('error');
            inputElement.classList.remove('success');
        }
    }

    // Show success for specific field
    function showFieldSuccess(fieldName) {
        const errorElement = document.getElementById(fieldName + '-error');
        const inputElement = document.getElementById('signup-' + fieldName) ||
                           document.getElementById('signup-' + fieldName.replace('password', 'password'));

        if (errorElement && inputElement) {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
            inputElement.classList.add('success');
        }
    }

    // Show general message
    function showMessage(message, type = 'error') {
        signupMessages.innerHTML = `
            <div class="${type}-message">
                ${message}
            </div>
        `;
    }

    // Real-time validation
    function validateField(field, value) {
        switch (field) {
            case 'username':
                if (!value.trim()) {
                    showFieldError('username', 'Nome de usuário é obrigatório');
                    return false;
                } else if (value.length < 3) {
                    showFieldError('username', 'Nome de usuário deve ter pelo menos 3 caracteres');
                    return false;
                } else {
                    showFieldSuccess('username');
                    return true;
                }

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) {
                    showFieldError('email', 'Email é obrigatório');
                    return false;
                } else if (!emailRegex.test(value)) {
                    showFieldError('email', 'Digite um email válido');
                    return false;
                } else {
                    showFieldSuccess('email');
                    return true;
                }

            case 'password1':
                if (!value) {
                    showFieldError('password1', 'Senha é obrigatória');
                    return false;
                } else if (value.length < 8) {
                    showFieldError('password1', 'Senha deve ter pelo menos 8 caracteres');
                    return false;
                } else {
                    showFieldSuccess('password1');
                    // Re-validate password2 if it has a value
                    if (password2Input.value) {
                        validateField('password2', password2Input.value);
                    }
                    return true;
                }

            case 'password2':
                if (!value) {
                    showFieldError('password2', 'Confirmação de senha é obrigatória');
                    return false;
                } else if (value !== password1Input.value) {
                    showFieldError('password2', 'As senhas não coincidem');
                    return false;
                } else {
                    showFieldSuccess('password2');
                    return true;
                }

            default:
                return true;
        }
    }

    // Add real-time validation event listeners
    usernameInput.addEventListener('blur', function() {
        validateField('username', this.value);
    });

    usernameInput.addEventListener('input', function() {
        if (this.value.length >= 3) {
            validateField('username', this.value);
        }
    });

    emailInput.addEventListener('blur', function() {
        validateField('email', this.value);
    });

    emailInput.addEventListener('input', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(this.value)) {
            validateField('email', this.value);
        }
    });

    password1Input.addEventListener('blur', function() {
        validateField('password1', this.value);
    });

    password1Input.addEventListener('input', function() {
        if (this.value.length >= 8) {
            validateField('password1', this.value);
        }
    });

    password2Input.addEventListener('blur', function() {
        validateField('password2', this.value);
    });

    password2Input.addEventListener('input', function() {
        if (this.value === password1Input.value && this.value.length > 0) {
            validateField('password2', this.value);
        }
    });

    // Form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        // Get form data
        const formData = {
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            password1: password1Input.value,
            password2: password2Input.value
        };

        // Validate all fields
        let isValid = true;
        Object.keys(formData).forEach(field => {
            if (!validateField(field, formData[field])) {
                isValid = false;
            }
        });

        if (!isValid) {
            showMessage('Por favor, corrija os erros acima.');
            return;
        }

        // Show loading state
        signupSubmit.classList.add('loading');
        signupSubmit.disabled = true;

        // Submit via AJAX
        fetch('/api/registrar/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                // Show field-specific errors
                if (data.errors) {
                    Object.keys(data.errors).forEach(field => {
                        if (field === 'general') {
                            showMessage(data.errors[field]);
                        } else {
                            showFieldError(field, data.errors[field]);
                        }
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Erro de conexão. Tente novamente.');
        })
        .finally(() => {
            signupSubmit.classList.remove('loading');
            signupSubmit.disabled = false;
        });
    });

    // Close modal when clicking outside
    signupModal.addEventListener('click', function(e) {
        if (e.target === signupModal) {
            closeSignupModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && signupModal.classList.contains('active')) {
            closeSignupModal();
        }
    });
});

// Global functions for modal control
function openSignupModal() {
    const modal = document.getElementById('signup-modal');
    modal.classList.add('active');

    // Focus on first input
    setTimeout(() => {
        document.getElementById('signup-username').focus();
    }, 100);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeSignupModal() {
    const modal = document.getElementById('signup-modal');
    modal.classList.remove('active');

    // Clear form
    const form = document.getElementById('signup-form');
    form.reset();

    // Clear errors
    const errorElements = document.querySelectorAll('.field-error');
    errorElements.forEach(el => el.textContent = '');

    const inputElements = document.querySelectorAll('.form-input');
    inputElements.forEach(el => {
        el.classList.remove('error', 'success');
    });

    document.getElementById('signup-messages').innerHTML = '';

    // Restore body scroll
    document.body.style.overflow = '';
}

// Form validation helpers
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isStrongPassword(password) {
    // At least 8 characters
    return password.length >= 8;
}

// Animation helpers
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';

    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;

        element.style.opacity = Math.min(progress / duration, 1);

        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);

    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;

        element.style.opacity = initialOpacity - (initialOpacity * progress / duration);

        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }

    requestAnimationFrame(animate);
}