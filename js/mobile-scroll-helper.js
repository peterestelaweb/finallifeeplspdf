// HELPER PARA CORREGIR PROBLEMAS DE SCROLL EN MÓVILES
// ================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Iniciando helper para scroll en móviles...');

    // 1. Detectar dispositivo
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMobile = isAndroid || isIOS;

    if (isMobile) {
        console.log('📱 Dispositivo móvil detectado:', isAndroid ? 'Android' : 'iOS');
        initializeScrollFix();
    }

    function initializeScrollFix() {
        // 2. Corregir comportamiento de scroll
        document.body.style.overscrollBehaviorY = 'auto';
        document.body.style.touchAction = 'pan-y';

        // 3. Prevenir que videos capturen el scroll
        const videos = document.querySelectorAll('.phone-video');
        videos.forEach(video => {
            // Prevenir comportamiento por defecto que podría bloquear el scroll
            video.addEventListener('touchstart', function(e) {
                // Permitir interacción normal con el video
                // pero no bloquear el scroll del documento
            }, { passive: true });

            video.addEventListener('touchmove', function(e) {
                // No prevenir el scroll del documento
            }, { passive: true });
        });

        // 4. Asegurar que phone-mockup no bloquee el scroll
        const phoneMockups = document.querySelectorAll('.phone-mockup, .phone-frame');
        phoneMockups.forEach(mockup => {
            mockup.style.touchAction = 'none';
            mockup.style.pointerEvents = 'auto';
        });

        // 5. Corregir scroll en sección de videos
        const videoSection = document.querySelector('.video-section');
        if (videoSection) {
            videoSection.style.overflow = 'visible';
            videoSection.style.touchAction = 'pan-y';
            videoSection.style.position = 'relative';
        }

        // 6. Botones de sonido - no bloquear scroll
        const soundButtons = document.querySelectorAll('.sound-toggle');
        soundButtons.forEach(button => {
            button.style.touchAction = 'manipulation';
            button.style.pointerEvents = 'auto';
        });

        // 7. Prevenir propagación de eventos que bloqueen scroll
        document.addEventListener('touchmove', function(e) {
            // Permitir scroll normal
        }, { passive: true });

        // 8. Forzar scroll suave
        document.documentElement.style.scrollBehavior = 'smooth';

        // 9. Corrección específica para Android
        if (isAndroid) {
            console.log('🤖 Aplicando correcciones específicas para Android...');

            // Forzar overflow-scrolling
            document.body.style.webkitOverflowScrolling = 'touch';

            // Prevenir transformaciones 3D que puedan interferir
            const animatedElements = document.querySelectorAll('.phone-mockup, .video-card');
            animatedElements.forEach(el => {
                el.style.transform = 'none';
                el.style.transition = 'none';
            });
        }

        // 10. Corrección específica para iOS
        if (isIOS) {
            console.log('🍎 Aplicando correcciones específicas para iOS...');

            // Aceleración de hardware para scroll suave
            const elements = document.querySelectorAll('.video-section, .phone-mockup');
            elements.forEach(el => {
                el.style.webkitTransform = 'translateZ(0)';
                el.style.transform = 'translateZ(0)';
            });
        }

        // 11. Monitorear y corregir problemas de scroll
        let scrollTimeout;
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);

            // Detectar si el scroll está bloqueado
            scrollTimeout = setTimeout(() => {
                const currentScrollY = window.scrollY;
                if (Math.abs(currentScrollY - lastScrollY) < 1) {
                    console.log('⚠️ Scroll detectado como bloqueado, aplicando corrección...');
                    forceScrollCorrection();
                }
                lastScrollY = currentScrollY;
            }, 100);
        }, { passive: true });

        // 12. Función para forzar corrección de scroll
        function forceScrollCorrection() {
            document.body.style.overflowY = 'auto';
            document.body.style.webkitOverflowScrolling = 'touch';
            document.documentElement.style.overflowY = 'auto';

            // Pequeño scroll para reactivar
            window.scrollBy(0, 1);
            setTimeout(() => window.scrollBy(0, -1), 50);
        }

        // 13. Corregir viewport height issues
        function setViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }

        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 100);
        });

        // 14. Prevenir zoom al hacer tap en videos
        videos.forEach(video => {
            video.addEventListener('gesturestart', function(e) {
                e.preventDefault();
            });
        });

        // 15. Debug information
        console.log('✅ Helper de scroll para móviles inicializado');
        console.log('📊 Estadísticas:', {
            videos: videos.length,
            phoneMockups: phoneMockups.length,
            soundButtons: soundButtons.length,
            hasVideoSection: !!videoSection
        });

        // 16. Función de debugging
        if (window.location.search.includes('debug=true')) {
            document.body.classList.add('debug-scroll');

            // Añadir indicadores visuales
            const debugInfo = document.createElement('div');
            debugInfo.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                font-size: 12px;
                z-index: 10000;
                border-radius: 5px;
            `;
            debugInfo.innerHTML = `
                <div>Debug Scroll Info:</div>
                <div>Device: ${isAndroid ? 'Android' : 'iOS'}</div>
                <div>Scroll: ${window.scrollY}px</div>
                <div>Height: ${window.innerHeight}px</div>
            `;
            document.body.appendChild(debugInfo);
        }
    }

    // 17. Corrección para carga dinámica de contenido
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                const newVideos = document.querySelectorAll('.phone-video');
                const newPhoneMockups = document.querySelectorAll('.phone-mockup');

                // Aplicar correcciones a nuevos elementos
                if (isMobile) {
                    newVideos.forEach(video => {
                        video.style.touchAction = 'none';
                        video.style.pointerEvents = 'auto';
                    });

                    newPhoneMockups.forEach(mockup => {
                        mockup.style.touchAction = 'none';
                        mockup.style.pointerEvents = 'auto';
                    });
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});