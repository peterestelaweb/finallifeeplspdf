// FIXES INMEDIATOS - EJECUTAR EN CONSOLA
console.log('🚨 APLICANDO FIXES DE EMERGENCIA...');

// 1. Eliminar espacio entre bloques
const searchSection = document.querySelector('.search-section');
const resultsSection = document.querySelector('.results-section');

if (searchSection) {
    searchSection.style.marginBottom = '0px';
    console.log('✅ Search section margin: 0px');
}

if (resultsSection) {
    resultsSection.style.marginTop = '0px';
    console.log('✅ Results section margin: 0px');
}

// 2. Forzar videos a funcionar correctamente
const videos = document.querySelectorAll('.phone-video');
videos.forEach((video, index) => {
    console.log(`🎥 Arreglando video ${index + 1}:`, video.src);

    // Forzar objeto-fit contain para que no se corte
    video.style.objectFit = 'contain';
    video.style.background = '#000';

    // Forzar reproducción
    video.muted = true;
    video.play().catch(e => {
        console.log(`⚠️ Error reproduciendo video ${index + 1}:`, e);

        // Intentar con interacción del usuario
        video.addEventListener('click', () => {
            video.play();
        });
    });

    // Forzar dimensiones
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.display = 'block';
});

// 3. Medir distancia real entre bloques
if (searchSection && resultsSection) {
    const searchRect = searchSection.getBoundingClientRect();
    const resultsRect = resultsSection.getBoundingClientRect();
    const distance = resultsRect.top - searchRect.bottom;

    console.log(`📏 DISTANCIA REAL ENTRE BLOQUES: ${distance}px`);

    if (distance > 20) {
        console.error('❌ HAY DEMASIADO ESPACIO ENTRE BLOQUES!');

        // Forzar espacio cero con estilos en línea
        searchSection.style.marginBottom = '0px';
        searchSection.style.paddingBottom = '15px';
        resultsSection.style.marginTop = '0px';
        resultsSection.style.paddingTop = '15px';

        console.log('🔧 ESPACIO FORZADO A CERO');
    }
}

// 4. Verificar estado de videos
videos.forEach((video, index) => {
    setTimeout(() => {
        console.log(`📹 Video ${index + 1} status:`);
        console.log(`  - Ready State: ${video.readyState}`);
        console.log(`  - Current Time: ${video.currentTime}`);
        console.log(`  - Duration: ${video.duration}`);
        console.log(`  - Paused: ${video.paused}`);
        console.log(`  - Error: ${video.error ? video.error.message : 'None'}`);

        if (video.paused && video.readyState >= 2) {
            video.play().catch(e => console.log(`Play error: ${e}`));
        }
    }, 2000);
});

// 5. Forzar animación del header
const header = document.querySelector('.header');
if (header) {
    const computedStyle = window.getComputedStyle(header);
    console.log('🎨 Header Animation Status:');
    console.log(`  - Animation Name: ${computedStyle.animationName}`);
    console.log(`  - Animation Duration: ${computedStyle.animationDuration}`);
    console.log(`  - Animation Play State: ${computedStyle.animationPlayState}`);

    if (computedStyle.animationName === 'none') {
        console.log('⚠️ Header animation not working - forcing fallback');
        header.style.animation = 'pulse 2s ease-in-out infinite';
    }
}

console.log('✅ FIXES DE EMERGENCIA APLICADOS - VERIFICA LOS CAMBIOS');