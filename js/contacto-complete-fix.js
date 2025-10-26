/**
 * SOLUCIÓN COMPLETA DE CONTACTO
 * - Arreglar footer (teléfono visible)
 * - Agregar campo PIN desplegable
 * - Restaurar sistema de envío original
 */

console.log('🔧 INICIANDO SOLUCIÓN COMPLETA DE CONTACTO...');

// ====== ARREGLAR FOOTER ======
function arreglarFooter() {
    console.log('📱 Arreglando footer...');

    // Buscar todos los elementos de teléfono
    const telefonos = document.querySelectorAll('*');
    telefonos.forEach(element => {
        const text = element.textContent;
        if (text.includes('+34 675 67 51 5')) {
            // Asegurar que se vea completamente
            element.style.whiteSpace = 'nowrap';
            element.style.overflow = 'visible';
            element.style.display = 'inline-block';
            element.style.minWidth = 'max-content';
        }
    });

    // Añadir CSS para asegurar visibilidad del teléfono
    const footerStyle = document.createElement('style');
    footerStyle.textContent = `
        a[href*="wa.me"], .phone-link, [href*="whatsapp"] {
            white-space: nowrap !important;
            overflow: visible !important;
            display: inline-block !important;
            min-width: max-content !important;
            text-decoration: none !important;
        }

        .contact-link {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            white-space: nowrap !important;
        }

        footer {
            padding-bottom: 20px !important;
        }

        body {
            overflow-x: hidden !important;
        }
    `;
    document.head.appendChild(footerStyle);

    console.log('✅ Footer arreglado');
}

// ====== CAMPO PIN DESPLEGABLE ======
function configurarCampoPIN() {
    console.log('🔧 Configurando campo PIN...');

    const form = document.getElementById('contactForm');
    if (!form) {
        console.log('❌ Formulario no encontrado');
        return;
    }

    // Buscar checkbox actual
    const checkboxActual = document.getElementById('hasPin');

    // Crear campo PIN si no existe
    let pinField = document.getElementById('pinClienteField');
    if (!pinField) {
        pinField = document.createElement('div');
        pinField.id = 'pinClienteField';
        pinField.style.cssText = `
            display: none;
            margin: 20px 0;
            padding: 20px;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 15px;
            border: 2px solid rgba(102, 126, 234, 0.3);
        `;

        pinField.innerHTML = `
            <label for="pinCliente" style="
                display: block;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
                font-size: 1.1rem;
            ">
                🔑 Número PIN del Cliente *
            </label>
            <input type="text"
                   id="pinCliente"
                   name="pinCliente"
                   placeholder="Introduce tu número PIN de LifePlus"
                   required
                   style="
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 1rem;
                transition: border-color 0.3s;
            ">
            <small style="
                display: block;
                margin-top: 8px;
                color: #666;
                font-size: 0.9rem;
            ">
                Este campo es obligatorio si tienes un número PIN de cliente LifePlus
            </small>
        `;

        // Insertar después del checkbox
        if (checkboxActual) {
            checkboxActual.parentNode.insertBefore(pinField, checkboxActual.nextSibling);
        } else {
            form.appendChild(pinField);
        }

        // Configurar el input para que se vea mejor al enfocar
        const pinInput = pinField.querySelector('#pinCliente');
        if (pinInput) {
            pinInput.addEventListener('focus', () => {
                pinInput.style.borderColor = '#667eea';
                pinInput.style.outline = 'none';
                pinInput.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            });

            pinInput.addEventListener('blur', () => {
                pinInput.style.borderColor = '#e2e8f0';
                pinInput.style.boxShadow = 'none';
            });
        }
    }

    // Configurar checkbox para mostrar/ocultar campo PIN
    const checkbox = document.getElementById('hasPin');
    if (checkbox) {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                pinField.style.display = 'block';
                pinField.querySelector('#pinCliente').required = true;
                console.log('✅ Campo PIN visible y requerido');
            } else {
                pinField.style.display = 'none';
                pinField.querySelector('#pinCliente').required = false;
                pinField.querySelector('#pinCliente').value = '';
                console.log('📝 Campo PIN oculto y no requerido');
            }
        });
    }

    console.log('✅ Campo PIN configurado');
}

