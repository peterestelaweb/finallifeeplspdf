/**
 * ULTRA SOLUCIÓN DEFINITIVA
 * Layout ultra-ancho y búsqueda simple y directa
 */

console.log('🚀 ULTRA SOLUCIÓN DEFINITIVA CARGANDO...');

// ====== VARIABLES GLOBALES ======
let datosPDFs = [];
let sistemaActivo = false;

// ====== CARGAR DATOS ======
async function cargarDatos() {
    try {
        console.log('📥 Cargando datos...');
        const response = await fetch('data/pdf-index.json');
        const data = await response.json();

        if (data && data.pdfs && Array.isArray(data.pdfs)) {
            datosPDFs = data.pdfs;
            console.log(`✅ ${datosPDFs.length} PDFs cargados`);

            // Corregir datos
            datosPDFs = datosPDFs.map(pdf => ({
                ...pdf,
                keywords: Array.isArray(pdf.keywords) ? pdf.keywords : [],
                tags: Array.isArray(pdf.tags) ? pdf.tags : []
            }));

            // Crear funciones de búsqueda
            crearFuncionesBusqueda();

            // Actualizar estadísticas
            actualizarEstadisticas();

            sistemaActivo = true;
            console.log('🎯 SISTEMA ACTIVO');

            return true;
        }

        throw new Error('Datos inválidos');
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        return false;
    }
}

// ====== CREAR FUNCIONES DE BÚSQUEDA ======
function crearFuncionesBusqueda() {
    // Función de búsqueda simple y directa
    window.performSearch = function(query) {
        if (!query || !query.trim() || !sistemaActivo) {
            return [];
        }

        console.log(`🔍 Buscando: "${query}"`);

        const searchTerm = query.toLowerCase().trim();
        const resultados = datosPDFs.filter(pdf => {
            const texto = [
                pdf.title || '',
                pdf.filename || '',
                pdf.description || '',
                (pdf.keywords || []).join(' '),
                (pdf.tags || []).join(' '),
                pdf.category || ''
            ].join(' ').toLowerCase();

            return texto.includes(searchTerm);
        });

        console.log(`📊 ${resultados.length} resultados encontrados`);
        return resultados;
    };

    // Crear localSearchEngine para compatibilidad
    window.localSearchEngine = {
        data: { pdfs: datosPDFs },
        search: window.performSearch
    };

    // Crear autoSearchEngine para compatibilidad
    window.autoSearchEngine = {
        data: { pdfs: datosPDFs },
        search: window.performSearch
    };

    console.log('✅ Funciones de búsqueda creadas');
}

// ====== ACTUALIZAR ESTADÍSTICAS ======
function actualizarEstadisticas() {
    console.log('📊 Actualizando estadísticas...');

    const totalDocs = document.getElementById('totalDocs');
    const totalSize = document.getElementById('totalSize');
    const lastUpdate = document.getElementById('lastUpdate');

    if (datosPDFs.length > 0) {
        if (totalDocs) {
            totalDocs.textContent = datosPDFs.length;
            console.log(`📄 Total: ${datosPDFs.length}`);
        }

        if (totalSize) {
            const totalBytes = datosPDFs.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0);
            const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
            totalSize.textContent = `${totalMB} MB`;
        }

        if (lastUpdate) {
            const date = new Date().toLocaleDateString('es-ES');
            lastUpdate.textContent = date;
        }
    }
}

