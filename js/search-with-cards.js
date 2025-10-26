/**
 * SOLUCIÓN CON FICHAS ORIGINALES
 * Mantener búsqueda ultra-ancha + restaurar fichas técnicas completas
 */

console.log('🚀 SOLUCIÓN CON FICHAS ORIGINALES CARGANDO...');

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
                tags: Array.isArray(pdf.tags) ? pdf.tags : [],
                ingredients: Array.isArray(pdf.ingredients) ? pdf.ingredients : [],
                benefits: Array.isArray(pdf.benefits) ? pdf.benefits : []
            }));

            // Crear funciones de búsqueda
            crearFuncionesBusqueda();

            // Actualizar estadísticas
            actualizarEstadisticas();

            sistemaActivo = true;
            console.log('🎯 SISTEMA ACTIVO CON FICHAS');

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
    // Función de búsqueda
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

// ====== RENDERIZAR FICHAS ORIGINALES ======
function renderizarFichas(resultados) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultCount = document.getElementById('resultCount');
    const noResults = document.getElementById('noResults');
    const loadingIndicator = document.getElementById('loadingIndicator');

    console.log(`🎨 Renderizando ${resultados.length} fichas...`);

    // Actualizar contador
    if (resultCount) {
        resultCount.textContent = resultados.length;
    }

    // Ocultar loading
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }

    if (resultados.length === 0) {
        // Mostrar no resultados
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron fichas técnicas</h3>
                    <p>Intenta con otros términos de búsqueda</p>
                </div>
            `;
        }
        return;
    }

    // Renderizar cada ficha
    if (resultsContainer) {
        resultsContainer.innerHTML = '';

        resultados.forEach(pdf => {
            const ficha = crearFichaOriginal(pdf);
            resultsContainer.appendChild(ficha);
        });

        // Adjuntar eventos
        adjuntarEventosFichas();

        console.log(`✅ ${resultados.length} fichas renderizadas`);
    }
}

// ====== CREAR FICHA ORIGINAL ======
function crearFichaOriginal(pdf) {
    const ficha = document.createElement('div');
    ficha.className = 'result-item enhanced';

    // Formatear tamaño
    const fileSizeMB = (pdf.fileSize / (1024 * 1024)).toFixed(1);
    const uploadDate = new Date(pdf.uploadDate).toLocaleDateString('es-ES');

    // Badges de categorías
    const categoryBadges = pdf.categories && pdf.categories.length > 0
        ? pdf.categories.slice(0, 3).map(cat => `<span class="category-badge">${cat}</span>`).join('')
        : `<span class="category-badge">${pdf.category || 'General'}</span>`;

    // Ingredientes principales
    const ingredientsList = pdf.ingredients && pdf.ingredients.length > 0
        ? pdf.ingredients.slice(0, 5).map(ing => `<li>${ing}</li>`).join('')
        : '<li>Consultar ficha técnica</li>';

    // Beneficios principales
    const benefitsList = pdf.benefits && pdf.benefits.length > 0
        ? pdf.benefits.slice(0, 4).map(ben => `<li>${ben}</li>`).join('')
        : '<li>Consultar ficha técnica</li>';

    ficha.innerHTML = `
        <div class="enhanced-result-card">
            <div class="card-header">
                <div class="card-title-section">
                    <h3 class="result-title">${pdf.title}</h3>
                    <div class="category-badges">${categoryBadges}</div>
                </div>
                <div class="card-category">
                    <span class="category-tag">${pdf.category || 'General'}</span>
                </div>
            </div>

            <div class="card-description">
                <p>${pdf.description || 'Ficha técnica del producto LifePlus'}</p>
            </div>

            <div class="card-composition">
                <div class="composition-section">
                    <h4 class="composition-title">
                        <i class="fas fa-pills"></i>
                        Ingredientes Principales
                    </h4>
                    <ul class="ingredients-list">
                        ${ingredientsList}
                    </ul>
                </div>

                <div class="composition-section">
                    <h4 class="composition-title">
                        <i class="fas fa-heart"></i>
                        Beneficios
                    </h4>
                    <ul class="benefits-list">
                        ${benefitsList}
                    </ul>
                </div>
            </div>

            <div class="card-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${uploadDate}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-weight-hanging"></i>
                    <span>${fileSizeMB} MB</span>
                </div>
                ${pdf.downloadCount ? `
                    <div class="meta-item">
                        <i class="fas fa-download"></i>
                        <span>${pdf.downloadCount} descargas</span>
                    </div>
                ` : ''}
            </div>

            <div class="pdf-actions">
                <button class="download-btn" data-filename="${pdf.filename}" data-url="${pdf.filePath}">
                    <i class="fas fa-download"></i>
                    Descargar PDF
                </button>
                <button class="view-btn" data-filename="${pdf.filename}" data-url="${pdf.filePath}" title="Ver PDF">
                    <i class="fas fa-eye"></i>
                    Ver
                </button>
            </div>
        </div>
    `;

    return ficha;
}

// ====== ADJUNTAR EVENTOS FICHAS ======
function adjuntarEventosFichas() {
    // Botones de descarga
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filename = e.currentTarget.dataset.filename;
            const url = e.currentTarget.dataset.url;
            descargarPDF(filename, url);
        });
    });

    // Botones de vista
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = e.currentTarget.dataset.url;
            verPDF(url);
        });
    });
}

// ====== FUNCIONES PDF ======
function descargarPDF(filename, url) {
    console.log('📥 Descargando PDF:', filename);

    const downloadUrl = encodeURI(url);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarNotificacion(`Descargando: ${filename}`, 'success');
}

function verPDF(url) {
    console.log('👁️ Abriendo PDF:', url);

    const viewUrl = encodeURI(url);
    window.open(viewUrl, '_blank');
}

function mostrarNotificacion(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#4299e1'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ====== CSS CON FICHAS ORIGINALES ======
function crearCSSConFichas() {
    const style = document.createElement('style');
    style.textContent = `
        /* ====== LAYOUT ULTRA-ANCHO ====== */
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
            color: #333 !important;
        }

        p, span, div {
            font-size: 1.3rem !important;
            line-height: 1.6 !important;
        }

        /* ====== CONTADOR DE RESULTADOS - COLOR CORREGIDO ====== */
        .result-count {
            font-size: 2rem !important;
            font-weight: bold !important;
            color: #333 !important;
            text-align: center !important;
            margin: 20px 0 !important;
            text-shadow: none !important;
        }

        /* ====== SEARCH CONTAINER ====== */
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

        /* ====== ESTADÍSTICAS ====== */
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

        /* ====== VIDEOS ====== */
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
        }

        .video-wrapper {
            position: relative !important;
            width: 100% !important;
            padding-bottom: 177.78% !important;
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

        /* ====== FICHAS ORIGINALES - TARJETAS ENHANCED ====== */
        .results-container {
            max-width: 1600px !important;
            margin: 40px auto !important;
        }

        .enhanced-result-card {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 25px !important;
            padding: 40px !important;
            margin-bottom: 30px !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease !important;
            border: 1px solid rgba(0,0,0,0.1) !important;
        }

        .enhanced-result-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 25px 50px rgba(0,0,0,0.2) !important;
        }

        .card-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            margin-bottom: 20px !important;
        }

        .card-title-section {
            flex: 1 !important;
        }

        .result-title {
            font-size: 2rem !important;
            font-weight: bold !important;
            color: #333 !important;
            margin-bottom: 10px !important;
            line-height: 1.3 !important;
        }

        .category-badges {
            display: flex !important;
            gap: 8px !important;
            flex-wrap: wrap !important;
        }

        .category-badge {
            background: linear-gradient(135deg, #667eea, #764ba2) !important;
            color: white !important;
            padding: 6px 12px !important;
            border-radius: 20px !important;
            font-size: 0.9rem !important;
            font-weight: 600 !important;
        }

        .card-category {
            margin-left: 20px !important;
        }

        .category-tag {
            background: rgba(102, 126, 234, 0.2) !important;
            color: #667eea !important;
            padding: 8px 16px !important;
            border-radius: 20px !important;
            font-size: 1rem !important;
            font-weight: 600 !important;
        }

        .card-description {
            margin-bottom: 25px !important;
        }

        .card-description p {
            color: #666 !important;
            font-size: 1.2rem !important;
            line-height: 1.6 !important;
        }

        .card-composition {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
            gap: 30px !important;
            margin-bottom: 25px !important;
            background: rgba(249, 250, 251, 0.8) !important;
            padding: 25px !important;
            border-radius: 20px !important;
        }

        .composition-title {
            font-size: 1.3rem !important;
            font-weight: bold !important;
            color: #667eea !important;
            margin-bottom: 15px !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
        }

        .ingredients-list, .benefits-list {
            list-style: none !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        .ingredients-list li, .benefits-list li {
            color: #555 !important;
            font-size: 1.1rem !important;
            margin-bottom: 8px !important;
            padding-left: 20px !important;
            position: relative !important;
        }

        .ingredients-list li:before, .benefits-list li:before {
            content: "•" !important;
            color: #667eea !important;
            font-weight: bold !important;
            position: absolute !important;
            left: 0 !important;
        }

        .card-meta {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 25px !important;
            padding: 15px 0 !important;
            border-top: 1px solid rgba(0,0,0,0.1) !important;
            border-bottom: 1px solid rgba(0,0,0,0.1) !important;
        }

        .meta-item {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            color: #666 !important;
            font-size: 1.1rem !important;
        }

        .meta-item i {
            color: #667eea !important;
        }

        .pdf-actions {
            display: flex !important;
            gap: 15px !important;
            flex-wrap: wrap !important;
        }

        .download-btn, .view-btn {
            background: linear-gradient(135deg, #667eea, #764ba2) !important;
            color: white !important;
            border: none !important;
            padding: 15px 30px !important;
            border-radius: 15px !important;
            font-size: 1.1rem !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            text-decoration: none !important;
        }

        .view-btn {
            background: linear-gradient(135deg, #48bb78, #38a169) !important;
        }

        .download-btn:hover, .view-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
        }

        /* ====== NO RESULTS ====== */
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

        /* ====== RESPONSIVE ====== */
        @media (max-width: 1400px) {
            .container {
                width: 100% !important;
                padding: 10px !important;
            }

            .enhanced-result-card {
                padding: 30px !important;
            }

            .card-composition {
                grid-template-columns: 1fr !important;
            }
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 2.5rem !important;
            }

            .search-container {
                padding: 30px !important;
            }

            .search-input-group {
                flex-direction: column !important;
            }

            .search-input {
                min-width: 100% !important;
            }

            .card-header {
                flex-direction: column !important;
            }

            .card-category {
                margin-left: 0 !important;
                margin-top: 10px !important;
            }

            .card-meta {
                flex-direction: column !important;
                gap: 10px !important;
            }

            .pdf-actions {
                flex-direction: column !important;
            }

            .download-btn, .view-btn {
                justify-content: center !important;
            }
        }

        /* ====== ANIMACIONES ====== */
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;

    document.head.appendChild(style);
    console.log('✅ CSS con fichas originales aplicado');
}

// ====== CONFIGURAR BÚSQUEDA ======
function configurarBusqueda() {
    console.log('🔧 Configurando búsqueda con fichas...');

    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');

    if (searchInput) {
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
            renderizarFichas(resultados);
            console.log(`🔍 "${query}": ${resultados.length} resultados renderizados`);
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
    console.log('🎯 INICIALIZANDO SISTEMA CON FICHAS ORIGINALES...');

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

    // Aplicar CSS con fichas
    crearCSSConFichas();

    // Cargar datos
    await cargarDatos();

    // Configurar búsqueda
    configurarBusqueda();

    // Mostrar resultados iniciales
    setTimeout(() => {
        if (sistemaActivo) {
            renderizarFichas([]); // Mostrar estado inicial
        }
    }, 1500);

    // Prueba de búsqueda
    setTimeout(() => {
        if (window.performSearch && sistemaActivo) {
            const testResults = window.performSearch('Daily');
            console.log(`🧪 PRUEBA: "Daily" - ${testResults.length} resultados`);
        }
    }, 2000);

    console.log('🎉 SISTEMA CON FICHAS ORIGINALES INICIALIZADO');
}

// ====== INICIO ======
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('🚀 SOLUCIÓN CON FICHAS ORIGINALES CARGADA');

// ====== FIX DEFINITIVO PARA VARIABLES GLOBALES ======
// Forzar inicialización inmediata y asegurar variables globales
if (typeof window.datosPDFs === 'undefined' || window.datosPDFs.length === 0) {
    console.log('🔧 Forzando inicialización INMEDIATA de variables globales...');

    // Forzar carga de datos sin esperar
    cargarDatos().then(success => {
        if (success) {
            console.log('✅ Variables globales cargadas FORZADAMENTE');

            // Hacer variables globales accesibles globalmente
            window.datosPDFsGlobal = window.datosPDFs;
            window.sistemaActivoGlobal = window.sistemaActivo;

            // Forzar renderizado si hay búsqueda activa
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value.trim()) {
                console.log('🔍 Detectada búsqueda activa, forzando renderizado...');
                const resultados = window.performSearch(searchInput.value);
                if (resultados && resultados.length > 0) {
                    window.renderizarFichas(resultados);
                    console.log('✅ Renderizado forzado completado:', resultados.length, 'fichas');
                }
            }
        }
    });
}

// Segundo intento de seguridad después de 2 segundos
setTimeout(() => {
    if (typeof window.datosPDFs === 'undefined' || window.datosPDFs.length === 0) {
        console.log('🔧 SEGUNDO INTENTO: Forzando variables globales...');
        cargarDatos().then(success => {
            if (success) {
                console.log('✅ Variables globales cargadas en segundo intento');
            }
        });
    }
}, 2000);

// Tercer intento de seguridad después de 5 segundos
setTimeout(() => {
    if (typeof window.datosPDFs === 'undefined' || window.datosPDFs.length === 0) {
        console.log('🔧 TERCER INTENTO: Último intento de cargar variables...');
        cargarDatos().then(success => {
            if (success) {
                console.log('✅ Variables globales cargadas en tercer intento');
            }
        });
    }
}, 5000);