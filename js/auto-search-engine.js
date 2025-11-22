/**
 * MOTOR DE BÚSQUEDA AUTOMÁTICO - LifePlus PDF
 * Sistema de búsqueda automático que funciona con auto-indexer.php
 * Sin intervención manual requerida
 */

class AutoSearchEngine {
    constructor() {
        this.data = null;
        this.loaded = false;
        this.loading = false;
        this.lastLoadTime = 0;
        this.refreshInterval = 5 * 60 * 1000; // 5 minutos
        this.initialize();
    }

    async initialize() {
        console.log('🚀 Inicializando motor de búsqueda automático...');
        await this.loadData();

        // Auto-refrescar datos periódicamente
        setInterval(() => {
            this.checkForUpdates();
        }, this.refreshInterval);

        // Forzar carga inicial
        setTimeout(() => {
            if (!this.loaded) {
                console.log('⚠️ Reintentando carga...');
                this.loadData();
            }
        }, 2000);
    }

    async loadData() {
        if (this.loading) {
            console.log('⏳ Ya está cargando...');
            return;
        }

        this.loading = true;
        console.log('📥 Cargando índice de PDFs...');

        try {
            const response = await fetch('data/pdf-index.json?' + Date.now());

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data || !data.pdfs || !Array.isArray(data.pdfs)) {
                throw new Error('Formato de índice inválido');
            }

            this.data = data;
            this.loaded = true;
            this.lastLoadTime = Date.now();

            console.log(`✅ Índice cargado: ${data.pdfs.length} PDFs encontrados`);

            // Disparar evento global
            window.dispatchEvent(new CustomEvent('searchEngineLoaded', {
                detail: {
                    count: data.pdfs.length,
                    lastUpdate: data.lastUpdate || new Date().toISOString()
                }
            }));

            // Notificar al sistema
            this.notifySearchSystem();

        } catch (error) {
            console.error('❌ Error cargando índice:', error);
            this.loaded = false;

            // Intentar con datos de caché si existen
            this.tryLoadCachedData();
        } finally {
            this.loading = false;
        }
    }

    tryLoadCachedData() {
        try {
            const cached = localStorage.getItem('pdfIndexCache');
            if (cached) {
                const data = JSON.parse(cached);
                this.data = data;
                this.loaded = true;
                console.log('📦 Usando datos en caché temporalmente');
            }
        } catch (e) {
            console.warn('⚠️ No hay caché disponible');
        }
    }

    async checkForUpdates() {
        try {
            const response = await fetch('data/pdf-index.json?' + Date.now(), {
                method: 'HEAD'
            });

            const lastModified = response.headers.get('last-modified');
            const cacheKey = 'lastIndexUpdate';
            const lastUpdate = localStorage.getItem(cacheKey);

            if (lastModified && lastModified !== lastUpdate) {
                console.log('🔄 Se detectaron cambios, actualizando...');
                await this.loadData();
                localStorage.setItem(cacheKey, lastModified);
            }
        } catch (error) {
            console.warn('⚠️ No se pudo verificar actualizaciones:', error);
        }
    }

    notifySearchSystem() {
        // Hacer disponible globalmente - COMPATIBILIDAD TOTAL
        window.autoSearchEngine = this;
        window.universalSearchEngine = this;
        window.localSearchEngine = this; // Compatibilidad con search.js
        window.pdfSearchApp = this; // Compatibilidad adicional

        // Crear performSearch global si no existe
        if (!window.performSearch) {
            window.performSearch = (query) => this.search(query);
        }

        // Añadir datos en formato esperado por search.js
        this.pdfs = this.data.pdfs || [];

        // Disparar evento que search.js espera
        if (window.dispatchEvent) {
            window.dispatchEvent(new Event('localSearchEngineLoaded'));
        }

        // Disparar búsqueda inicial si hay texto
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim()) {
            setTimeout(() => {
                const event = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(event);
            }, 500);
        }
    }

    search(query, options = {}) {
        if (!this.loaded || !this.data || !this.data.pdfs) {
            console.warn('⚠️ Motor no cargado, intentando recargar...');
            this.loadData();
            return [];
        }

        const {
            fuzzy = true,
            limit = 50,
            category = null,
            sortBy = 'relevance'
        } = options;

        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm) {
            return [];
        }

        console.log(`🔍 Buscando: "${query}" (fuzzy: ${fuzzy}, limit: ${limit})`);

        let results = this.data.pdfs.filter(pdf => {
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

            // Búsqueda fuzzy (similitud aproximada)
            if (fuzzy) {
                return this.fuzzyMatch(searchTerm, searchFields) ||
                       this.fuzzyMatchTerms(searchTerms, searchFields);
            }

            return false;
        });

        // Calcular puntuación de relevancia
        results = results.map(pdf => {
            const score = this.calculateRelevanceScore(pdf, searchTerm, options);
            return { ...pdf, _relevanceScore: score };
        });

        // Ordenar por relevancia
        results.sort((a, b) => b._relevanceScore - a._relevanceScore);

        // Limitar resultados
        if (limit > 0) {
            results = results.slice(0, limit);
        }

        console.log(`✅ ${results.length} resultados encontrados para "${query}"`);
        return results;
    }

    fuzzyMatch(query, text, threshold = 0.6) {
        // Implementación simple de fuzzy matching
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

    fuzzyMatchTerms(terms, text) {
        // Al menos la mitad de los términos deben coincidir
        const matchedTerms = terms.filter(term =>
            this.fuzzyMatch(term, text, 0.5) || text.includes(term)
        );
        return matchedTerms.length >= Math.ceil(terms.length / 2);
    }

    calculateRelevanceScore(pdf, searchTerm, options) {
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

        // Coincidencia en descripción (+20)
        if ((pdf.description || '').toLowerCase().includes(searchTerm)) {
            score += 20;
        }

        // BONUS: Coincidencia exacta completa
        if (searchFields === searchTerm) {
            score += 200;
        }

        // BONUS: Coincidencia al inicio del texto
        if (searchFields.startsWith(searchTerm)) {
            score += 50;
        }

        // Penalizar documentos antiguos (opcional)
        if (pdf.uploadDate) {
            const daysOld = (Date.now() - new Date(pdf.uploadDate)) / (1000 * 60 * 60 * 24);
            score -= Math.min(daysOld / 100, 10);
        }

        return Math.max(0, score);
    }

    // Métodos auxiliares
    getCategories() {
        if (!this.loaded || !this.data) return [];
        return [...new Set(this.data.pdfs.map(pdf => pdf.category).filter(Boolean))];
    }

    getBrands() {
        if (!this.loaded || !this.data) return [];
        return [...new Set(this.data.pdfs.map(pdf => pdf.brand).filter(Boolean))];
    }

    getStats() {
        if (!this.loaded || !this.data) return null;

        return {
            total: this.data.pdfs.length,
            categories: this.getCategories().length,
            lastUpdate: this.data.lastUpdate || new Date().toISOString(),
            size: this.data.pdfs.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0)
        };
    }

    async forceRefresh() {
        console.log('🔄 Forzando actualización manual...');
        localStorage.removeItem('pdfIndexCache');
        localStorage.removeItem('lastIndexUpdate');
        return await this.loadData();
    }
}

// Inicializar automáticamente cuando el DOM esté listo
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        window.autoSearchEngine = new AutoSearchEngine();
    });
}

// Crear inmediatamente un placeholder para localSearchEngine para que search.js no falle
if (!window.localSearchEngine) {
    window.localSearchEngine = {
        data: { pdfs: [] },
        search: function(query) { return []; }
    };
}

// También inicializar inmediatamente si el DOM ya está cargado
if (document.readyState === 'loading') {
    // Esperar al evento DOMContentLoaded
} else {
    // El DOM ya está cargado, inicializar ahora
    if (!window.autoSearchEngine) {
        window.autoSearchEngine = new AutoSearchEngine();
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoSearchEngine;
}