// ====== CSS ULTRA-ANCHO ======
function crearCSSUltraAncho() {
    const style = document.createElement('style');
    style.textContent = `
        /* ====== ULTRA LAYOUT ANCHO ====== */

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0 !important;
            padding: 0 !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            min-height: 100vh !important;
            font-family: 'Arial', sans-serif !important;
        }

        .container {
            max-width: 1800px !important;
            width: 98% !important;
            margin: 0 auto !important;
            padding: 15px !important;
        }

        /* ====== TIPOGRAFÍA ====== */
        h1 {
            font-size: 3.5rem !important;
            text-align: center !important;
            margin-bottom: 25px !important;
            color: white !important;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3) !important;
        }

        h2 {
            font-size: 2.5rem !important;
            text-align: center !important;
            margin-bottom: 20px !important;
            color: white !important;
        }

        h3 {
            font-size: 1.8rem !important;
            margin-bottom: 15px !important;
            color: white !important;
        }

        p, span, div {
            font-size: 1.3rem !important;
            line-height: 1.6 !important;
        }

        /* ====== SEARCH CONTAINER MÁS ANCHO ====== */
        .search-container {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 25px !important;
            padding: 50px !important;
            margin: 25px 0 !important;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15) !important;
            max-width: 100% !important;
        }

        .search-input-group {
            display: flex !important;
            gap: 25px !important;
            margin-bottom: 35px !important;
            flex-wrap: wrap !important;
        }

        .search-input {
            flex: 1 !important;
            min-width: 400px !important;
            padding: 20px 30px !important;
            font-size: 1.4rem !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 20px !important;
            background: white !important;
        }

        .category-filter, .sort-select {
            padding: 20px 30px !important;
            font-size: 1.3rem !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 20px !important;
            background: white !important;
            min-width: 280px !important;
        }

        /* ====== ESTADÍSTICAS MÁS GRANDES ====== */
        .stats-container {
            display: flex !important;
            justify-content: center !important;
            gap: 50px !important;
            margin: 40px 0 !important;
            flex-wrap: wrap !important;
        }

        .stat-item {
            text-align: center !important;
            background: rgba(255,255,255,0.25) !important;
            padding: 25px 40px !important;
            border-radius: 25px !important;
            backdrop-filter: blur(15px) !important;
        }

        .stat-number {
            font-size: 3rem !important;
            font-weight: bold !important;
            color: white !important;
            display: block !important;
        }

        .stat-label {
            font-size: 1.3rem !important;
            color: rgba(255,255,255,0.9) !important;
        }

        /* ====== VIDEOS MÁS GRANDES ====== */
        .videos-section {
            margin: 60px 0 !important;
        }

        .videos-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)) !important;
            gap: 50px !important;
            max-width: 1600px !important;
            margin: 0 auto !important;
        }

        .video-card {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 25px !important;
            padding: 30px !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        }

        .video-card:hover {
            transform: translateY(-8px) !important;
            box-shadow: 0 30px 60px rgba(0,0,0,0.25) !important;
        }

        .video-wrapper {
            position: relative !important;
            width: 100% !important;
            padding-bottom: 177.78% !important; /* 9:16 formato móvil */
            border-radius: 25px !important;
            overflow: hidden !important;
            background: #000 !important;
            margin-bottom: 25px !important;
        }

        .video-wrapper video {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 25px !important;
        }

        .sound-toggle {
            position: absolute !important;
            bottom: 25px !important;
            right: 25px !important;
            background: rgba(0,0,0,0.85) !important;
            color: white !important;
            border: none !important;
            border-radius: 50% !important;
            width: 60px !important;
            height: 60px !important;
            cursor: pointer !important;
            z-index: 10 !important;
            font-size: 1.4rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .sound-toggle:hover {
            background: rgba(0,0,0,0.95) !important;
        }

        /* ====== RESULTADOS MÁS GRANDES ====== */
        .results-container {
            max-width: 1600px !important;
            margin: 40px auto !important;
        }

        .result-item {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 25px !important;
            padding: 40px !important;
            margin-bottom: 30px !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
            transition: transform 0.3s ease !important;
        }

        .result-item:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 25px 50px rgba(0,0,0,0.2) !important;
        }

        .result-count {
            font-size: 1.8rem !important;
            font-weight: bold !important;
            color: #333 !important;
        }

        .no-results {
            text-align: center !important;
            padding: 50px !important;
            background: rgba(255,255,255,0.95) !important;
            border-radius: 25px !important;
            margin: 30px 0 !important;
        }

        .no-results h3 {
            color: #333 !important;
            font-size: 2rem !important;
            margin-bottom: 20px !important;
        }

        .no-results p {
            color: #666 !important;
            font-size: 1.4rem !important;
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

        .hidden {
            opacity: 0 !important;
            visibility: hidden !important;
            transition: opacity 0.5s ease !important;
        }

        /* ====== RESPONSIVE MANTENIENDO TODO GRANDE ====== */
        @media (max-width: 1400px) {
            .container {
                width: 100% !important;
                padding: 10px !important;
            }

            h1 {
                font-size: 3rem !important;
            }

            .videos-grid {
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)) !important;
                gap: 40px !important;
            }
        }

        @media (max-width: 768px) {
            .container {
                width: 100% !important;
                padding: 8px !important;
            }

            h1 {
                font-size: 2.5rem !important;
            }

            .search-container {
                padding: 30px !important;
            }

            .search-input-group {
                flex-direction: column !important;
                gap: 20px !important;
            }

            .search-input, .category-filter, .sort-select {
                min-width: 100% !important;
                font-size: 1.2rem !important;
                padding: 18px 25px !important;
            }

            .videos-grid {
                grid-template-columns: 1fr !important;
                gap: 30px !important;
            }

            .stats-container {
                gap: 30px !important;
            }

            .stat-item {
                padding: 20px 30px !important;
            }

            .stat-number {
                font-size: 2.5rem !important;
            }
        }

        @media (max-width: 480px) {
            h1 {
                font-size: 2rem !important;
            }

            .search-container {
                padding: 25px !important;
            }

            .result-item {
                padding: 30px !important;
            }
        }
    `;

    document.head.appendChild(style);
    console.log('✅ CSS ultra-ancho aplicado');
}

