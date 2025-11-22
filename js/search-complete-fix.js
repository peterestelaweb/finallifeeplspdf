/**
 * SOLUCIÓN COMPLETA - Búsqueda y Layout
 * Arregla búsqueda, videos, layout y responsive
 */

console.log('🚀 Iniciando solución completa...');

// ====== ARREGLO DE BÚSQUEDA ======
function arreglarBusqueda() {
    console.log('🔧 Arreglando sistema de búsqueda...');

    // Esperar a que autoSearchEngine esté disponible
    let intentos = 0;
    const checkInterval = setInterval(() => {
        intentos++;

        if (window.autoSearchEngine && window.autoSearchEngine.data) {
            clearInterval(checkInterval);

            // Crear localSearchEngine compatible
            window.localSearchEngine = {
                data: window.autoSearchEngine.data,
                search: function(query, options = {}) {
                    // Arreglar el problema de keywords
                    const dataWithFixedKeywords = {
                        ...this.data,
                        pdfs: this.data.pdfs.map(pdf => ({
                            ...pdf,
                            keywords: Array.isArray(pdf.keywords) ? pdf.keywords : [],
                            tags: Array.isArray(pdf.tags) ? pdf.tags : []
                        }))
                    };

                    return window.autoSearchEngine.search.call(window.autoSearchEngine, query, options);
                }
            };

            // Crear performSearch robusto
            window.performSearch = function(query) {
                try {
                    const results = window.localSearchEngine.search(query, { fuzzy: true, limit: 50 });
                    console.log(`🔍 Búsqueda "${query}": ${results.length} resultados`);
                    return results;
                } catch (error) {
                    console.error('❌ Error en búsqueda:', error);
                    return [];
                }
            };

            // Disparar eventos
            window.dispatchEvent(new Event('localSearchEngineLoaded'));

            // Forzar actualización de estadísticas
            actualizarEstadisticas();

            console.log('✅ Búsqueda arreglada con éxito');

        } else if (intentos > 10) {
            clearInterval(checkInterval);
            console.error('❌ No se pudo arreglar la búsqueda');
        }
    }, 500);
}

// ====== ACTUALIZAR ESTADÍSTICAS ======
function actualizarEstadisticas() {
    const totalDocs = document.getElementById('totalDocs');
    const totalSize = document.getElementById('totalSize');
    const lastUpdate = document.getElementById('lastUpdate');

    if (window.localSearchEngine && window.localSearchEngine.data) {
        const pdfs = window.localSearchEngine.data.pdfs;

        if (totalDocs) totalDocs.textContent = pdfs.length;

        if (totalSize) {
            const totalBytes = pdfs.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0);
            const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
            totalSize.textContent = `${totalMB} MB`;
        }

        if (lastUpdate) {
            const date = new Date().toLocaleDateString('es-ES');
            lastUpdate.textContent = date;
        }

        console.log(`📊 Estadísticas actualizadas: ${pdfs.length} documentos`);
    }
}

