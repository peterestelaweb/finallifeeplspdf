// JavaScript para el formulario de contacto - versión independiente
document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Inicializando formulario de contacto...');

    // Manejar checkbox de cliente existente
    const tieneClienteCheckbox = document.getElementById('tieneCliente');
    const clienteInfo = document.getElementById('clienteInfo');

    if (tieneClienteCheckbox && clienteInfo) {
        tieneClienteCheckbox.addEventListener('change', function() {
            if (this.checked) {
                clienteInfo.style.display = 'block';
                clienteInfo.style.opacity = '0';
                clienteInfo.style.transform = 'translateY(-10px)';

                setTimeout(() => {
                    clienteInfo.style.transition = 'all 0.3s ease';
                    clienteInfo.style.opacity = '1';
                    clienteInfo.style.transform = 'translateY(0)';
                }, 10);
            } else {
                clienteInfo.style.transition = 'all 0.3s ease';
                clienteInfo.style.opacity = '0';
                clienteInfo.style.transform = 'translateY(-10px)';

                setTimeout(() => {
                    clienteInfo.style.display = 'none';
                }, 300);
            }
        });
    }

    // Función para mostrar mensajes del formulario
    function showFormMessage(message, type) {
        let formMessage = document.getElementById('formMessage');

        if (!formMessage) {
            formMessage = document.createElement('div');
            formMessage.id = 'formMessage';
            formMessage.className = 'form-message';

            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.appendChild(formMessage);
            }
        }

        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;

        formMessage.style.opacity = '0';
        formMessage.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            formMessage.style.transition = 'all 0.3s ease';
            formMessage.style.opacity = '1';
            formMessage.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            formMessage.style.transition = 'all 0.3s ease';
            formMessage.style.opacity = '0';
            formMessage.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                if (formMessage.parentNode) {
                    formMessage.parentNode.removeChild(formMessage);
                }
            }, 300);
        }, 5000);
    }

    // Función para manejar el envío del formulario
    function handleFormSubmit(form) {
        console.log('📤 Enviando formulario...');

        const submitBtn = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);

        // Deshabilitar botón y mostrar estado de carga
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        // Enviar datos al servidor
        fetch('php/send-contact-direct-sheets.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del servidor:', data);
            if (data.success) {
                showFormMessage('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
                form.reset();
                // Ocultar sección de cliente info
                const clienteInfo = document.getElementById('clienteInfo');
                if (clienteInfo) {
                    clienteInfo.style.display = 'none';
                }
            } else {
                showFormMessage('Error al enviar el mensaje: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            showFormMessage('Error de conexión. Por favor, intenta más tarde.', 'error');
        })
        .finally(() => {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
        });
    }

    // Manejar envío del formulario
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        console.log('✅ Formulario encontrado, añadiendo event listener...');
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Evitar que el evento se propague
            handleFormSubmit(this);
        });
    } else {
        console.error('❌ No se encontró el formulario con id "contactForm"');
    }

    console.log('✅ Formulario de contacto inicializado correctamente');
});