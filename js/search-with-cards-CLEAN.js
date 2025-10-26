/**
 * BÚSQUEDA CON FICHAS - VERSIÓN LIMPIA SIN CSS
 * Solo lógica JavaScript, CSS en archivos CSS
 */

console.log('🚀 Sistema de búsqueda cargando...');

// Variables globales
let datosPDFs = [];
let sistemaActivo = false;

// Cargar datos
async function cargarDatos() {
    try {
        console.log('📥 Cargando datos...');
        const response = await fetch('data/pdf-index.json');
        const data = await response.json();

        if (data && data.pdfs && Array.isArray(data.pdfs)) {
            datosPDFs = data.pdfs;
            console.log(`✅ ${datosPDFs.length} PDFs cargados`);

            datosPDFs = datosPDFs.map(pdf => ({
                ...pdf,
                keywords: Array.isArray(pdf.keywords) ? pdf.keywords : [],
                tags: Array.isArray(pdf.tags) ? pdf.tags : [],
                ingredients: Array.isArray(pdf.ingredients) ? pdf.ingredients : [],
                benefits: Array.isArray(pdf.benefits) ? pdf.benefits : []
            }));

            crearFuncionesBusqueda();
            actualizarEstadisticas();
            sistemaActivo = true;
            console.log('🎯 Sistema activo');
            return true;
        }
        throw new Error('Datos inválidos');
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// Crear funciones de búsqueda
function crearFuncionesBusqueda() {
    window.performSearch = function(query) {
        if (!query || !query.trim() || !sistemaActivo) return [];

        const searchTerm = query.toLowerCase().trim();

        // Verificar si es cualquier tipo de búsqueda OMEGA
        const omegaSpecificTerms = [
            'omega3', 'omega 3', 'omega-3', 'omegold', 'vegan omegold',
            'aceite de pescado', 'epa', 'dha', 'ácidos grasos'
        ];

        const isSpecificOmegaSearch = omegaSpecificTerms.some(term => searchTerm.includes(term));
        const isGenericOmega = searchTerm === 'omega' || searchTerm === 'omegas';

        // Si es cualquier tipo de búsqueda OMEGA, usar lógica especial
        const isOmegaSearch = isSpecificOmegaSearch || isGenericOmega;

        // Verificar si es búsqueda de VITAMINAS
        // Activar solo para términos genéricos exactos
        const genericVitaminTerms = [
            'vitamina', 'vitaminas', 'vitamin', 'vitamins'
        ];

        const isVitaminSearch = genericVitaminTerms.includes(searchTerm) ||
                               genericVitaminTerms.includes(searchTerm + 's');

        const resultados = datosPDFs.filter(pdf => {
            // SI es búsqueda OMEGA específica (OMEGA3, OMEGOLD, etc.), usar lógica especial
            if (isOmegaSearch) {
                const hasOmegaInTitle = (pdf.title || '').toLowerCase().includes('omega');
                const hasOmegoldInTitle = (pdf.title || '').toLowerCase().includes('omegold');
                const hasOmegaInFilename = (pdf.filename || '').toLowerCase().includes('omega');
                const hasOmegoldInFilename = (pdf.filename || '').toLowerCase().includes('omegold');
                const hasOmegaInCategory = (pdf.category || '').toLowerCase() === 'omega';

                // Lógica específica según término de búsqueda
                if (searchTerm.includes('omegold')) {
                    // Si busca OMEGOLD, solo mostrar productos con OMEGOLD
                    return hasOmegoldInTitle || hasOmegoldInFilename;
                } else {
                    // Si busca OMEGA3, OMEGA 3, etc., mostrar todos los productos omega
                    return hasOmegaInTitle || hasOmegoldInTitle || hasOmegaInFilename || hasOmegoldInFilename || hasOmegaInCategory;
                }
            }

            // SI es búsqueda VITAMINAS, usar lógica especial
            if (isVitaminSearch) {
                const title = (pdf.title || '').toLowerCase();

                // Lógica MUY ESPECÍFICA: Solo productos que realmente son vitaminas
                // Deben empezar con "vitamin" o "vitamina" para ser considerados productos de vitaminas
                const startsWithVitamin = title.startsWith('vitamin') || title.startsWith('vitamina');

                return startsWithVitamin;
            }

            // BÚSQUEDA NORMAL mejorada para vitaminas específicas
            // Si es búsqueda específica de vitaminas (vitamina c, vitamin e, etc.)
            // permitir coincidencias flexibles entre español/inglés
            // Lógica más flexible: buscar cualquier variación de vitamina + letra
            if (searchTerm.includes('vitamina') || searchTerm.includes('vitamin')) {
                // DEPURACIÓN TEMPORAL: Verificar qué está pasando
                console.log('🔍 DEBUG: Búsqueda específica de vitamina');
                console.log('   searchTerm:', searchTerm);
                console.log('   incluye vitamina:', searchTerm.includes('vitamina'));
                console.log('   incluye vitamin:', searchTerm.includes('vitamin'));
                console.log('   longitud searchTerm:', searchTerm.length);
                console.log('   searchTerm completo:', JSON.stringify(searchTerm));

                const searchTermFlex = searchTerm.toLowerCase();
                const titleFlex = (pdf.title || '').toLowerCase();
                const filenameFlex = (pdf.filename || '').toLowerCase();

                // Mejor normalización: No convertir español a inglés, mantener formatos originales
                let searchTermNormalized = searchTermFlex.replace(/\s+/g, '');
                let titleNormalized = titleFlex.replace(/\s+/g, '');
                let filenameNormalized = filenameFlex.replace(/\s+/g, '');

                // Intentar coincidencia directa primero
                const directMatch = titleNormalized.includes(searchTermNormalized) ||
                                  filenameNormalized.includes(searchTermNormalized);

                if (directMatch) {
                    return true;
                }

                // Si no hay coincidencia directa, buscar coincidencias flexibles
                const vitaminLetter = searchTermFlex.replace(/[^a-z]/gi, '').slice(-1);
                if (vitaminLetter && vitaminLetter.length === 1) {
                    // Buscar en ambos formatos: español e inglés
                    const letterMatch = titleFlex.includes(`vitamin ${vitaminLetter}`) ||
                                      titleFlex.includes(`vitamin${vitaminLetter}`) ||
                                      titleFlex.includes(`vitamina ${vitaminLetter}`) ||
                                      titleFlex.includes(`vitamina${vitaminLetter}`) ||
                                      filenameFlex.includes(`vitamin ${vitaminLetter}`) ||
                                      filenameFlex.includes(`vitamin${vitaminLetter}`) ||
                                      filenameFlex.includes(`vitamina ${vitaminLetter}`) ||
                                      filenameFlex.includes(`vitamina${vitaminLetter}`);
                    return letterMatch;
                }

                return false;
            }

            // BÚSQUEDA NORMAL para otros casos
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

        return resultados;
    };

    window.localSearchEngine = {
        data: { pdfs: datosPDFs },
        search: window.performSearch
    };

    console.log('✅ Búsqueda lista');
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const totalDocs = document.getElementById('totalDocs');
    const totalSize = document.getElementById('totalSize');
    const lastUpdate = document.getElementById('lastUpdate');

    if (datosPDFs.length > 0) {
        if (totalDocs) totalDocs.textContent = datosPDFs.length;
        
        if (totalSize) {
            const totalBytes = datosPDFs.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0);
            totalSize.textContent = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
        }
        
        if (lastUpdate) {
            lastUpdate.textContent = new Date().toLocaleDateString('es-ES');
        }
    }
}

// Renderizar fichas
function renderizarFichas(resultados) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultCount = document.getElementById('resultCount');
    const loadingIndicator = document.getElementById('loadingIndicator');

    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (resultCount) resultCount.textContent = `${resultados.length} documentos encontrados`;

    if (!resultsContainer) return;

    if (resultados.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3>No se encontraron fichas técnicas</h3>
                <p>Intenta con otros términos de búsqueda</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = '';
    resultados.forEach(pdf => {
        const ficha = crearFichaHTML(pdf);
        resultsContainer.appendChild(ficha);
    });
}

// Crear HTML de ficha
function crearFichaHTML(pdf) {
    const div = document.createElement('div');
    div.className = 'result-card';
    
    const fileSizeMB = (pdf.fileSize / (1024 * 1024)).toFixed(1);
    const uploadDate = new Date(pdf.uploadDate).toLocaleDateString('es-ES');
    
    div.innerHTML = `
        <h3 class="result-title">${pdf.title}</h3>
        <p style="color: #666; margin: 10px 0;">${pdf.description || 'Ficha técnica del producto'}</p>
        <div class="result-meta">
            <span><i class="fas fa-calendar"></i> ${uploadDate}</span>
            <span><i class="fas fa-file-pdf"></i> ${fileSizeMB} MB</span>
        </div>
        <div class="result-actions">
            <button class="btn btn-primary" onclick="window.open('${pdf.filePath}', '_blank')">
                <i class="fas fa-download"></i> Descargar
            </button>
            <button class="btn btn-secondary" onclick="window.open('${pdf.filePath}', '_blank')">
                <i class="fas fa-eye"></i> Ver
            </button>
        </div>
    `;
    
    return div;
}

// Configurar búsqueda
function configurarBusqueda() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (clearButton) clearButton.style.display = query ? 'block' : 'none';
            
            if (window.performSearch && sistemaActivo) {
                const resultados = window.performSearch(query);
                renderizarFichas(resultados);
            }
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    }
}

// Inicializar
async function inicializar() {
    console.log('🎯 Inicializando...');
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        setTimeout(() => loadingOverlay.style.display = 'none', 1000);
    }

    await cargarDatos();
    configurarBusqueda();
    renderizarFichas([]);
    
    console.log('✅ Sistema listo');
}

// Inicio
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('🚀 Búsqueda cargada');