// ====== ARREGLO DE LAYOUT ======
function arreglarLayout() {
    console.log('🎨 Arreglando layout...');

    // Crear CSS adicional para arreglar los problemas
    const style = document.createElement('style');
    style.textContent = `
        /* ====== ARREGLOS GENERALES ====== */
        * {
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 1400px !important;
            width: 95% !important;
            margin: 0 auto !important;
            padding: 20px !important;
        }

        /* ====== TIPOGRAFÍA ====== */
        h1 {
            font-size: 2.5rem !important;
            text-align: center !important;
            margin-bottom: 20px !important;
        }

        h2 {
            font-size: 1.8rem !important;
            text-align: center !important;
            margin-bottom: 15px !important;
        }

        h3 {
            font-size: 1.4rem !important;
            margin-bottom: 10px !important;
        }

        p, span, div {
            font-size: 1.1rem !important;
            line-height: 1.6 !important;
        }

        /* ====== SEARCH CONTAINER ====== */
        .search-container {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 20px !important;
            padding: 30px !important;
            margin: 20px 0 !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
            max-width: 100% !important;
        }

        .search-input-group {
            display: flex !important;
            gap: 15px !important;
            margin-bottom: 20px !important;
            flex-wrap: wrap !important;
        }

        .search-input {
            flex: 1 !important;
            min-width: 300px !important;
            padding: 15px 20px !important;
            font-size: 1.2rem !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 15px !important;
            background: white !important;
        }

        .category-filter, .sort-select {
            padding: 15px 20px !important;
            font-size: 1.1rem !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 15px !important;
            background: white !important;
            min-width: 200px !important;
        }

        /* ====== VIDEOS - DOS COLUMNAS ====== */
        .videos-section {
            margin: 40px 0 !important;
        }

        .videos-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)) !important;
            gap: 30px !important;
            max-width: 1200px !important;
            margin: 0 auto !important;
        }

        .video-card {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 20px !important;
            padding: 20px !important;
            box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        }

        .video-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
        }

        .video-wrapper {
            position: relative !important;
            width: 100% !important;
            padding-bottom: 56.25% !important; /* 16:9 aspect ratio */
            border-radius: 15px !important;
            overflow: hidden !important;
        }

        .video-wrapper video {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 15px !important;
        }

        .sound-toggle {
            position: absolute !important;
            bottom: 15px !important;
            right: 15px !important;
            background: rgba(0,0,0,0.7) !important;
            color: white !important;
            border: none !important;
            border-radius: 50% !important;
            width: 40px !important;
            height: 40px !important;
            cursor: pointer !important;
            z-index: 10 !important;
        }

        /* ====== RESULTADOS ====== */
        .results-container {
            max-width: 1200px !important;
            margin: 20px auto !important;
        }

        .result-item {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 15px !important;
            padding: 20px !important;
            margin-bottom: 20px !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
            transition: transform 0.3s ease !important;
        }

        .result-item:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 15px 30px rgba(0,0,0,0.15) !important;
        }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 768px) {
            .container {
                width: 98% !important;
                padding: 15px !important;
            }

            h1 {
                font-size: 2rem !important;
            }

            h2 {
                font-size: 1.5rem !important;
            }

            .search-input-group {
                flex-direction: column !important;
            }

            .search-input {
                min-width: 100% !important;
            }

            .videos-grid {
                grid-template-columns: 1fr !important;
                gap: 20px !important;
            }

            .video-card {
                padding: 15px !important;
            }

            .category-filter, .sort-select {
                min-width: 100% !important;
            }
        }

        @media (max-width: 480px) {
            .container {
                width: 100% !important;
                padding: 10px !important;
            }

            h1 {
                font-size: 1.8rem !important;
            }

            .search-container {
                padding: 20px !important;
            }

            .search-input {
                font-size: 1rem !important;
                padding: 12px 15px !important;
            }
        }

        /* ====== STATS ====== */
        .stats-container {
            display: flex !important;
            justify-content: center !important;
            gap: 30px !important;
            margin: 20px 0 !important;
            flex-wrap: wrap !important;
        }

        .stat-item {
            text-align: center !important;
            background: rgba(255,255,255,0.2) !important;
            padding: 15px 25px !important;
            border-radius: 15px !important;
            backdrop-filter: blur(10px) !important;
        }

        .stat-number {
            font-size: 2rem !important;
            font-weight: bold !important;
            color: white !important;
        }

        .stat-label {
            font-size: 1rem !important;
            color: rgba(255,255,255,0.9) !important;
        }

        /* ====== LOADING ====== */
        .loading-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 9999 !important;
        }

        .loading-content {
            text-align: center !important;
            color: white !important;
        }

        .loading-spinner {
            font-size: 3rem !important;
            margin-bottom: 20px !important;
        }

        .loading-text {
            font-size: 1.5rem !important;
        }
    `;

    document.head.appendChild(style);
    console.log('✅ CSS de layout aplicado');
}

// ====== INICIALIZAR TODO ======
function inicializarTodo() {
    console.log('🎯 Inicializando solución completa...');

    // Ocultar loading si existe
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }

        // Mostrar container
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '1';
            container.style.visibility = 'visible';
        }
    }, 1000);

    // Arreglar búsqueda
    arreglarBusqueda();

    // Arreglar layout
    arreglarLayout();

    // Actualizar estadísticas después de un tiempo
    setTimeout(actualizarEstadisticas, 2000);

    // Probar búsqueda automática
    setTimeout(() => {
        if (window.performSearch) {
            const testResults = window.performSearch('Daily');
            console.log(`🧪 Prueba de búsqueda: ${testResults.length} resultados`);
        }
    }, 3000);
}

// Iniciar cuando DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarTodo);
} else {
    inicializarTodo();
}

console.log('🎉 Solución completa cargada');