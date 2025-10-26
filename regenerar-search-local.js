const fs = require('fs');

console.log('🔄 REGENERANDO SEARCH-LOCAL.JS LIMPIO');
console.log('===================================\n');

// Cargar el índice limpio
const indexData = JSON.parse(fs.readFileSync('./data/pdf-index.json', 'utf8'));

console.log(`📊 PDFs en índice: ${indexData.pdfs.length}`);

// Plantilla del search-local.js
const template = `// Sistema de búsqueda local con datos incrustados
console.log('🔍 Iniciando búsqueda local con datos incrustados...');

// Función de búsqueda optimizada
class LocalSearchEngine {
    constructor() {
        this.data = null;
        this.init();
    }

    init() {
        // Datos incrustados directamente - ACTUALIZADO AUTOMÁTICAMENTE
        const embeddedData = ${JSON.stringify(indexData, null, 6)};

        this.data = embeddedData;
        console.log(\`✅ Datos cargados: \${this.data.total_pdfs} productos\`);
    }

    // Búsqueda exacta y por coincidencias
    search(query) {
        if (!this.data || !this.data.pdfs) {
            console.error('❌ No hay datos disponibles para búsqueda');
            return [];
        }

        const normalizedQuery = query.toLowerCase().trim();
        if (normalizedQuery.length === 0) return [];

        const results = [];

        this.data.pdfs.forEach(pdf => {
            let score = 0;
            const searchableText = [
                pdf.title,
                pdf.description,
                ...(pdf.keywords || []),
                ...(pdf.ingredients || []),
                ...(pdf.benefits || [])
            ].join(' ').toLowerCase();

            // Búsqueda exacta
            if (searchableText.includes(normalizedQuery)) {
                score += 10;
            }

            // Búsqueda por palabras individuales
            const queryWords = normalizedQuery.split(' ');
            queryWords.forEach(word => {
                if (searchableText.includes(word)) {
                    score += 5;
                }
            });

            // Búsqueda en título (máxima prioridad)
            if (pdf.title.toLowerCase().includes(normalizedQuery)) {
                score += 20;
            }

            if (score > 0) {
                results.push({
                    ...pdf,
                    score: score
                });
            }
        });

        // Ordenar por relevancia
        return results.sort((a, b) => b.score - a.score);
    }

    // Búsqueda por categoría
    searchByCategory(category) {
        if (!this.data || !this.data.pdfs) return [];

        return this.data.pdfs.filter(pdf =>
            pdf.category === category ||
            (pdf.categories && pdf.categories.includes(category))
        );
    }

    // Obtener todas las categorías
    getCategories() {
        if (!this.data || !this.data.pdfs) return [];

        const categories = new Set();
        this.data.pdfs.forEach(pdf => {
            if (pdf.category) categories.add(pdf.category);
            if (pdf.categories) {
                pdf.categories.forEach(cat => categories.add(cat));
            }
        });

        return Array.from(categories).sort();
    }
}

// Crear instancia global del motor de búsqueda
window.localSearchEngine = new LocalSearchEngine();

// Función global para búsqueda
window.performSearch = function(query) {
    return window.localSearchEngine.search(query);
};

// Función para obtener categorías
window.getCategories = function() {
    return window.localSearchEngine.getCategories();
};

console.log('✅ Motor de búsqueda local inicializado');
`;

// Hacer backup del archivo actual
if (fs.existsSync('./js/search-local.js')) {
    fs.writeFileSync('./js/search-local.js.backup', fs.readFileSync('./js/search-local.js'));
    console.log('💾 Backup creado: search-local.js.backup');
}

// Escribir nuevo archivo limpio
fs.writeFileSync('./js/search-local.js', template);

console.log('✅ search-local.js regenerado correctamente');
console.log(`📊 Total PDFs: ${indexData.pdfs.length}`);
console.log(`🗑️  Eliminados: 146 - ${indexData.pdfs.length} = ${146 - indexData.pdfs.length} archivos no existentes`);

console.log('\n✨ ¡REGENERACIÓN COMPLETADA!');
console.log('🚀 El buscador ahora solo mostrará archivos que existen físicamente\n');