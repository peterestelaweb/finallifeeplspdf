// Versión para Google Apps Script - funciona en cualquier hosting
console.log('📝 Iniciando formulario de contacto con Google Apps Script...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado, configurando formulario...');

    // Buscar el formulario
    const form = document.getElementById('contactForm');
    if (!form) {
        console.error('❌ Formulario no encontrado');
        return;
    }

    console.log('✅ Formulario encontrado');

    // Configurar el checkbox de cliente
    const clienteCheckbox = document.getElementById('tieneCliente');
    const clienteInfo = document.getElementById('clienteInfo');

    if (clienteCheckbox && clienteInfo) {
        clienteCheckbox.addEventListener('change', function() {
            clienteInfo.style.display = this.checked ? 'block' : 'none';
        });
    }

    // Función para mostrar mensajes
    function mostrarMensaje(mensaje, tipo = 'success') {
        // Eliminar mensajes anteriores
        const mensajesAnteriores = form.querySelectorAll('.form-message');
        mensajesAnteriores.forEach(msg => msg.remove());

        // Crear nuevo mensaje
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `form-message ${tipo}`;
        mensajeDiv.style.cssText = `
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            font-weight: 500;
            ${tipo === 'success' ?
                'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' :
                'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
        `;
        mensajeDiv.textContent = mensaje;

        // Insertar después del botón de enviar
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.parentNode.insertBefore(mensajeDiv, submitBtn.nextSibling);
        } else {
            form.appendChild(mensajeDiv);
        }

        // Eliminar después de 5 segundos
        setTimeout(() => {
            if (mensajeDiv.parentNode) {
                mensajeDiv.remove();
            }
        }, 5000);
    }

    // Función para enviar formulario a Google Apps Script
    function enviarFormulario(event) {
        event.preventDefault();
        console.log('📤 Enviando formulario a Google Apps Script...');

        // Validar campos básicos
        const camposRequeridos = ['nombre', 'email', 'motivo', 'ayuda'];
        let camposFaltantes = [];

        camposRequeridos.forEach(campo => {
            const input = form.querySelector(`[name="${campo}"]`);
            if (!input || !input.value.trim()) {
                camposFaltantes.push(campo);
            }
        });

        if (camposFaltantes.length > 0) {
            mostrarMensaje('Por favor completa todos los campos requeridos: ' + camposFaltantes.join(', '), 'error');
            return;
        }

        // Obtener el botón de envío
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) {
            console.error('❌ Botón de envío no encontrado');
            return;
        }

        // Deshabilitar botón y mostrar estado
        const textoOriginal = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        // Recopilar datos del formulario manualmente para mejor control
        const datos = {
            nombre: form.querySelector('[name="nombre"]').value,
            email: form.querySelector('[name="email"]').value,
            telefono: form.querySelector('[name="telefono"]').value,
            motivo: form.querySelector('[name="motivo"]').value,
            ayuda: form.querySelector('[name="ayuda"]').value,
            tieneCliente: form.querySelector('[name="tieneCliente"]').checked,
            pinCliente: form.querySelector('[name="pinCliente"]').value,
            recomendado: form.querySelector('[name="recomendado"]').value
        };

        console.log('📋 Datos del formulario:', datos);

        // Preparar datos para Google Apps Script (formato que espera el script)
        const datosParaEnviar = {
            token: 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04', // Token de seguridad
            nombre: datos.nombre || '',
            email: datos.email || '',
            telefono: datos.telefono || '',
            motivo: datos.motivo || '',
            ayuda: datos.ayuda || '',
            pinCliente: datos.pinCliente || '',
            recomendado: datos.recomendado || '',
            source: 'web'
        };

        // Depuración: mostrar todos los datos que se enviarán
        console.log('📋 Datos completos para enviar:', datosParaEnviar);

        // URL del Google Apps Script (URL nueva implementación)
        const webhookUrl = 'https://script.google.com/macros/s/AKfycbyYK7AI7yQNQ1ticJL9d9RpnX2MK7DV0Ohq8D7UfafRMSEq97hu7NoHdnXpohI9vnj51w/exec';

        console.log('📡 Enviando a Google Apps Script:', webhookUrl);

        // Enviar usando método POST tradicional (formato form data para Google Apps Script)
        const formData = new FormData();
        Object.entries(datosParaEnviar).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Crear y enviar formulario tradicional
        const tempForm = document.createElement('form');
        tempForm.method = 'POST';
        tempForm.action = webhookUrl;
        tempForm.target = 'hidden-iframe';
        tempForm.style.display = 'none';

        // Añadir campos al formulario
        Object.entries(datosParaEnviar).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            tempForm.appendChild(input);
        });

        // Crear iframe oculto para la respuesta
        let iframe = document.getElementById('hidden-iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'hidden-iframe';
            iframe.name = 'hidden-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }

        // Monitorear carga del iframe para saber cuando se completa
        iframe.onload = function() {
            console.log('✅ Formulario enviado a Google Apps Script');
            mostrarMensaje('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
            form.reset();

            // Ocultar sección de cliente
            if (clienteInfo) {
                clienteInfo.style.display = 'none';
            }

            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = textoOriginal;
        };

        iframe.onerror = function() {
            console.error('❌ Error al enviar formulario');
            mostrarMensaje('Error al enviar el mensaje. Por favor intenta más tarde.', 'error');

            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = textoOriginal;
        };

        // Enviar formulario
        document.body.appendChild(tempForm);
        tempForm.submit();
        document.body.removeChild(tempForm);
    }

    // Asignar evento al formulario
    form.addEventListener('submit', enviarFormulario);

    console.log('✅ Formulario configurado correctamente con Google Apps Script');
});

// Detectar problemas comunes
window.addEventListener('error', function(event) {
    console.error('❌ Error JavaScript:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Promesa rechazada:', event.reason);
});