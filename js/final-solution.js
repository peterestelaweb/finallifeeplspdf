/**
 * SOLUCIÓN FINAL DEFINITIVA
 * Arregla búsqueda, layout, videos y responsive todo en uno
 */

console.log('🚀 INICIANDO SOLUCIÓN FINAL DEFINITIVA...');

// ====== VARIABLES GLOBALES ======
let pdfsData = [];
let sistemaFuncionando = false;

// ====== CARGAR DATOS DE PDFS ======
async function cargarDatosPDFs() {
    try {
        console.log('📥 Cargando datos de PDFs...');
        const response = await fetch('data/pdf-index.json?' + Date.now());

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.pdfs && Array.isArray(data.pdfs)) {
            pdfsData = data.pdfs;
            console.log(`✅ ${pdfsData.length} PDFs cargados correctamente`);

            // Crear motores de búsqueda
            crearMotoresBusqueda();

            // Actualizar estadísticas
            actualizarEstadisticas();

            sistemaFuncionando = true;
            return true;
        }

        throw new Error('Formato de datos inválido');

    } catch (error) {
        console.error('❌ Error cargando PDFs:', error);
        return false;
    }
}

// ====== CREAR MOTORES DE BÚSQUEDA ======
function crearMotoresBusqueda() {
    // Motor local para search.js
    window.localSearchEngine = {
        data: { pdfs: pdfsData },
        search: function(query, options = {}) {
            return buscarPDFs(query, options);
        }
    };

    // Motor universal
    window.autoSearchEngine = {
        data: { pdfs: pdfsData },
        search: function(query, options = {}) {
            return buscarPDFs(query, options);
        }
    };

    // Función performSearch global
    window.performSearch = function(query) {
        console.log(`🔍 Buscando: "${query}"`);
        const resultados = buscarPDFs(query, { fuzzy: true, limit: 50 });
        console.log(`📊 ${resultados.length} resultados encontrados`);
        return resultados;
    };

    console.log('✅ Motores de búsqueda creados');
}

// ====== BÚSQUEDA DE PDFs ======
function buscarPDFs(query, options = {}) {
    if (!query || !query.trim()) {
        return [];
    }

    const { fuzzy = true, limit = 50, category = null } = options;
    const searchTerm = query.toLowerCase().trim();

    let resultados = pdfsData.filter(pdf => {
        // Crear texto de búsqueda completo
        const searchFields = [
            pdf.title || '',
            pdf.filename || '',
            pdf.description || '',
            (pdf.keywords || []).join(' '),
            (pdf.tags || []).join(' '),
            pdf.category || '',
            pdf.brand || ''
        ].join(' ').toLowerCase();

        // Búsqueda exacta
        if (searchFields.includes(searchTerm)) {
            return true;
        }

        // Búsqueda con términos separados
        const searchTerms = searchTerm.split(' ').filter(term => term.length > 0);
        const hasAllTerms = searchTerms.every(term => searchFields.includes(term));
        if (hasAllTerms) {
            return true;
        }

        // Búsqueda fuzzy si está activada
        if (fuzzy) {
            return fuzzyMatch(searchTerm, searchFields) ||
                   fuzzyMatchTerms(searchTerms, searchFields);
        }

        return false;
    });

    // Aplicar filtro de categoría si es necesario
    if (category && category !== '') {
        resultados = resultados.filter(pdf => pdf.category === category);
    }

    // Calcular relevancia y ordenar
    resultados = resultados.map(pdf => ({
        ...pdf,
        _relevanceScore: calcularRelevancia(pdf, searchTerm)
    }));

    resultados.sort((a, b) => b._relevanceScore - a._relevanceScore);

    // Limitar resultados
    if (limit > 0) {
        resultados = resultados.slice(0, limit);
    }

    return resultados;
}

