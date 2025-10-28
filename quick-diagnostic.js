// Diagnóstico rápido de problemas visuales
console.log('🔍 DIAGNÓSTICO RÁPIDO INICIADO');

// 1. Verificar animación del header
const header = document.querySelector('.header');
if (header) {
    const styles = window.getComputedStyle(header);
    console.log('📋 HEADER STYLES:');
    console.log('Animation:', styles.animation);
    console.log('Animation Name:', styles.animationName);
    console.log('Animation Duration:', styles.animationDuration);
    console.log('Animation Play State:', styles.animationPlayState);

    if (styles.animationName === 'none') {
        console.error('❌ ANIMACIÓN DEL HEADER NO ESTÁ ACTIVA');
    } else {
        console.log('✅ Animación del header activa:', styles.animationName);
    }
} else {
    console.error('❌ Header no encontrado');
}

// 2. Verificar videos
const videos = document.querySelectorAll('.phone-video');
console.log(`🎥 Encontrados ${videos.length} videos`);

videos.forEach((video, index) => {
    console.log(`📹 Video ${index + 1}:`);
    console.log('  - Display:', window.getComputedStyle(video).display);
    console.log('  - Position:', window.getComputedStyle(video).position);
    console.log('  - Width:', window.getComputedStyle(video).width);
    console.log('  - Height:', window.getComputedStyle(video).height);
    console.log('  - Object Fit:', window.getComputedStyle(video).objectFit);
    console.log('  - Border Radius:', window.getComputedStyle(video).borderRadius);

    const phoneFrame = video.closest('.phone-frame');
    if (phoneFrame) {
        const frameStyles = window.getComputedStyle(phoneFrame);
        console.log('  - Phone Frame Width:', frameStyles.width);
        console.log('  - Phone Frame Height:', frameStyles.height);
        console.log('  - Phone Frame Display:', frameStyles.display);
    }

    // Verificar si el video se está cargando
    console.log('  - Video Ready State:', video.readyState);
    console.log('  - Video Current Time:', video.currentTime);
    console.log('  - Video Duration:', video.duration);
    console.log('  - Video Error:', video.error);
});

// 3. Verificar mensaje no results
const noResults = document.getElementById('noResults');
if (noResults) {
    console.log('🔍 NO RESULTS:');
    console.log('Display:', window.getComputedStyle(noResults).display);

    const icon = noResults.querySelector('.icon-circle');
    if (icon) {
        const iconStyles = window.getComputedStyle(icon);
        console.log('Icon Animation:', iconStyles.animation);
        console.log('Icon Display:', iconStyles.display);
    }

    const suggestionTags = noResults.querySelectorAll('.suggestion-tag');
    console.log(`Found ${suggestionTags.length} suggestion tags`);
} else {
    console.error('❌ No results element not found');
}

// 4. Verificar si hay errores de CSS
console.log('🎯 ERROres detectados en la consola:');
// Los errores aparecerán automáticamente en la consola

// 5. Forzar visibility de no results para probar
console.log('🧪 MOSTRANDO MENSAJE NO RESULTS TEMPORALMENTE...');
if (noResults) {
    noResults.style.display = 'block';
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
}

console.log('✅ DIAGNÓSTICO COMPLETADO');