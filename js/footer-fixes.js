/**
 * ARREGLOS DEL FOOTER Y PROBLEMAS VISUALES
 * - Corregir número de teléfono
 * - Eliminar destellos/animaciones molestas
 * - Quitar espacio debajo del footer
 */

console.log('🔧 INICIANDO ARREGLOS DEL FOOTER...');

// ====== CORREGIR TELÉFONOS ======
function corregirTelefonos() {
    console.log('📞 Corrigiendo teléfonos...');

    const telefonoCorrecto = '+34 675 67 51 5';
    const telefonoIncorrecto = '+34 675 67 51 2';
    const telefonoSinEspacios = '+34675675155';
    const whatsappCorrecto = 'https://wa.me/34675675155';

    // Reemplazar en todo el contenido de texto
    document.body.innerHTML = document.body.innerHTML
        .replace(new RegExp(telefonoIncorrecto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), telefonoCorrecto)
        .replace(/\+34\s*675\s*67\s*51\s*2/g, telefonoCorrecto)
        .replace(/34675675152/g, '34675675155');

    // Corregir enlaces de WhatsApp
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
    whatsappLinks.forEach(link => {
        if (link.href.includes('34675675152')) {
            link.href = link.href.replace('34675675152', '34675675155');
            console.log('💬 WhatsApp corregido:', link.href);
        }
    });

    // Corregir texto visible
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.childNodes.length > 0) {
            element.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = node.textContent
                        .replace(/\+34\s*675\s*67\s*51\s*2/g, telefonoCorrecto)
                        .replace(/34675675152/g, '34675675155');
                }
            });
        }
    });

    console.log('✅ Teléfonos corregidos a:', telefonoCorrecto);
}

// ====== ELIMINAR DESTELLOS ======
function eliminarDestellos() {
    console.log('✨ Eliminando animaciones molestas...');

    // Detener animaciones del header
    const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transform"], [class*="animate"], [class*="glow"], [class*="shimmer"]');
    animatedElements.forEach(element => {
        element.style.animation = 'none';
        element.style.transform = 'none';
        element.style.transition = 'none';
    });

    // Desactivar keyframes de animaciones
    const styleSheets = document.styleSheets;
    for (let i = 0; i < styleSheets.length; i++) {
        try {
            const rules = styleSheets[i].cssRules || styleSheets[i].rules;
            for (let j = 0; j < rules.length; j++) {
                const rule = rules[j];
                if (rule.cssText && (rule.cssText.includes('@keyframes') || rule.cssText.includes('animation'))) {
                    if (rule.cssText.includes('shimmer') || rule.cssText.includes('glow') || rule.cssText.includes('pulse')) {
                        try {
                            styleSheets[i].deleteRule(j);
                            j--;
                        } catch (e) {
                            // Ignorar errores de reglas protegidas
                        }
                    }
                }
            }
        } catch (e) {
            // Ignorar errores de cross-origin
        }
    }

    // Añadir CSS para detener animaciones
    const noAnimationStyle = document.createElement('style');
    noAnimationStyle.textContent = `
        *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
        }

        @keyframes shimmer {
            from, to { opacity: 1; }
        }

        @keyframes glow {
            from, to { box-shadow: none; }
        }

        @keyframes pulse {
            from, to { transform: scale(1); }
        }
    `;
    document.head.appendChild(noAnimationStyle);

    console.log('✅ Destellos eliminados');
}

// ====== ARREGLAR ESPACIO FOOTER ======
function arreglarEspacioFooter() {
    console.log('📏 Arreglando espacio del footer...');

    // Encontrar el footer
    const footer = document.querySelector('footer');
    const lastElement = document.body.lastElementChild;

    // Eliminar espacios vacíos al final
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodesToRemove = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim() === '') {
            const rect = node.getBoundingClientRect();
            if (rect.top > window.innerHeight * 0.8) { // Si está en la parte inferior
                textNodesToRemove.push(node);
            }
        }
    }

    textNodesToRemove.forEach(node => {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    });

    // Asegurar que el body termine con el footer
    if (footer && lastElement && lastElement !== footer) {
        // Mover footer al final si no está ya
        if (!footer.nextElementSibling) {
            document.body.appendChild(footer);
        }
    }

    // Añadir CSS para eliminar márgenes inferiores
    const footerStyle = document.createElement('style');
    footerStyle.textContent = `
        body {
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
        }

        html {
            margin: 0 !important;
            padding: 0 !important;
        }

        footer {
            margin-bottom: 0 !important;
        }

        footer * {
            margin-bottom: 0 !important;
        }

        /* Eliminar espacio final */
        body::after {
            display: none !important;
        }

        /* Asegurar que no haya scroll vertical extra */
        html, body {
            height: auto !important;
            min-height: 100vh !important;
        }

        /* Quitar cualquier elemento vacío al final */
        body > :empty {
            display: none !important;
        }
    `;
    document.head.appendChild(footerStyle);

    console.log('✅ Espacio del footer arreglado');
}

// ====== VERIFICAR ARREGLOS ======
function verificarArreglos() {
    console.log('🔍 Verificando arreglos...');

    // Verificar teléfonos
    const telefonos = document.body.textContent.match(/\+34\s*675\s*67\s*51\s*5/g);
    console.log('📞 Teléfonos correctos encontrados:', telefonos ? telefonos.length : 0);

    // Verificar que no haya teléfonos incorrectos
    const telefonosIncorrectos = document.body.textContent.match(/\+34\s*675\s*67\s*51\s*[0-4]/g);
    if (telefonosIncorrectos) {
        console.log('⚠️ Aún hay teléfonos incorrectos:', telefonosIncorrectos);
    } else {
        console.log('✅ No hay teléfonos incorrectos');
    }

    // Verificar WhatsApp
    const whatsappCorrecto = document.querySelector('a[href*="34675675155"]');
    console.log('💬 WhatsApp correcto encontrado:', !!whatsappCorrecto);

    // Verificar altura del body
    const bodyHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;
    console.log(`📏 Altura body: ${bodyHeight}px, Ventana: ${windowHeight}px`);

    console.log('✅ Verificación completada');
}

// ====== INICIALIZAR ======
function inicializarArreglos() {
    console.log('🎯 INICIALIZANDO ARREGLOS DEL FOOTER...');

    // Esperar a que la página cargue completamente
    setTimeout(() => {
        corregirTelefonos();
        eliminarDestellos();
        arreglarEspacioFooter();

        // Verificar después de un tiempo
        setTimeout(verificarArreglos, 1000);

        console.log('🎉 ARREGLOS DEL FOOTER COMPLETADOS');
    }, 500);
}

// ====== INICIO ======
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarArreglos);
} else {
    inicializarArreglos();
}

console.log('🔧 SISTEMA DE ARREGLOS DEL FOOTER CARGADO');