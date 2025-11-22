/**
 * Aplicación principal de búsqueda de PDFs
 */

class PDFSearchApp {
    constructor() {
        this.pdfs = [];
        this.filteredPDFs = [];
        this.fuzzySearch = new FuzzySearch();
        this.currentQuery = '';
        this.currentCategory = '';
        this.currentSort = 'relevance';
        this.fuzzyEnabled = true;
        this.isLoading = false;

        // Elementos del DOM
        this.searchInput = document.getElementById('searchInput');
        this.clearButton = document.getElementById('clearSearch');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.fuzzyCheckbox = document.getElementById('fuzzySearch');
        this.sortBy = document.getElementById('sortBy');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.noResults = document.getElementById('noResults');
        this.resultCount = document.getElementById('resultCount');
        this.totalDocs = document.getElementById('totalDocs');
        this.totalSize = document.getElementById('totalSize');
        this.lastUpdate = document.getElementById('lastUpdate');

        this.init();
    }

    async init() {
        console.log('🚀 Inicializando PDF Search App...');

        // Configurar event listeners
        this.setupEventListeners();

        // Esperar a que el motor local esté disponible
        await this.waitForLocalSearchEngine();

        // Cargar datos
        await this.loadPDFData();

        // Actualizar estadísticas
        this.updateStats();

        // Renderizar resultados iniciales
        this.renderResults();

        // Ocultar loading overlay y mostrar contenido
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loadingOverlay');
            const container = document.querySelector('.container');
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 300);
            }
            if (container) {
                container.classList.add('loaded');
            }
        }, 500);

        console.log('✅ PDF Search App inicializada correctamente');
    }

    async waitForLocalSearchEngine() {
        let attempts = 0;
        while (!window.localSearchEngine && attempts < 10) {
            console.log(`⏳ Esperando motor local... intento ${attempts + 1}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }

        if (!window.localSearchEngine) {
            console.error('❌ Motor local no disponible después de esperar');
            throw new Error('Motor de búsqueda local no disponible');
        } else {
            console.log('✅ Motor de búsqueda local disponible');
        }
    }

    setupEventListeners() {
        // Búsqueda en tiempo real
        this.searchInput.addEventListener('input', (e) => {
            this.currentQuery = e.target.value;
            this.clearButton.style.display = this.currentQuery ? 'block' : 'none';
            this.performSearch();
        });

        // Limpiar búsqueda
        this.clearButton.addEventListener('click', () => {
            this.searchInput.value = '';
            this.currentQuery = '';
            this.clearButton.style.display = 'none';
            this.performSearch();
        });

        // Filtro de categoría
        this.categoryFilter.addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.performSearch();
        });

        // Opción de búsqueda difusa
        this.fuzzyCheckbox.addEventListener('change', (e) => {
            this.fuzzyEnabled = e.target.checked;
            this.performSearch();
        });

        // Ordenamiento
        this.sortBy.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.performSearch();
        });

        // Funcionalidad para tags de sugerencia en "No se encontraron resultados"
        this.setupSuggestionTags();

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K para enfocar búsqueda
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput.focus();
            }

            // Escape para limpiar búsqueda
            if (e.key === 'Escape' && this.currentQuery) {
                this.searchInput.value = '';
                this.currentQuery = '';
                this.clearButton.style.display = 'none';
                this.performSearch();
            }
        });
    }

    async loadPDFData() {
        this.showLoading(true);

        try {
            // Usar datos incrustados de search-local.js en lugar de fetch
            if (window.localSearchEngine && window.localSearchEngine.data) {
                // Obtener los datos COMPLETOS del motor local (con ingredientes y beneficios)
                this.pdfs = window.localSearchEngine.data.pdfs;
                console.log(`📄 Cargados ${this.pdfs.length} PDFs del motor de búsqueda local`);

                // Verificar que los datos incluyen ingredientes y beneficios
                const samplePdf = this.pdfs[0];
                if (samplePdf && samplePdf.ingredients) {
                    console.log('✅ PDFs incluyen ingredientes y beneficios');
                } else {
                    console.log('⚠️ PDFs no incluyen datos completos de ingredientes');
                }
            } else {
                console.error('❌ Motor de búsqueda local no encontrado');
                this.pdfs = [];
            }

            // Extraer categorías únicas para el filtro
            this.populateCategoryFilter();

        } catch (error) {
            console.error('❌ Error al cargar datos de PDFs:', error);
            this.pdfs = [];
        } finally {
            this.showLoading(false);
        }
    }

    async checkAndUpdateIndex() {
        try {
            // Verificar si el índice necesita actualización
            const response = await fetch('php/check-index.php');
            const result = await response.json();

            if (result.needsUpdate) {
                console.log('🔄 El índice necesita actualización, actualizando...');
                await this.tryGenerateIndex();
            }
        } catch (error) {
            console.log('⚠️ No se pudo verificar el estado del índice:', error);
        }
    }

    async tryGenerateIndex() {
        try {
            const response = await fetch('php/generate-index.php');
            const result = await response.json();

            if (result.success) {
                console.log('✅ Índice generado correctamente');
                // Recargar datos
                await this.loadPDFData();
            } else {
                console.error('❌ Error al generar índice:', result.message);
            }
        } catch (error) {
            console.error('❌ No se pudo generar el índice:', error);
        }
    }

    populateCategoryFilter() {
        const categories = [...new Set(this.pdfs.map(pdf => pdf.category).filter(cat => cat))];

        // Limpiar opciones existentes
        this.categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';

        // Añadir categorías
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            this.categoryFilter.appendChild(option);
        });
    }

    performSearch() {
        console.log('🔍 Realizando búsqueda:', {
            query: this.currentQuery,
            category: this.currentCategory,
            fuzzy: this.fuzzyEnabled,
            sort: this.currentSort
        });

        // Si hay motor local y hay consulta, usarlo directamente
        if (window.localSearchEngine && this.currentQuery && this.currentQuery.trim()) {
            console.log('🎯 Usando motor de búsqueda local para:', this.currentQuery);

            // Obtener resultados (ahora todos son PDFs individuales)
            const searchResults = window.performSearch(this.currentQuery);
            console.log(`📄 Se encontraron ${searchResults.length} resultados`);

            // Verificar si algunos vienen de programas
            const adarResults = searchResults.filter(result => result._programSource === 'program_adar');
            const basicosResults = searchResults.filter(result => result._programSource === 'program_basicos');

            if (adarResults.length > 0) {
                console.log(`🎯 ${adarResults.length} resultados vienen del PROGRAMA ADAR`);
            }

            if (basicosResults.length > 0) {
                console.log(`🌿 ${basicosResults.length} resultados vienen del PROGRAMA BÁSICOS`);
            }

            this.filteredPDFs = searchResults;

            // Aplicar filtro de categoría si es necesario
            if (this.currentCategory) {
                this.filteredPDFs = this.filteredPDFs.filter(pdf => pdf.category === this.currentCategory);
            }
        } else {
            // Usar datos locales para filtrado
            this.filteredPDFs = this.pdfs.filter(pdf => {
                // Filtro de categoría
                if (this.currentCategory && pdf.category !== this.currentCategory) {
                    return false;
                }

                // Filtro de búsqueda
                if (this.currentQuery) {
                    const query = this.currentQuery.toLowerCase();
                    const titleMatch = pdf.title.toLowerCase().includes(query);
                    const filenameMatch = pdf.filename.toLowerCase().includes(query);
                    const descriptionMatch = pdf.description && pdf.description.toLowerCase().includes(query);

                    return titleMatch || filenameMatch || descriptionMatch;
                }

                return true;
            });
        }

        // Ordenar resultados
        this.sortResults();

        // Renderizar
        this.renderResults();
    }

    sortResults() {
        switch (this.currentSort) {
            case 'name':
                this.filteredPDFs.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'date':
                this.filteredPDFs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
                break;
            case 'size':
                this.filteredPDFs.sort((a, b) => b.fileSize - a.fileSize);
                break;
            case 'relevance':
            default:
                if (this.fuzzyEnabled && this.currentQuery) {
                    this.filteredPDFs.sort((a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0));
                } else {
                    this.filteredPDFs.sort((a, b) => a.title.localeCompare(b.title));
                }
                break;
        }
    }

    renderResults() {
        this.resultsContainer.innerHTML = '';

        // Si no hay PDFs individuales, mostrar mensaje de no resultados
        if (this.filteredPDFs.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron fichas técnicas</h3>
                    <p>Intenta con otros términos de búsqueda</p>
                </div>
            `;
            return;
        }

        // Mostrar número de resultados
        this.resultCount.textContent = this.filteredPDFs.length;

        // Si hay resultados del programa ADAR, mostrar un mensaje especial
        const adarResults = this.filteredPDFs.filter(pdf => pdf._programSource === 'program_adar');
        if (adarResults.length > 0) {
            const adarMessage = document.createElement('div');
            adarMessage.className = 'adar-program-indicator';
            adarMessage.innerHTML = `
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                    <i class="fas fa-star"></i>
                    <strong>🎯 PROGRAMA ADAR: Se muestran ${adarResults.length} formulaciones clave para tu bienestar integral</strong>
                </div>
            `;
            this.resultsContainer.appendChild(adarMessage);
            console.log('🎯 Mostrando indicador de PROGRAMA ADAR');
        }

        // Si hay resultados del programa BÁSICOS, mostrar un mensaje especial
        const basicosResults = this.filteredPDFs.filter(pdf => pdf._programSource === 'program_basicos');
        if (basicosResults.length > 0) {
            const basicosMessage = document.createElement('div');
            basicosMessage.className = 'basicos-program-indicator';
            basicosMessage.innerHTML = `
                <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                    <i class="fas fa-leaf"></i>
                    <strong>🌿 PROGRAMA BÁSICOS: Se muestran ${basicosResults.length} formulaciones esenciales para tu salud diaria</strong>
                </div>
            `;
            this.resultsContainer.appendChild(basicosMessage);
            console.log('🌿 Mostrando indicador de PROGRAMA BÁSICOS');
        }

        // Renderizar cada PDF como una tarjeta mejorada
        this.filteredPDFs.forEach(pdf => {
            const card = this.createEnhancedCard(pdf);
            this.resultsContainer.appendChild(card);
        });

        // Adjuntar event listeners
        this.attachCardEventListeners();
    }

    createEnhancedCard(pdf) {
        const card = document.createElement('div');
        card.className = 'result-item enhanced';

        // Formatear tamaño de archivo
        const fileSizeMB = (pdf.fileSize / (1024 * 1024)).toFixed(1);
        const uploadDate = new Date(pdf.uploadDate).toLocaleDateString('es-ES');

        // Crear badges para categorías
        const categoryBadges = pdf.categories && pdf.categories.length > 0
            ? pdf.categories.slice(0, 3).map(cat => `<span class="category-badge">${cat}</span>`).join('')
            : '<span class="category-badge">General</span>';

        // Debug: mostrar qué datos vienen
        console.log(`🔍 Datos de ${pdf.title}:`, {
            ingredients: pdf.ingredients,
            benefits: pdf.benefits,
            categories: pdf.categories
        });

        // Crear lista de ingredientes
        const ingredientsList = pdf.ingredients && pdf.ingredients.length > 0
            ? pdf.ingredients.slice(0, 5).map(ing => `<li>${ing}</li>`).join('')
            : '<li>Información no disponible</li>';

        // Crear lista de beneficios
        const benefitsList = pdf.benefits && pdf.benefits.length > 0
            ? pdf.benefits.slice(0, 4).map(ben => `<li>${ben}</li>`).join('')
            : '<li>Consultar ficha técnica</li>';

        card.innerHTML = `
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
                    <p>${pdf.description || 'Ficha técnica del producto'}</p>
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

        return card;
    }

    
    createPDFCard(pdf) {
        const fileSize = this.formatFileSize(pdf.fileSize);
        const uploadDate = this.formatDate(pdf.uploadDate);
        const category = pdf.category || 'Sin categoría';

        return `
            <div class="pdf-card" data-filename="${pdf.filename}">
                <div class="pdf-header">
                    <div class="pdf-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="pdf-title">${this.escapeHtml(pdf.title)}</div>
                </div>

                <div class="pdf-description">
                    ${this.escapeHtml(pdf.description || 'Sin descripción')}
                </div>

                <div class="pdf-meta">
                    <div class="meta-item">
                        <i class="fas fa-folder"></i>
                        <span>${this.escapeHtml(category)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${uploadDate}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-weight-hanging"></i>
                        <span>${fileSize}</span>
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
                        Descargar
                    </button>
                    <button class="view-btn" data-filename="${pdf.filename}" data-url="${pdf.filePath}" title="Ver PDF">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }

    attachCardEventListeners() {
        // Botones de descarga
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filename = e.currentTarget.dataset.filename;
                const url = e.currentTarget.dataset.url;
                this.downloadPDF(filename, url);
            });
        });

        // Botones de vista
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                this.viewPDF(url);
            });
        });
    }

    
    downloadPDF(filename, url) {
        console.log('📥 Descargando PDF:', filename);

        // Codificar URL para manejar espacios y caracteres especiales
        const downloadUrl = encodeURI(url);

        // Crear enlace temporal para descargar
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.target = '_blank';

        // Simular clic
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Mostrar notificación
        this.showNotification(`Descargando: ${filename}`, 'success');
    }

    viewPDF(url) {
        console.log('👁️ Abriendo PDF:', url);

        // Codificar URL para manejar espacios y caracteres especiales
        const viewUrl = encodeURI(url);

        // Abrir en nueva pestaña
        window.open(viewUrl, '_blank');
    }

    updateStats() {
        // Total de documentos
        this.totalDocs.textContent = this.pdfs.length;

        // Tamaño total
        const totalSize = this.pdfs.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0);
        this.totalSize.textContent = this.formatFileSize(totalSize);

        // Última actualización (intentar obtener del índice)
        this.lastUpdate.textContent = new Date().toLocaleDateString('es-ES');
    }

    showLoading(show) {
        this.isLoading = show;
        this.loadingIndicator.style.display = show ? 'block' : 'none';
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Añadir estilos
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

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    setupSuggestionTags() {
        // Configurar los tags de sugerencia cuando aparezcan
        const observer = new MutationObserver(() => {
            const suggestionTags = document.querySelectorAll('.suggestion-tag');
            suggestionTags.forEach(tag => {
                if (!tag.dataset.listenerAdded) {
                    tag.addEventListener('click', () => {
                        const searchTerm = tag.textContent.trim();
                        this.searchInput.value = searchTerm;
                        this.currentQuery = searchTerm;
                        this.clearButton.style.display = 'block';
                        this.performSearch();

                        // Hacer scroll al campo de búsqueda
                        this.searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        this.searchInput.focus();
                    });
                    tag.dataset.listenerAdded = 'true';
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar aplicación cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    window.PDFSearchApp = new PDFSearchApp();
});

// Añadir estilos para animaciones
const searchStyle = document.createElement('style');
searchStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .notification {
        animation: slideIn 0.3s ease-out;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    /* Estilos para tarjetas de programa */
    .program-result-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        border: 2px solid #4c1d95;
        color: white;
        position: relative;
        overflow: hidden;
    }

    .program-result-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: linear-gradient(90deg, #ffd700, #ffed4e, #ffd700);
        animation: shimmer 2s ease-in-out infinite;
    }

    @keyframes shimmer {
        0%, 100% { transform: translateX(-100%); }
        50% { transform: translateX(100%); }
    }

    .program-header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 25px;
    }

    .program-icon {
        font-size: 3rem;
        background: rgba(255, 255, 255, 0.2);
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
    }

    .program-title-section {
        flex: 1;
    }

    .program-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .program-description {
        font-size: 1.2rem;
        opacity: 0.9;
        margin-bottom: 15px;
        line-height: 1.5;
    }

    .program-badge {
        background: rgba(255, 215, 0, 0.3);
        color: #ffd700;
        padding: 8px 16px;
        border-radius: 25px;
        font-weight: 600;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 215, 0, 0.5);
    }

    .program-content {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 25px;
        backdrop-filter: blur(10px);
        margin-bottom: 20px;
    }

    .program-info h3 {
        color: #ffd700;
        font-size: 1.4rem;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .program-info p {
        font-size: 1.1rem;
        line-height: 1.6;
        opacity: 0.9;
    }

    .program-products h3 {
        color: #ffd700;
        font-size: 1.4rem;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .product-item {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(5px);
    }

    .product-title {
        color: #ffd700;
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 5px;
    }

    .product-category {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 4px 10px;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 500;
        display: inline-block;
        margin-bottom: 10px;
    }

    .product-description {
        font-size: 0.9rem;
        opacity: 0.9;
        margin-bottom: 15px;
        line-height: 1.4;
    }

    .product-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .product-actions .download-btn,
    .product-actions .view-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 8px 15px;
        border-radius: 8px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
    }

    .product-actions .download-btn:hover,
    .product-actions .view-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
    }

    .program-footer {
        text-align: center;
    }

    .download-all-btn {
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #4c1d95;
        border: none;
        padding: 15px 30px;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
    }

    .download-all-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 25px rgba(255, 215, 0, 0.4);
    }

    @media (max-width: 768px) {
        .program-header {
            flex-direction: column;
            text-align: center;
        }

        .program-title {
            font-size: 2rem;
        }

        .products-grid {
            grid-template-columns: 1fr;
        }

        .download-all-btn {
            width: 100%;
            justify-content: center;
        }
    }
`;
document.head.appendChild(searchStyle);