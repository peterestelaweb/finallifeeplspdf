/**
 * Detector de Android y optimizador de rendimiento
 * Aplica fixes específicos para Android que no funcionan bien en iOS
 */

(function() {
    'use strict';

    // Detectar si es Android
    function isAndroid() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /android/i.test(userAgent);
    }

    // Detectar si es iOS
    function isIOS() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/i.test(userAgent);
    }

    // Detectar si es Chrome en Android
    function isAndroidChrome() {
        return isAndroid() && /chrome/i.test(navigator.userAgent);
    }

    // Detectar si es Samsung Browser
    function isSamsungBrowser() {
        return /samsungbrowser/i.test(navigator.userAgent);
    }

    // Aplicar configuración específica para Android
    function configureAndroid() {
        console.log('🤖 Android detectado - Aplicando optimizaciones específicas...');

        // Añadir atributo data-android al HTML
        document.documentElement.setAttribute('data-android', 'true');

        // Reducir calidad de partículas
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            if (index > 10) { // Mantener solo 10 partículas
                particle.style.display = 'none';
            } else {
                // Reducir animación
                particle.style.animationDuration = '8s';
                particle.style.opacity = '0.3';
            }
        });

        // Desactivar animaciones de ondas complejas
        const waves = document.querySelectorAll('.wave');
        waves.forEach((wave, index) => {
            wave.style.animation = 'none';
            wave.style.transform = 'translateY(0)';
            wave.style.opacity = 0.1 + (index * 0.05);
        });

        // Optimizar renderizado de búsqueda
        if (window.PDFSearchApp) {
            const originalRenderResults = window.PDFSearchApp.renderResults.bind(window.PDFSearchApp);
            window.PDFSearchApp.renderResults = function() {
                requestAnimationFrame(() => {
                    originalRenderResults();
                });
            };
        }

        // Reducir frecuencia de actualización de estadísticas
        const statsElements = ['totalDocs', 'totalSize', 'lastUpdate'];
        statsElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.transition = 'none';
            }
        });

        // Prevenir zoom en input (problema común en Android)
        const inputs = document.querySelectorAll('input[type="text"], textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width,initial-scale=1,maximum-scale=1.0, user-scalable=0');
            });
            input.addEventListener('blur', function() {
                document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0');
            });
        });

        // Optimizar scroll performance
        let ticking = false;
        function updateScrollPosition() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    ticking = false;
                });
                ticking = true;
            }
        }
        window.addEventListener('scroll', updateScrollPosition);

        console.log('✅ Optimizaciones para Android aplicadas');
    }

    // Aplicar configuración para iOS (mantener animaciones)
    function configureIOS() {
        console.log('🍎 iOS detectado - Manteniendo animaciones completas...');
        document.documentElement.setAttribute('data-ios', 'true');
    }

    // Configuración para desktop
    function configureDesktop() {
        console.log('💻 Desktop detectado - Aplicando configuración estándar...');
        document.documentElement.setAttribute('data-desktop', 'true');
    }

    // Función principal de detección
    function detectAndConfigure() {
        if (isAndroid()) {
            configureAndroid();

            // Detección específica del navegador Android
            if (isAndroidChrome()) {
                console.log('🌐 Android Chrome detectado');
                document.documentElement.setAttribute('data-browser', 'android-chrome');
            } else if (isSamsungBrowser()) {
                console.log('📱 Samsung Browser detectado - Aplicando fixes adicionales');
                document.documentElement.setAttribute('data-browser', 'samsung');
                // Fixes adicionales para Samsung Browser
                document.body.style.transform = 'translateZ(0)';
            } else {
                console.log('🔍 Otro navegador Android detectado');
                document.documentElement.setAttribute('data-browser', 'android-other');
            }
        } else if (isIOS()) {
            configureIOS();
        } else {
            configureDesktop();
        }
    }

    // Detectar problemas de rendimiento
    function monitorPerformance() {
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = performance.memory.usedJSHeapSize / 1048576; // MB
                if (memory > 100) { // Si usa más de 100MB
                    console.warn(`⚠️ Alta memoria usada: ${memory.toFixed(2)}MB - Aplicando optimizaciones`);

                    // Reducir partículas aún más
                    const particles = document.querySelectorAll('.particle');
                    particles.forEach((particle, index) => {
                        if (index > 5) {
                            particle.style.display = 'none';
                        }
                    });
                }
            }, 5000);
        }
    }

    // Detectar layout shifts
    function detectLayoutShifts() {
        if (window.PerformanceObserver) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput && entry.value > 0.1) {
                        console.warn(`⚠️ Layout shift detectado: ${entry.value.toFixed(3)}`);
                        // Aplicar correcciones
                        document.body.style.willChange = 'auto';
                    }
                }
            });
            observer.observe({entryTypes: ['layout-shift']});
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectAndConfigure);
    } else {
        detectAndConfigure();
    }

    // Monitoreo de rendimiento
    setTimeout(() => {
        monitorPerformance();
        detectLayoutShifts();
    }, 2000);

    // Exponer funciones globalmente para debugging
    window.AndroidDetector = {
        isAndroid,
        isIOS,
        isAndroidChrome,
        isSamsungBrowser,
        detectAndConfigure
    };

})();