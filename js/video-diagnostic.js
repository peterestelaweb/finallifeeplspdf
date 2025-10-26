// DIAGNÓSTICO VISUAL DE PROBLEMAS DE VIDEOS Y LAYOUT
// ====================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Iniciando diagnóstico visual...');

    // Función para medir y reportar espaciado entre elementos
    function medirEspaciado() {
        console.log('\n📏 ANÁLISIS DE ESPACIADO:');

        // Medir espaciado entre header y search
        const header = document.querySelector('.header');
        const searchSection = document.querySelector('.search-section');
        const resultsSection = document.querySelector('.results-section');

        if (header && searchSection) {
            const headerBottom = header.getBoundingClientRect().bottom;
            const searchTop = searchSection.getBoundingClientRect().top;
            const espaciadoHeaderSearch = Math.abs(searchTop - headerBottom);
            console.log(`📐 Espacio Header-Search: ${espaciadoHeaderSearch}px`);

            if (espaciadoHeaderSearch < 10) {
                console.warn('⚠️ Posible solapamiento entre header y search');
            }
        }

        if (searchSection && resultsSection) {
            const searchBottom = searchSection.getBoundingClientRect().bottom;
            const resultsTop = resultsSection.getBoundingClientRect().top;
            const espaciadoSearchResults = Math.abs(resultsTop - searchBottom);
            console.log(`📐 Espacio Search-Results: ${espaciadoSearchResults}px`);

            if (espaciadoSearchResults < 0) {
                console.error('❌ SOLAPAMIENTO DETECTADO entre search y results');
            } else if (espaciadoSearchResults > 50) {
                console.warn('⚠️ Espacio excesivo entre search y results');
            }
        }
    }

    // Función para analizar videos en phone frames
    function analizarVideos() {
        console.log('\n📱 ANÁLISIS DE VIDEOS EN PHONE FRAMES:');

        const phoneVideos = document.querySelectorAll('.phone-video');
        const phoneFrames = document.querySelectorAll('.phone-frame');
        const phoneScreens = document.querySelectorAll('.phone-screen');

        phoneVideos.forEach((video, index) => {
            console.log(`\n🎬 Video ${index + 1}:`);

            // Dimensiones del video
            const videoRect = video.getBoundingClientRect();
            console.log(`   - Dimensiones video: ${videoRect.width}x${videoRect.height}px`);

            // Dimensiones del contenedor
            const screen = video.closest('.phone-screen');
            if (screen) {
                const screenRect = screen.getBoundingClientRect();
                console.log(`   - Dimensiones pantalla: ${screenRect.width}x${screenRect.height}px`);

                // Verificar si hay bordes negros
                const widthDiff = screenRect.width - videoRect.width;
                const heightDiff = screenRect.height - videoRect.height;

                if (widthDiff > 5 || heightDiff > 5) {
                    console.warn(`⚠️ Posibles bordes negros detectados:`);
                    console.warn(`   - Diferencia horizontal: ${widthDiff}px`);
                    console.warn(`   - Diferencia vertical: ${heightDiff}px`);
                }

                // Verificar centrado
                const videoLeft = videoRect.left - screenRect.left;
                const videoTop = videoRect.top - screenRect.top;
                const expectedLeft = (screenRect.width - videoRect.width) / 2;
                const expectedTop = (screenRect.height - videoRect.height) / 2;

                if (Math.abs(videoLeft - expectedLeft) > 2) {
                    console.warn(`⚠️ Video no centrado horizontalmente. Actual: ${videoLeft}px, Esperado: ${expectedLeft}px`);
                }

                if (Math.abs(videoTop - expectedTop) > 2) {
                    console.warn(`⚠️ Video no centrado verticalmente. Actual: ${videoTop}px, Esperado: ${expectedTop}px`);
                }
            }

            // Verificar si el video está cargado y reproduciendo
            if (video.readyState >= 2) {
                console.log(`✅ Video cargado correctamente`);
                console.log(`   - Duración: ${video.duration}s`);
                console.log(`   - Estado: ${video.paused ? 'Pausado' : 'Reproduciendo'}`);
                console.log(`   - Muted: ${video.muted}`);
            } else {
                console.warn(`⚠️ Video no completamente cargado (readyState: ${video.readyState})`);
            }
        });
    }

    // Función para analizar header animation
    function analizarHeader() {
        console.log('\n🌈 ANÁLISIS DE HEADER ANIMATION:');

        const header = document.querySelector('.header');
        if (header) {
            const headerRect = header.getBoundingClientRect();
            console.log(`📐 Dimensiones header: ${headerRect.width}x${headerRect.height}px`);

            // Verificar animación CSS
            const computedStyle = window.getComputedStyle(header);
            const animationName = computedStyle.animationName;
            const animationDuration = computedStyle.animationDuration;

            if (animationName && animationName !== 'none') {
                console.log(`✅ Animación detectada: ${animationName} (${animationDuration})`);
            } else {
                console.warn(`⚠️ Sin animación detectada en header`);
            }

            // Verificar visibilidad del contenido
            const headerContent = header.querySelector('.header-content');
            if (headerContent) {
                const contentRect = headerContent.getBoundingClientRect();
                const contentOpacity = window.getComputedStyle(headerContent).opacity;
                console.log(`👁️ Opacidad del contenido: ${contentOpacity}`);

                if (parseFloat(contentOpacity) < 0.8) {
                    console.warn(`⚠️ Contenido del header puede ser difícil de ver (opacidad: ${contentOpacity})`);
                }
            }
        }
    }

    // Función para añadir overlay visual de diagnóstico
    function crearOverlayDiagnostico() {
        console.log('\n🎨 Creando overlay de diagnóstico visual...');

        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'diagnostic-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 99999;
            max-width: 300px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
        `;

        // Añadir información de diagnóstico
        let diagnosticInfo = '<h3>🔍 DIAGNÓSTICO VISUAL</h3>';
        diagnosticInfo += '<p>Presiona F12 para ver detalles en consola</p>';
        diagnosticInfo += '<button onclick="ejecutarDiagnosticoCompleto()" style="background: #4CAF50; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; margin-top: 10px;">Ejecutar diagnóstico completo</button>';
        diagnosticInfo += '<button onclick="cerrarDiagnostico()" style="background: #f44336; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; margin-top: 5px; margin-left: 5px;">Cerrar</button>';

        overlay.innerHTML = diagnosticInfo;
        document.body.appendChild(overlay);

        // Hacer funciones globales
        window.ejecutarDiagnosticoCompleto = function() {
            medirEspaciado();
            analizarVideos();
            analizarHeader();
            console.log('\n✅ Diagnóstico completado. Revisa la consola para detalles.');
        };

        window.cerrarDiagnostico = function() {
            const overlay = document.getElementById('diagnostic-overlay');
            if (overlay) overlay.remove();
        };
    }

    // Función para resaltar problemas visualmente
    function resaltarProblemas() {
        console.log('\n🎨 Resaltando problemas visuales...');

        // Resaltar espaciado problemático
        const searchSection = document.querySelector('.search-section');
        const resultsSection = document.querySelector('.results-section');

        if (searchSection && resultsSection) {
            const searchBottom = searchSection.getBoundingClientRect().bottom;
            const resultsTop = resultsSection.getBoundingClientRect().top;
            const espaciado = resultsTop - searchBottom;

            if (espaciado < 0) {
                // Solapamiento - añadir borde rojo
                searchSection.style.borderBottom = '3px solid red';
                resultsSection.style.borderTop = '3px solid red';
                console.warn('❌ Solapamiento detectado y resaltado en rojo');
            } else if (espaciado > 50) {
                // Espacio excesivo - añadir borde amarillo
                searchSection.style.borderBottom = '3px solid yellow';
                resultsSection.style.borderTop = '3px solid yellow';
                console.warn('⚠️ Espacio excesivo resaltado en amarillo');
            }
        }

        // Resaltar problemas de videos
        const phoneVideos = document.querySelectorAll('.phone-video');
        phoneVideos.forEach((video, index) => {
            const screen = video.closest('.phone-screen');
            if (screen) {
                const videoRect = video.getBoundingClientRect();
                const screenRect = screen.getBoundingClientRect();

                const widthDiff = screenRect.width - videoRect.width;
                const heightDiff = screenRect.height - videoRect.height;

                if (widthDiff > 10 || heightDiff > 10) {
                    // Posibles bordes negros - añadir borde naranja
                    video.style.border = '2px solid orange';
                    console.warn(`⚠️ Video ${index + 1} con posibles bordes negros resaltado en naranja`);
                }
            }
        });
    }

    // Ejecutar diagnóstico automático
    setTimeout(function() {
        medirEspaciado();
        analizarVideos();
        analizarHeader();
        resaltarProblemas();
        crearOverlayDiagnostico();

        console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
        console.log('💡 Revisa los bordes de colores en la página:');
        console.log('   🔴 Rojo: Solapamiento detectado');
        console.log('   🟡 Amarillo: Espacio excesivo');
        console.log('   🟠 Naranja: Posibles bordes negros en videos');
        console.log('\n💡 Para más detalles, revisa la consola (F12)');
    }, 2000);

    // Ejecutar diagnóstico al cambiar tamaño de ventana
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            console.log('\n🔄 Cambio de tamaño detectado, re-ejecutando diagnóstico...');
            medirEspaciado();
            analizarVideos();
        }, 500);
    });

    console.log('🔍 Sistema de diagnóstico visual inicializado');
});