// ====== BÚSQUEDA FUZZY ======
function fuzzyMatch(query, text, threshold = 0.6) {
    const queryChars = query.split('');
    let textIndex = 0;
    let matches = 0;

    for (const char of queryChars) {
        const foundIndex = text.indexOf(char, textIndex);
        if (foundIndex !== -1) {
            matches++;
            textIndex = foundIndex + 1;
        }
    }

    return (matches / queryChars.length) >= threshold;
}

function fuzzyMatchTerms(terms, text) {
    const matchedTerms = terms.filter(term =>
        fuzzyMatch(term, text, 0.5) || text.includes(term)
    );
    return matchedTerms.length >= Math.ceil(terms.length / 2);
}

// ====== CALCULAR RELEVANCIA ======
function calcularRelevancia(pdf, searchTerm) {
    let score = 0;
    const searchFields = [
        pdf.title || '',
        pdf.filename || '',
        (pdf.keywords || []).join(' '),
        (pdf.tags || []).join(' ')
    ].join(' ').toLowerCase();

    // Coincidencia exacta en título (+100)
    if ((pdf.title || '').toLowerCase().includes(searchTerm)) {
        score += 100;
    }

    // Coincidencia exacta en filename (+80)
    if ((pdf.filename || '').toLowerCase().includes(searchTerm)) {
        score += 80;
    }

    // Coincidencia en keywords (+60)
    if ((pdf.keywords || []).some(k => k.toLowerCase().includes(searchTerm))) {
        score += 60;
    }

    // Coincidencia en tags (+40)
    if ((pdf.tags || []).some(t => t.toLowerCase().includes(searchTerm))) {
        score += 40;
    }

    // Coincidencia exacta completa (+200)
    if (searchFields === searchTerm) {
        score += 200;
    }

    // Coincidencia al inicio (+50)
    if (searchFields.startsWith(searchTerm)) {
        score += 50;
    }

    return Math.max(0, score);
}

// ====== ACTUALIZAR ESTADÍSTICAS ======
function actualizarEstadisticas() {
    console.log('📊 Actualizando estadísticas...');

    const totalDocs = document.getElementById('totalDocs');
    const totalSize = document.getElementById('totalSize');
    const lastUpdate = document.getElementById('lastUpdate');

    if (pdfsData.length > 0) {
        if (totalDocs) {
            totalDocs.textContent = pdfsData.length;
            console.log(`📄 Total documentos: ${pdfsData.length}`);
        }

        if (totalSize) {
            const totalBytes = pdfsData.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0);
            const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
            totalSize.textContent = `${totalMB} MB`;
            console.log(`💾 Tamaño total: ${totalMB} MB`);
        }

        if (lastUpdate) {
            const date = new Date().toLocaleDateString('es-ES');
            lastUpdate.textContent = date;
        }
    }
}

