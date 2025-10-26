const fs = require('fs');

// Simular cómo debería ser el índice del servidor con los documentos X-CELL
console.log('🔍 Verificando documentos X-CELL que deberían estar en el servidor...');

// Los documentos que mencionaste
const xcellDocs = [
    {
        title: "X Cell con polvo de raíz de remolacha 6600 PI ES",
        filename: "X-Cell™ con polvo de raíz de remolacha 6600-PI_ES.pdf",
        category: "General",
        description: "Documento PDF: X Cell con polvo de raíz de remolacha 6600 PI ES"
    },
    {
        title: "X CELL CÍTRICOS 6357 PI ES",
        filename: "X-CELL CÍTRICOS 6357-PI_ES.pdf",
        category: "General",
        description: "Documento PDF: X CELL CÍTRICOS 6357 PI ES"
    }
];

console.log('📋 Documentos X-CELL que deberían existir:');
xcellDocs.forEach((doc, index) => {
    console.log(`${index + 1}. "${doc.title}"`);
    console.log(`   Filename: ${doc.filename}`);
    console.log(`   Categoría: ${doc.category}`);
    console.log('');
});

// Probar búsqueda con el algoritmo actual
class FuzzySearch {
    constructor() {
        this.threshold = 0.85;

        // Mapeo de correcciones fonéticas comunes
        this.phoneticCorrections = {
            'urbiq': 'ubiq',    // urbiquinol -> ubiquinol
            'urbin': 'ubin',    // urbinol -> ubiquinol
            'ubiq': 'ubiquin',  // ubiq -> ubiquinol
            'vit': 'vitamin',   // vit -> vitamin
            'proant': 'proanthenols', // proant -> proanthenols
            'xcel': 'xcell',    // xcel -> xcell
            'xsel': 'xcell',    // xsel -> xcell
            'tvn': 'tvm',       // tvn -> tvm
            'coq': 'coq10',     // coq -> coq10
            'epa': 'epa',       // epa -> epa
            'dha': 'dha',       // dha -> dha
            'omg': 'omega',      // omg -> omega
            'mag': 'magnesium', // mag -> magnesium
            'cal': 'calcium'    // cal -> calcium
        };

        // Mapeo especial para X-CELL - más agresivo
        this.xcellMappings = {
            'xcell': 'x cell',
            'x-cell': 'x cell',
            'x cell': 'x cell',
            'xcelll': 'x cell',
            'xcel': 'x cell',
            'xsel': 'x cell'
        };
    }

    /**
     * Normaliza cadena: minúsculas, sin acentos, sin caracteres especiales
     */
    normalizeString(str) {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
            .replace(/[^\w\s]/g, ' ') // Reemplazar caracteres especiales con espacios
            .replace(/\s+/g, ' ') // Eliminar espacios múltiples
            .trim();
    }

    /**
     * Manejo especial para X-CELL
     */
    handleXCellSearch(query) {
        const normalized = this.normalizeString(query);

        // Si es claramente una búsqueda de X-CELL
        if (normalized.includes('xcell') || normalized.includes('x cel') || normalized.includes('x-cell')) {
            return ['x cell'];
        }

        // Aplicar mapeos especiales de X-CELL
        for (const [key, value] of Object.entries(this.xcellMappings)) {
            if (normalized.includes(key)) {
                return [value];
            }
        }

        return null;
    }

    /**
     * Genera variaciones de búsqueda para manejar errores comunes
     */
    generateSearchVariations(query) {
        const variations = new Set();
        const normalized = this.normalizeString(query);

        // Manejo especial para X-CELL
        const xcellVariations = this.handleXCellSearch(query);
        if (xcellVariations) {
            xcellVariations.forEach(variation => variations.add(variation));
            return Array.from(variations);
        }

        // Añadir la consulta original normalizada
        variations.add(normalized);

        // Añadir versión sin guiones
        variations.add(normalized.replace(/[-‐‑‒–—]/g, ''));

        return Array.from(variations);
    }

    /**
     * Verifica si una cadena contiene aproximadamente otra
     */
    containsApproximate(haystack, needle, threshold = null) {
        if (!needle || needle.length < 2) return false;

        const useThreshold = threshold || this.threshold;
        const normalizedHaystack = this.normalizeString(haystack);

        // Generar variaciones de búsqueda para el needle
        const needleVariations = this.generateSearchVariations(needle);

        console.log(`🔍 Buscando "${needle}" - Variaciones:`, needleVariations);

        // Primero intentar coincidencia exacta con cualquier variación
        for (const variation of needleVariations) {
            if (normalizedHaystack.includes(variation)) {
                console.log(`✅ Coincidencia exacta: "${variation}"`);
                return true;
            }
        }

        console.log(`❌ No se encontró coincidencia para "${needle}"`);
        return false;
    }

    /**
     * Calcula puntuación de relevancia para un PDF
     */
    calculateRelevanceScore(pdf, query) {
        const normalizedQuery = this.normalizeString(query);
        let score = 0;

        // Coincidencia exacta en título (máxima puntuación)
        if (this.normalizeString(pdf.title).includes(normalizedQuery)) {
            score += 100;
        }

        // Coincidencia exacta en nombre de archivo
        if (this.normalizeString(pdf.filename).includes(normalizedQuery)) {
            score += 80;
        }

        // Búsqueda aproximada especial para X-CELL
        if (this.handleXCellSearch(query)) {
            if (this.containsApproximate(pdf.title, query, 0.85)) {
                score += 100;
            }
        } else if (score === 0) {
            // Coincidencia aproximada estricta en título
            if (this.containsApproximate(pdf.title, query, 0.85)) {
                score += 70;
            }
        }

        // Establecer puntuación mínima para evitar resultados irrelevantes
        if (score > 0 && score < 50) {
            score = 0;
        }

        return score;
    }
}

// Probar con los documentos X-CELL
const fuzzySearch = new FuzzySearch();

console.log('🧪 Probando búsqueda "xcell" con documentos reales:');

xcellDocs.forEach((doc, index) => {
    console.log(`\n📄 Documento ${index + 1}: "${doc.title}"`);

    const normalizedTitle = fuzzySearch.normalizeString(doc.title);
    console.log(`   Normalizado: "${normalizedTitle}"`);

    const score = fuzzySearch.calculateRelevanceScore(doc, 'xcell');
    console.log(`   Puntuación para "xcell": ${score}`);

    if (score > 0) {
        console.log('   ✅ ENCONTRADO');
    } else {
        console.log('   ❌ NO ENCONTRADO');
    }
});

console.log('\n🧪 Probando variaciones de búsqueda:');
const queries = ['xcell', 'X-CELL', 'x-cell', 'XCELL', 'x cell'];

queries.forEach(query => {
    console.log(`\n🔍 Buscando: "${query}"`);

    const results = xcellDocs.filter(pdf => {
        const score = fuzzySearch.calculateRelevanceScore(pdf, query);
        return score > 0;
    });

    console.log(`📊 Resultados: ${results.length}`);
    results.forEach((doc, index) => {
        const score = fuzzySearch.calculateRelevanceScore(doc, query);
        console.log(`   ${index + 1}. "${doc.title}" (Score: ${score})`);
    });
});