// ====== CONFIGURAR BÚSQUEDA ======
function configurarBusqueda() {
    console.log('🔧 Configurando búsqueda...');

    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');

    if (searchInput) {
        // Limpiar listeners anteriores
        searchInput.removeEventListener('input', handleSearch);
        searchInput.addEventListener('input', handleSearch);
        console.log('✅ Input configurado');
    }

    if (clearButton) {
        clearButton.removeEventListener('click', handleClear);
        clearButton.addEventListener('click', handleClear);
    }

    function handleSearch(e) {
        const query = e.target.value.trim();

        if (clearButton) {
            clearButton.style.display = query ? 'block' : 'none';
        }

        if (window.performSearch && sistemaActivo) {
            const resultados = window.performSearch(query);

            // Actualizar contador
            const resultCount = document.getElementById('resultCount');
            if (resultCount) {
                resultCount.textContent = resultados.length;
            }

            console.log(`🔍 Búsqueda "${query}": ${resultados.length} resultados`);
        }
    }

    function handleClear() {
        if (searchInput) {
            searchInput.value = '';
            handleSearch({ target: searchInput });
        }
    }
}

// ====== INICIALIZAR ======
async function inicializar() {
    console.log('🎯 INICIALIZANDO ULTRA SOLUCIÓN...');

    // Ocultar loading
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }

        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '1';
            container.style.visibility = 'visible';
        }
    }, 1000);

    // Aplicar CSS ultra-ancho
    crearCSSUltraAncho();

    // Cargar datos
    await cargarDatos();

    // Configurar búsqueda
    configurarBusqueda();

    // Disparar eventos para compatibilidad
    if (window.dispatchEvent) {
        window.dispatchEvent(new Event('localSearchEngineLoaded'));
        window.dispatchEvent(new Event('DOMContentLoaded'));
    }

    // Prueba de búsqueda
    setTimeout(() => {
        if (window.performSearch && sistemaActivo) {
            const testResults = window.performSearch('Daily');
            console.log(`🧪 PRUEBA FINAL: "Daily" - ${testResults.length} resultados`);

            if (testResults.length > 0) {
                console.log('✅ Primer resultado:', testResults[0].title);
            }
        }
    }, 2000);

    console.log('🎉 ULTRA SOLUCIÓN INICIALIZADA');
}

// ====== INICIO ======
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('🚀 ULTRA SOLUCIÓN DEFINITIVA CARGADA');