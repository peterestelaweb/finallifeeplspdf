/**
 * FIX FINAL - Conexión entre auto-search-engine y search.js
 * Resuelve el problema de window.localSearchEngine
 */

console.log('🔧 Aplicando fix final para búsqueda...');

// Función para conectar los sistemas
function conectarSistemas() {
    // Si autoSearchEngine existe pero localSearchEngine no, crearlo
    if (window.autoSearchEngine && !window.localSearchEngine) {
        console.log('🔗 Creando localSearchEngine desde autoSearchEngine...');

        window.localSearchEngine = {
            data: window.autoSearchEngine.data || { pdfs: [] },
            search: function(query, options = {}) {
                console.log('🔍 Búsqueda local:', query);
                return window.autoSearchEngine.search(query, options);
            }
        };

        console.log('✅ localSearchEngine creado con éxito');
        console.log('📄 PDFs disponibles:', window.localSearchEngine.data.pdfs.length);

        // Disparar evento para que search.js continúe
        if (window.dispatchEvent) {
            window.dispatchEvent(new Event('localSearchEngineLoaded'));
            console.log('📡 Evento localSearchEngineLoaded disparado');
        }

        return true;
    }

    return false;
}

// Intentar conectar inmediatamente
if (!conectarSistemas()) {
    console.log('⏳ Esperando autoSearchEngine...');

    // Si no funciona, esperar y reintentar
    let intentos = 0;
    const intervalo = setInterval(() => {
        intentos++;
        console.log(`🔄 Intento ${intentos} de conexión...`);

        if (conectarSistemas() || intentos >= 10) {
            clearInterval(intervalo);
            if (intentos >= 10) {
                console.error('❌ No se pudo conectar después de 10 intentos');
            }
        }
    }, 1000);
}

// También conectar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(conectarSistemas, 500);
});

console.log('🎯 Fix final cargado');