// ====== CREAR CSS MEJORADO ======
function crearCSSMejorado() {
    const style = document.createElement('style');
    style.textContent = `
        /* ====== ESTILOS MEJORADOS ====== */

        /* BODY Y CONTAINER PRINCIPAL */
        body {
            margin: 0 !important;
            padding: 0 !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            min-height: 100vh !important;
            font-family: 'Arial', sans-serif !important;
        }

        .container {
            max-width: 1600px !important;
            width: 100% !important;
            margin: 0 auto !important;
            padding: 20px !important;
            box-sizing: border-box !important;
        }

        /* ====== TIPOGRAFÍA ====== */
        h1 {
            font-size: 3rem !important;
            text-align: center !important;
            margin-bottom: 20px !important;
            color: white !important;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3) !important;
        }

        h2 {
            font-size: 2.2rem !important;
            text-align: center !important;
            margin-bottom: 15px !important;
            color: white !important;
        }

        h3 {
            font-size: 1.6rem !important;
            margin-bottom: 10px !important;
            color: white !important;
        }

        p, span, div {
            font-size: 1.2rem !important;
            line-height: 1.6 !important;
            color: #333 !important;
        }

        /* ====== SEARCH CONTAINER ====== */
        .search-container {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 20px !important;
            padding: 40px !important;
            margin: 20px 0 !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
            max-width: 100% !important;
        }

        .search-input-group {
            display: flex !important;
            gap: 20px !important;
            margin-bottom: 30px !important;
            flex-wrap: wrap !important;
        }

        .search-input {
            flex: 1 !important;
            min-width: 300px !important;
            padding: 18px 25px !important;
            font-size: 1.3rem !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 15px !important;
            background: white !important;
        }

        .category-filter, .sort-select {
            padding: 18px 25px !important;
            font-size: 1.2rem !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 15px !important;
            background: white !important;
            min-width: 250px !important;
        }

        /* ====== ESTADÍSTICAS ====== */
        .stats-container {
            display: flex !important;
            justify-content: center !important;
            gap: 40px !important;
            margin: 30px 0 !important;
            flex-wrap: wrap !important;
        }

        .stat-item {
            text-align: center !important;
            background: rgba(255,255,255,0.2) !important;
            padding: 20px 30px !important;
            border-radius: 20px !important;
            backdrop-filter: blur(10px) !important;
        }

        .stat-number {
            font-size: 2.5rem !important;
            font-weight: bold !important;
            color: white !important;
            display: block !important;
        }

        .stat-label {
            font-size: 1.1rem !important;
            color: rgba(255,255,255,0.9) !important;
        }

        /* ====== VIDEOS - FORMATO MÓVIL EN DESKTOP ====== */
        .videos-section {
            margin: 50px 0 !important;
        }

        .videos-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)) !important;
            gap: 40px !important;
            max-width: 1400px !important;
            margin: 0 auto !important;
        }

        .video-card {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 20px !important;
            padding: 25px !important;
            box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        }

        .video-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 25px 50px rgba(0,0,0,0.2) !important;
        }

        .video-wrapper {
            position: relative !important;
            width: 100% !important;
            padding-bottom: 177.78% !important; /* Proporción 9:16 como móvil */
            border-radius: 20px !important;
            overflow: hidden !important;
            background: #000 !important;
            margin-bottom: 20px !important;
        }

        .video-wrapper video {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 20px !important;
        }

        .sound-toggle {
            position: absolute !important;
            bottom: 20px !important;
            right: 20px !important;
            background: rgba(0,0,0,0.8) !important;
            color: white !important;
            border: none !important;
            border-radius: 50% !important;
            width: 50px !important;
            height: 50px !important;
            cursor: pointer !important;
            z-index: 10 !important;
            font-size: 1.2rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .sound-toggle:hover {
            background: rgba(0,0,0,0.9) !important;
        }

        /* ====== RESULTADOS ====== */
        .results-container {
            max-width: 1400px !important;
            margin: 30px auto !important;
        }

        .result-item {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 20px !important;
            padding: 30px !important;
            margin-bottom: 25px !important;
            box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
            transition: transform 0.3s ease !important;
        }

        .result-item:hover {
            transform: translateY(-3px) !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
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

        /* ====== RESPONSIVE MEJORADO ====== */
        @media (max-width: 1200px) {
            .container {
                max-width: 100% !important;
                padding: 15px !important;
            }

            h1 {
                font-size: 2.5rem !important;
            }

            .videos-grid {
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
                gap: 30px !important;
            }
        }

        @media (max-width: 768px) {
            .container {
                width: 100% !important;
                padding: 10px !important;
            }

            h1 {
                font-size: 2rem !important;
            }

            h2 {
                font-size: 1.8rem !important;
            }

            .search-container {
                padding: 25px !important;
            }

            .search-input-group {
                flex-direction: column !important;
                gap: 15px !important;
            }

            .search-input, .category-filter, .sort-select {
                min-width: 100% !important;
                font-size: 1.1rem !important;
                padding: 15px 20px !important;
            }

            .videos-grid {
                grid-template-columns: 1fr !important;
                gap: 20px !important;
            }

            .video-card {
                padding: 20px !important;
            }

            .stats-container {
                gap: 20px !important;
            }

            .stat-item {
                padding: 15px 20px !important;
            }

            .stat-number {
                font-size: 2rem !important;
            }
        }

        @media (max-width: 480px) {
            h1 {
                font-size: 1.8rem !important;
            }

            .search-container {
                padding: 20px !important;
            }

            .video-wrapper {
                padding-bottom: 177.78% !important; /* Mantener proporción móvil */
            }

            .result-item {
                padding: 20px !important;
            }
        }

        /* ====== ARREGLOS ESPECÍFICOS ====== */
        .result-count {
            font-size: 1.4rem !important;
            font-weight: bold !important;
            color: #333 !important;
        }

        .no-results {
            text-align: center !important;
            padding: 40px !important;
            background: rgba(255,255,255,0.9) !important;
            border-radius: 20px !important;
            margin: 20px 0 !important;
        }

        .no-results h3 {
            color: #333 !important;
            font-size: 1.6rem !important;
            margin-bottom: 15px !important;
        }

        .no-results p {
            color: #666 !important;
            font-size: 1.2rem !important;
        }
    `;

    document.head.appendChild(style);
    console.log('✅ CSS mejorado aplicado');
}