// ====== RESTAURAR SISTEMA DE ENVÍO ======
function restaurarFormulario() {
    console.log('📧 Restaurando sistema de envío...');

    const form = document.getElementById('contactForm');
    if (!form) {
        console.error('❌ Formulario no encontrado');
        return;
    }

    // Remover listeners antiguos
    form.removeEventListener('submit', form._originalHandler);

    // Configurar método y acción correctos
    form.method = 'POST';
    form.action = 'https://script.google.com/macros/s/AKfycbyYK7AI7yQNQ1ticJL9d9RpnX2MK7DV0Ohq8D7UfafRMSEq97hu7NoHdnXpohI9vnj51w/exec';

    // Crear función de envío
    const enviarFormulario = async (event) => {
        event.preventDefault();
        console.log('📤 Enviando formulario...');

        // Validar campos
        const nombre = document.querySelector('[name="nombre"]');
        const email = document.querySelector('[name="email"]');
        const motivo = document.querySelector('[name="motivo"]');
        const ayuda = document.querySelector('[name="ayuda"]');
        const checkbox = document.getElementById('hasPin');
        const pinField = document.getElementById('pinCliente');

        let errores = [];

        if (!nombre || !nombre.value.trim()) errores.push('nombre');
        if (!email || !email.value.trim()) errores.push('email');
        if (!motivo || motivo.value === '' || motivo.value === null || motivo.value === undefined) errores.push('motivo');
        if (!ayuda || !ayuda.value.trim()) errores.push('mensaje');

        // Validar PIN si el checkbox está marcado
        if (checkbox && checkbox.checked && (!pinField || !pinField.value.trim())) {
            errores.push('número PIN');
        }

        if (errores.length > 0) {
            mostrarMensaje('Por favor completa los campos requeridos: ' + errores.join(', '), 'error');
            return;
        }

        // Preparar datos
        const datos = {
            token: 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04',
            nombre: nombre.value,
            email: email.value,
            telefono: document.querySelector('[name="telefono"]').value,
            motivo: motivo.value,
            ayuda: ayuda.value,
            tieneCliente: checkbox ? checkbox.checked : false,
            pinCliente: (checkbox && pinField) ? pinField.value : '',
            recomendado: '',
            source: 'web'
        };

        console.log('📋 Datos a enviar:', datos);

        // Mostrar estado de envío
        const submitBtn = form.querySelector('button[type="submit"]');
        const textoOriginal = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            // Enviar usando fetch
            const formData = new FormData();
            Object.entries(datos).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });

            if (response.ok || response.type === 'opaque') {
                mostrarMensaje('✅ ¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
                form.reset();

                // Ocultar campo PIN si está visible
                const pinFieldDiv = document.getElementById('pinClienteField');
                if (pinFieldDiv) {
                    pinFieldDiv.style.display = 'none';
                }
            } else {
                throw new Error('Error en el envío');
            }

        } catch (error) {
            console.error('❌ Error al enviar:', error);

            // Intentar método alternativo (formulario tradicional)
            console.log('🔄 Intentando método alternativo...');

            const tempForm = document.createElement('form');
            tempForm.method = 'POST';
            tempForm.action = form.action;
            tempForm.style.display = 'none';

            Object.entries(datos).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                tempForm.appendChild(input);
            });

            document.body.appendChild(tempForm);
            tempForm.submit();

            setTimeout(() => {
                document.body.removeChild(tempForm);
                mostrarMensaje('✅ ¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
                form.reset();
            }, 2000);
        }

        // Restaurar botón
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = textoOriginal;
        }, 3000);
    };

    // Asignar evento
    form._originalHandler = enviarFormulario;
    form.addEventListener('submit', enviarFormulario);

    console.log('✅ Sistema de envío restaurado');
}

// ====== SISTEMA DE MENSAJES ======
function mostrarMensaje(mensaje, tipo = 'success') {
    // Eliminar mensajes anteriores
    const mensajesAnteriores = document.querySelectorAll('.form-message');
    mensajesAnteriores.forEach(msg => msg.remove());

    const form = document.getElementById('contactForm');
    if (!form) return;

    // Crear mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `form-message ${tipo}`;
    mensajeDiv.style.cssText = `
        padding: 20px;
        margin: 20px 0;
        border-radius: 15px;
        font-weight: 600;
        text-align: center;
        font-size: 1.1rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        animation: slideIn 0.5s ease-out;
        ${tipo === 'success' ?
            'background: linear-gradient(135deg, #48bb78, #38a169); color: white; border: none;' :
            'background: linear-gradient(135deg, #f56565, #e53e3e); color: white; border: none;'
        }
    `;
    mensajeDiv.textContent = mensaje;

    // Insertar mensaje
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.parentNode.insertBefore(mensajeDiv, submitBtn.nextSibling);
    } else {
        form.appendChild(mensajeDiv);
    }

    // Eliminar después de 6 segundos
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => mensajeDiv.remove(), 500);
        }
    }, 6000);

    // Añadir animaciones CSS si no existen
    if (!document.querySelector('#form-message-animations')) {
        const animStyle = document.createElement('style');
        animStyle.id = 'form-message-animations';
        animStyle.textContent = `
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes slideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-20px); opacity: 0; }
            }
        `;
        document.head.appendChild(animStyle);
    }
}

// ====== VERIFICACIÓN ======
function verificarConfiguracion() {
    console.log('🔍 Verificando configuración...');

    setTimeout(() => {
        const form = document.getElementById('contactForm');
        const pinField = document.getElementById('pinClienteField');
        const checkbox = document.getElementById('hasPin');
        const telefonoLinks = document.querySelectorAll('a[href*="wa.me"]');

        console.log({
            formExists: !!form,
            pinFieldExists: !!pinField,
            checkboxExists: !!checkbox,
            telefonoLinksCount: telefonoLinks.length,
            formAction: form?.action,
            formMethod: form?.method
        });

        console.log('✅ Verificación completada');
    }, 1000);
}

// ====== INICIALIZAR ======
function inicializar() {
    console.log('🎯 INICIALIZANDO SOLUCIÓN COMPLETA DE CONTACTO...');

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                arreglarFooter();
                configurarCampoPIN();
                restaurarFormulario();
                verificarConfiguracion();

                console.log('🎉 SOLUCIÓN COMPLETA DE CONTACTO INICIALIZADA');
            }, 500);
        });
    } else {
        setTimeout(() => {
            arreglarFooter();
            configurarCampoPIN();
            restaurarFormulario();
            verificarConfiguracion();

            console.log('🎉 SOLUCIÓN COMPLETA DE CONTACTO INICIALIZADA');
        }, 500);
    }
}

// ====== INICIO ======
inicializar();

console.log('🔧 SOLUCIÓN COMPLETA DE CONTACTO CARGADA');