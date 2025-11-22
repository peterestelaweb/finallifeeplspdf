/**
 * AUTO-FIX SCRIPT - Corrección automática de problemas al cargar la página
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Iniciando auto-fix de problemas...');

    // 1. Corregir colores dinámicamente
    function fixColors() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --primary-color: #00a86b !important;
                --secondary-color: #2d3748 !important;
                --accent-color: #3182ce !important;
            }
            body {
                background-color: #f7fafc !important;
            }
            .header {
                background: linear-gradient(135deg, #00a86b 0%, #38a169 100%) !important;
            }
            .loading-overlay i,
            .loading-overlay p {
                color: #00a86b !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Colores corregidos dinámicamente');
    }

    // 2. Corregir inputs para mobile
    function fixMobileInputs() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], select, textarea');
        inputs.forEach(input => {
            const computedStyle = window.getComputedStyle(input);
            const fontSize = parseInt(computedStyle.fontSize);

            if (fontSize < 16) {
                input.style.fontSize = '16px';
                input.style.minHeight = '44px';
                input.style.padding = '12px';
            }
        });
        console.log(`✅ ${inputs.length} inputs revisados y corregidos`);
    }

    // 3. Corregir scroll horizontal
    function fixHorizontalScroll() {
        // Forzar max-width en containers
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            container.style.maxWidth = '95%';
            container.style.overflowX = 'hidden';
        });

        // Asegurar box-sizing
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            el.style.boxSizing = 'border-box';
        });

        console.log('✅ Scroll horizontal corregido');
    }

    // 4. Corregir sección videos
    function fixVideoSection() {
        const videoSection = document.querySelector('.video-section');
        if (videoSection) {
            videoSection.style.display = 'block';
            videoSection.style.background = 'white';
            videoSection.style.padding = '40px 20px';
            videoSection.style.borderRadius = '15px';

            const videoGrid = videoSection.querySelector('.video-grid');
            if (videoGrid) {
                videoGrid.style.display = 'grid';
                videoGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
                videoGrid.style.gap = '30px';
            }

            console.log('✅ Sección videos corregida');
        }
    }

    // 5. Corregir teléfono footer
    function fixPhoneNumber() {
        const phoneElements = document.querySelectorAll('*');
        phoneElements.forEach(el => {
            if (el.textContent && el.textContent.includes('+34 675 67 51 5')) {
                el.textContent = el.textContent.replace('+34 675 67 51 5', '+34 675 67 51 51');
            }
        });
        console.log('✅ Teléfono footer corregido');
    }

    // 6. Corregir responsive en tiempo real
    function fixResponsive() {
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;

        if (isMobile) {
            // Mobile fixes
            document.body.classList.add('mobile-view');

            if (isSmallMobile) {
                // Small mobile fixes
                document.body.classList.add('small-mobile-view');
            }
        } else {
            document.body.classList.remove('mobile-view', 'small-mobile-view');
        }
    }

    // 7. Forzar visibilidad de elementos importantes
    function ensureElementsVisible() {
        const importantElements = [
            '.search-section',
            '.results-grid',
            '.video-section',
            '.contact-section',
            '.footer'
        ];

        importantElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = element.style.display || 'block';
                element.style.visibility = 'visible';
                element.style.opacity = '1';
            }
        });

        console.log('✅ Visibilidad de elementos asegurada');
    }

    // 8. Detectar y arreglar problemas de formulario
    function fixForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                // Forzar tamaño mínimo en mobile
                if (window.innerWidth <= 768) {
                    input.style.fontSize = '16px';
                    input.style.minHeight = '44px';
                    input.style.padding = '12px';
                }
            });
        });

        console.log('✅ Formularios corregidos');
    }

    // Ejecutar todas las correcciones
    fixColors();
    fixMobileInputs();
    fixHorizontalScroll();
    fixVideoSection();
    fixPhoneNumber();
    fixResponsive();
    ensureElementsVisible();
    fixForms();

    // Listener para cambios de tamaño de ventana
    window.addEventListener('resize', function() {
        fixResponsive();
        fixMobileInputs();
    });

    // Re-ejecutar correcciones después de 1 segundo por si hay carga dinámica
    setTimeout(function() {
        fixMobileInputs();
        fixVideoSection();
        ensureElementsVisible();
        console.log('🔄 Auto-fix completado (segunda pasada)');
    }, 1000);

    console.log('🎉 Auto-fix completado exitosamente');
});