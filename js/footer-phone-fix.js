/**
 * ARREGLO ESPECÍFICO PARA TELÉFONO DEL FOOTER
 * - Asegurar que el último dígito "5" sea visible
 */

console.log('📞 INICIANDO ARREGLO ESPECÍFICO DE TELÉFONO...');

// ====== ARREGLO FORZADO DEL TELÉFONO ======
function forzarArregloTelefono() {
    console.log('🔧 Aplicando arreglo forzado al teléfono...');

    // Buscar todos los elementos que contienen el teléfono
    const elementosTelefono = [];
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
              if (node.textContent.includes('+34 675 67 51 5')) {
            elementosTelefono.push(node);
        }
    }

    console.log(`📞 Encontrados ${elementosTelefono.length} elementos con teléfono`);

    // Buscar también en elementos HTML
    const todosElementos = document.querySelectorAll('*');
    todosElementos.forEach(element => {
            if (element.textContent.includes('+34 675 67 51 5') && !elementosTelefono.includes(element)) {
            elementosTelefono.push(element);
        }
    });

    // Aplicar arreglo forzado
    elementosTelefono.forEach(elemento => {
        const parent = elemento.parentNode;

        // Si es un nodo de texto, envolverlo
        if (elemento.nodeType === Node.TEXT_NODE) {
            const span = document.createElement('span');
            span.textContent = elemento.textContent;
            span.style.cssText = `
                white-space: nowrap !important;
                overflow: visible !important;
                text-overflow: clip !important;
                display: inline-block !important;
                min-width: max-content !important;
                max-width: none !important;
                width: max-content !important;
                font-size: inherit !important;
                font-weight: inherit !important;
                color: inherit !important;
            `;

            if (parent) {
                parent.replaceChild(span, elemento);
            }
        } else {
            // Si es un elemento HTML
            elemento.style.whiteSpace = 'nowrap';
            elemento.style.overflow = 'visible';
            elemento.style.textOverflow = 'clip';
            elemento.style.display = 'inline-block';
            elemento.style.minWidth = 'max-content';
            elemento.style.width = 'auto';
        }
    });

    // CSS específico para enlaces de WhatsApp
    const whatsappStyle = document.createElement('style');
    whatsappStyle.id = 'whatsapp-phone-fix';
    whatsappStyle.textContent = `
        /* ARREGLO FORZADO PARA TELÉFONO */
        a[href*="wa.me"],
        a[href*="whatsapp"],
        .phone-link,
        [href*="67567515"],
        [href*="67567"] {
            white-space: nowrap !important;
            overflow: visible !important;
            text-overflow: clip !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            min-width: max-content !important;
            width: auto !important;
            max-width: none !important;
            flex-shrink: 0 !important;
            position: relative !important;
            z-index: 10 !important;
        }

        /* Evitar que se corte en responsive */
        @media (max-width: 768px) {
            a[href*="wa.me"],
            a[href*="whatsapp"],
            .phone-link {
                font-size: 1.1rem !important;
            }
        }

        @media (max-width: 480px) {
            a[href*="wa.me"],
            a[href*="whatsapp"],
            .phone-link {
                font-size: 1rem !important;
            }
        }

        /* Footer específico */
        footer * {
            overflow: visible !important;
            text-overflow: clip !important;
        }

        /* Contenedores del teléfono */
        .contact-info,
        .contact-link {
            white-space: nowrap !important;
            overflow: visible !important;
            display: inline-block !important;
            min-width: max-content !important;
        }
    `;
    document.head.appendChild(whatsappStyle);

    console.log('✅ Arreglo forzado del teléfono aplicado');
}

// ====== VERIFICAR VISUAL ======
function verificarVisibilidadTelefono() {
    console.log('👁️ Verificando visibilidad del teléfono...');

    setTimeout(() => {
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');

        whatsappLinks.forEach((link, index) => {
            const rect = link.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;

            console.log(`WhatsApp ${index + 1}:`, {
                texto: link.textContent.trim(),
                visible: isVisible,
                width: rect.width,
                height: rect.height,
                position: `${rect.left}, ${rect.top}`
            });

            if (!isVisible) {
                console.warn(`⚠️ WhatsApp ${index + 1} no es visible`);
            }
        });

        console.log('✅ Verificación de visibilidad completada');
    }, 1000);
}

// ====== ARRELO RESPONSIVO DEL FOOTER ======
function arreglarFooterResponsive() {
    console.log('📱 Arreglando footer responsive...');

    const footerStyle = document.createElement('style');
    footerStyle.textContent = `
        /* ARREGLO RESPONSIVE FOOTER */
        footer {
            padding-bottom: 0 !important;
            margin-bottom: 0 !important;
            max-width: 100% !important;
            overflow: visible !important;
        }

        footer * {
            overflow: visible !important;
            text-overflow: clip !important;
        }

        /* Links de contacto */
        .contact-links,
        .contact-info {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 20px !important;
            white-space: nowrap !important;
        }

        .contact-links a,
        .contact-info span {
            white-space: nowrap !important;
            overflow: visible !important;
            text-overflow: clip !important;
            display: inline-flex !important;
            align-items: center !important;
            min-width: max-content !important;
        }

        /* Eliminar espacios extra */
        body {
            overflow-x: hidden !important;
        }

        html, body {
            margin: 0 !important;
            padding: 0 !important;
        }

        /* Asegurar que el footer sea el último elemento */
        body > :last-child {
            margin-bottom: 0 !important;
        }
    `;
    document.head.appendChild(footerStyle);

    console.log('✅ Footer responsive arreglado');
}

// ====== INICIALIZAR ======
function inicializar() {
    console.log('🎯 INICIANDO ARREGLO ESPECÍFICO DE TELÉFONO...');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                forzarArregloTelefono();
                arreglarFooterResponsive();
                verificarVisibilidadTelefono();

                console.log('🎉 ARREGLO ESPECÍFICO DE TELÉFONO INICIALIZADO');
            }, 500);
        });
    } else {
        setTimeout(() => {
            forzarArregloTelefono();
            arreglarFooterResponsive();
            verificarVisibilidadTelefono();

            console.log('🎉 ARREGLO ESPECÍFICO DE TELÉFONO INICIALIZADO');
        }, 500);
    }
}

// ====== INICIO ======
inicializar();

console.log('📞 SISTEMA DE ARREGLO DE TELÉFONO CARGADO');