/**
 * SOLUCIÓN CON FICHAS ORIGINALES - VERSIÓN CORREGIDA
 * Sin CSS conflictivo que rompe el centrado
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
        resultCount.textContent = `${resultados.length} documentos encontrados`;
    }

    // Ocultar loading
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }

    if (resultados.length === 0) {
        // Mostrar no resultados
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        if (noResults) {
            noResults.style.display = 'block';
        }
        return;
    }

    // Ocultar mensaje de no resultados
    if (noResults) {
        noResults.style.display = 'none';
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
                <button class="download-btn btn btn-primary" data-filename="${pdf.filename}" data-url="${pdf.filePath}">
                    <i class="fas fa-download"></i>
                    Descargar PDF
                </button>
                <button class="view-btn btn btn-secondary" data-filename="${pdf.filename}" data-url="${pdf.filePath}" title="Ver PDF">
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
        z-index: 10000;
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
            loadingOverlay.classList.remove('active');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }, 1000);

    // Cargar datos
    await cargarDatos();

    // Configurar búsqueda
    configurarBusqueda();

    // Mostrar resultados iniciales (vacío)
    setTimeout(() => {
        if (sistemaActivo) {
            renderizarFichas([]);
        }
    }, 1500);

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
if (typeof window.datosPDFs === 'undefined' || window.datosPDFs.length === 0) {
    console.log('🔧 Forzando inicialización INMEDIATA de variables globales...');

    cargarDatos().then(success => {
        if (success) {
            console.log('✅ Variables globales cargadas FORZADAMENTE');

            window.datosPDFsGlobal = window.datosPDFs;
            window.sistemaActivoGlobal = window.sistemaActivo;

            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value.trim()) {
                console.log('🔍 Detectada búsqueda activa, forzando renderizado...');
                const resultados = window.performSearch(searchInput.value);
                if (resultados && resultados.length > 0) {
                    renderizarFichas(resultados);
                    console.log('✅ Renderizado forzado completado:', resultados.length, 'fichas');
                }
            }
        }
    });
}

// Segundo intento de seguridad
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