// ====== CONFIGURAR BÚSQUEDA ======
function configurarBusqueda() {
    console.log('🔧 Configurando sistema de búsqueda...');

    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');

    if (searchInput) {
        // Limpiar event listeners anteriores
        searchInput.removeEventListener('input', handleSearch);
        searchInput.addEventListener('input', handleSearch);

        console.log('✅ Input de búsqueda configurado');
    }

    if (clearButton) {
        clearButton.removeEventListener('click', handleClear);
        clearButton.addEventListener('click', handleClear);
    }

    // Función de búsqueda
    function handleSearch(e) {
        const query = e.target.value;

        if (clearButton) {
            clearButton.style.display = query ? 'block' : 'none';
        }

        if (window.performSearch && sistemaFuncionando) {
            const resultados = window.performSearch(query);

            // Actualizar contador de resultados
            const resultCount = document.getElementById('resultCount');
            if (resultCount) {
                resultCount.textContent = resultados.length;
            }

            // Si hay una función que renderiza resultados, llamarla
            if (window.PDFSearchApp && window.PDFSearchApp.renderResults) {
                window.PDFSearchApp.filteredPDFs = resultados;
                window.PDFSearchApp.renderResults();
            }
        }
    }

    function handleClear() {
        if (searchInput) {
            searchInput.value = '';
            handleSearch({ target: searchInput });
        }
    }
}

// ====== INICIALIZAR SISTEMA ======
async function inicializarSistema() {
    console.log('🎯 INICIALIZANDO SISTEMA COMPLETO...');

    // Ocultar loading
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }

        // Mostrar container
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '1';
            container.style.visibility = 'visible';
        }
    }, 1000);

    // Aplicar CSS mejorado
    crearCSSMejorado();

    // Cargar datos
    await cargarDatosPDFs();

    // Configurar búsqueda
    configurarBusqueda();

    // Disparar evento para otros scripts
    if (window.dispatchEvent) {
        window.dispatchEvent(new Event('localSearchEngineLoaded'));
    }

    // Prueba de búsqueda
    setTimeout(() => {
        if (window.performSearch && sistemaFuncionando) {
            const testResults = window.performSearch('Daily');
            console.log(`🧪 PRUEFA: Búsqueda de "Daily" - ${testResults.length} resultados`);

            if (testResults.length > 0) {
                console.log('✅ Primer resultado:', testResults[0].title);
            }
        }
    }, 2000);

    console.log('🎉 SISTEMA COMPLETO INICIALIZADO');
}

// ====== INICIO ======
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistema);
} else {
    inicializarSistema();
}

console.log('🚀 SOLUCIÓN FINAL DEFINITIVA CARGADA');