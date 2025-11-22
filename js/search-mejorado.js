/**
 * Buscador Mejorado - Encuentra "Menaplus" aunque esté escrito diferente
 */

class ImprovedSearchEngine {
    constructor() {
        this.data = null;
        this.init();
    }

    init() {
        // Cargar datos del índice
        this.loadIndex();
    }

    async loadIndex() {
        try {
            const response = await fetch('../data/pdf-index.json');
            const data = await response.json();
            this.data = data;
            console.log('✅ Índice cargado:', data.total_pdfs, 'PDFs');
        } catch (error) {
            console.error('❌ Error al cargar índice:', error);
        }
    }

    search(query, options = {}) {
        if (!this.data || !this.data.pdfs) return [];

        const { category = '', fuzzy = true, limit = 100 } = options;
        let results = this.data.pdfs;

        // Filtrar por categoría
        if (category) {
            results = results.filter(pdf =>
                pdf.category && pdf.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            results = results.filter(pdf => {
                // Crear texto searchable mejorado
                const searchableText = this.createSearchableText(pdf);

                // Búsqueda normal
                if (searchableText.includes(searchTerm)) {
                    return true;
                }

                // Búsqueda flexible para "Menaplus"
                if (this.isMenaplusMatch(searchTerm, searchableText)) {
                    return true;
                }

                // Búsqueda con variaciones
                if (this.hasVariations(searchTerm, searchableText)) {
                    return true;
                }

                return false;
            });
        }

        return results.slice(0, limit);
    }

    createSearchableText(pdf) {
        const parts = [
            pdf.title || '',
            pdf.description || '',
            pdf.filename || '',
            (pdf.ingredients || []).join(' '),
            (pdf.benefits || []).join(' '),
            (pdf.keywords || []).join(' '),
            (pdf.tags || []).join(' ')
        ];

        return parts.join(' ').toLowerCase();
    }

    isMenaplusMatch(searchTerm, searchableText) {
        // Variaciones de "mena" y "menaplus"
        const menaVariations = [
            'mena', 'menaplus', 'menaplu', 'menapl', 'men a', 'men-a'
        ];

        const searchVariations = [
            'mena', 'menaplus', 'mena plus', 'menaplu', 'menapl', 'men a'
        ];

        // Si busca algo relacionado con "mena"
        const isMenaSearch = menaVariations.some(variation =>
            searchTerm.includes(variation)
        );

        // Si el texto contiene algo relacionado con "mena"
        const hasMenaText = searchVariations.some(variation =>
            searchableText.includes(variation)
        );

        return isMenaSearch && hasMenaText;
    }

    hasVariations(searchTerm, searchableText) {
        // Quitar espacios, puntos y guiones para comparar
        const cleanSearch = searchTerm.replace(/[\s\.\-]/g, '');
        const cleanText = searchableText.replace(/[\s\.\-]/g, '');

        if (cleanText.includes(cleanSearch)) {
            return true;
        }

        // Búsqueda por partes
        const searchParts = searchTerm.split(/[\s\.\-]/);
        return searchParts.every(part =>
            part.length < 2 || cleanText.includes(part)
        );
    }

    getCategories() {
        if (!this.data || !this.data.pdfs) return [];
        const categories = this.data.pdfs.map(pdf => pdf.category || 'General');
        return [...new Set(categories)].sort();
    }

    getStats() {
        if (!this.data) return null;
        return {
            total_pdfs: this.data.total_pdfs,
            total_size: this.data.total_size,
            categories: this.getCategories(),
            last_update: this.data.generated_at
        };
    }
}

// Reemplazar el buscador existente
if (window.localSearchEngine) {
    const improvedEngine = new ImprovedSearchEngine();

    // Esperar a que cargue
    setTimeout(() => {
        if (improvedEngine.data) {
            console.log('🚀 Buscador mejorado activado');
            console.log('✅ Ahora encuentra "Menaplus" con diferentes variaciones');

            // Probar búsqueda automática
            const testResults = improvedEngine.search('mena');
            console.log('🔍 Búsqueda test "mena":', testResults.length, 'resultados');
            testResults.forEach(pdf => console.log('📄', pdf.filename));
        }
    }, 1000);
}

// Función global para buscar
window.searchPDFs = function(query, options = {}) {
    if (window.improvedSearchEngine) {
        return window.improvedSearchEngine.search(query, options);
    }
    return [];
};