const fs = require('fs');

// Simular documentos de prueba para PETS MOVE y otros productos
const testDocs = [
    {
        title: "PETS MOVE 6600 PI ES",
        filename: "PETS MOVE 6600-PI_ES.pdf",
        category: "Pets",
        description: "Documento PDF: PETS MOVE 6600 PI ES"
    },
    {
        title: "PETS CALM 6687 PI ES",
        filename: "PETS CALM 6687-PI_ES.pdf",
        category: "Pets",
        description: "Documento PDF: PETS CALM 6687 PI ES"
    },
    {
        title: "PETS BASICS 6691 PI ES",
        filename: "PETS BASICS 6691-PI_ES.pdf",
        category: "Pets",
        description: "Documento PDF: PETS BASICS 6691 PI ES"
    },
    {
        title: "DAILY BIOBASICS 6500 PI ES",
        filename: "DAILY BIOBASICS 6500-PI_ES.pdf",
        category: "Daily",
        description: "Documento PDF: DAILY BIOBASICS 6500 PI ES"
    },
    {
        title: "DAILY VEGGIE CAPS 6193 PI ES",
        filename: "DAILY VEGGIE CAPS 6193-PI_ES.pdf",
        category: "Daily",
        description: "Documento PDF: DAILY VEGGIE CAPS 6193 PI ES"
    },
    {
        title: "VITAMIN C PLUS 1000",
        filename: "VITAMIN C PLUS 1000.pdf",
        category: "Vitamin",
        description: "Documento PDF: VITAMIN C PLUS 1000"
    },
    {
        title: "VITAMIN E COMPLEX 400",
        filename: "VITAMIN E COMPLEX 400.pdf",
        category: "Vitamin",
        description: "Documento PDF: VITAMIN E COMPLEX 400"
    }
];

// Importar la clase FuzzySearch mejorada
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

        // Mapeo especial para X-CELL
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
     * Genera variaciones de búsqueda para manejar errores comunes
     */
    generateSearchVariations(query) {
        const variations = new Set();
        const normalized = this.normalizeString(query);

        // Añadir la consulta original normalizada
        variations.add(normalized);

        // Añadir versión sin guiones
        variations.add(normalized.replace(/[-‐‑‒–—]/g, ''));

        return Array.from(variations);
    }

    /**
     * Calcula la distancia de Levenshtein entre dos cadenas
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        if (str1.length === 0) return str2.length;
        if (str2.length === 0) return str1.length;

        // Inicializar matriz
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        // Llenar matriz
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // sustitución
                        matrix[i][j - 1] + 1,     // inserción
                        matrix[i - 1][j] + 1      // eliminación
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Calcula la similitud entre dos cadenas (0 a 1)
     */
    stringSimilarity(str1, str2) {
        const normalizedStr1 = this.normalizeString(str1);
        const normalizedStr2 = this.normalizeString(str2);

        const distance = this.levenshteinDistance(normalizedStr1, normalizedStr2);
        const maxLength = Math.max(normalizedStr1.length, normalizedStr2.length);

        if (maxLength === 0) return 1;

        return 1 - (distance / maxLength);
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

        // Primero intentar coincidencia exacta con cualquier variación
        for (const variation of needleVariations) {
            if (normalizedHaystack.includes(variation)) {
                return true;
            }
        }

        // Buscar coincidencia aproximada con todas las variaciones
        const haystackWords = normalizedHaystack.split(/\s+/);

        for (const needleVariation of needleVariations) {
            const needleWords = needleVariation.split(/\s+/);

            for (const needleWord of needleWords) {
                for (const haystackWord of haystackWords) {
                    // Si el needle es muy corto, requerir coincidencia más alta
                    const adjustedThreshold = needleWord.length <= 3 ? 0.9 : useThreshold;

                    const similarity = this.stringSimilarity(needleWord, haystackWord);
                    if (similarity >= adjustedThreshold) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Maneja búsquedas de múltiples palabras con lógica AND
     */
    handleMultiWordSearch(query) {
        const words = this.normalizeString(query).split(/\s+/);

        // Si es una sola palabra, usar el método normal
        if (words.length <= 1) {
            return null;
        }

        // Filtrar palabras vacías y muy cortas
        const meaningfulWords = words.filter(word => word.length > 2);

        if (meaningfulWords.length <= 1) {
            return null;
        }

        return {
            words: meaningfulWords,
            requiresAll: true // Todas las palabras deben estar presentes
        };
    }

    /**
     * Verifica si todas las palabras de una búsqueda múltiple están presentes
     */
    containsAllWords(haystack, words) {
        const normalizedHaystack = this.normalizeString(haystack);

        return words.every(word => {
            return this.containsApproximate(normalizedHaystack, word, 0.8);
        });
    }

    /**
     * Calcula puntuación de relevancia para un PDF
     * MEJORADO: Maneja búsquedas de múltiples palabras correctamente
     */
    calculateRelevanceScore(pdf, query) {
        const normalizedQuery = this.normalizeString(query);
        let score = 0;

        // Manejar búsquedas de múltiples palabras
        const multiWordSearch = this.handleMultiWordSearch(query);

        if (multiWordSearch && multiWordSearch.requiresAll) {
            // Para búsquedas múltiples, requerir que todas las palabras estén presentes
            if (this.containsAllWords(pdf.title, multiWordSearch.words)) {
                score += 150; // Bonus alto para coincidencia exacta de todas las palabras
            } else if (this.containsAllWords(pdf.filename, multiWordSearch.words)) {
                score += 120; // Bonus alto para coincidencia en filename
            } else if (pdf.description && this.containsAllWords(pdf.description, multiWordSearch.words)) {
                score += 100; // Bonus para coincidencia en descripción
            }

            // Si no hay coincidencia de todas las palabras, NO mostrar resultados parciales
            // Esto evita mostrar todos los PETS cuando alguien busca "PETS MOVE"
            if (score === 0) {
                score = 0; // No mostrar resultados parciales para búsquedas múltiples
            }

            return score;
        }

        // Código original para búsquedas de una sola palabra
        if (this.normalizeString(pdf.title).includes(normalizedQuery)) {
            score += 100;
        }

        if (this.normalizeString(pdf.filename).includes(normalizedQuery)) {
            score += 80;
        }

        if (pdf.description && this.normalizeString(pdf.description).includes(normalizedQuery)) {
            score += 60;
        }

        // Solo aplicar búsqueda aproximada si no hay coincidencias exactas
        if (score === 0) {
            if (this.containsApproximate(pdf.title, query, 0.85)) {
                score += 70;
            }

            if (this.containsApproximate(pdf.filename, query, 0.85)) {
                score += 50;
            }

            if (pdf.description && this.containsApproximate(pdf.description, query, 0.85)) {
                score += 30;
            }
        }

        // Establecer puntuación mínima para evitar resultados irrelevantes
        if (score > 0 && score < 30) {
            score = 0;
        }

        return score;
    }
}

// Probar el nuevo sistema
const fuzzySearch = new FuzzySearch();

console.log('🧪 Probando nuevo sistema de búsqueda con múltiples palabras...\n');

// Prueba 1: PETS MOVE (debe encontrar solo PETS MOVE)
console.log('🔍 Búsqueda: "PETS MOVE"');
console.log('❌ Comportamiento antiguo: Mostraría TODOS los PETS');
console.log('✅ Comportamiento nuevo: Debe mostrar solo PETS MOVE\n');

const petsMoveResults = testDocs.filter(doc => {
    const score = fuzzySearch.calculateRelevanceScore(doc, 'PETS MOVE');
    return score > 0;
});

console.log(`📊 Resultados (${petsMoveResults.length}):`);
petsMoveResults.forEach((doc, index) => {
    const score = fuzzySearch.calculateRelevanceScore(doc, 'PETS MOVE');
    console.log(`   ${index + 1}. "${doc.title}" (Score: ${score})`);
});

// Prueba 2: PETS (debe encontrar todos los PETS)
console.log('\n🔍 Búsqueda: "PETS"');
console.log('✅ Debe mostrar todos los documentos PETS\n');

const petsResults = testDocs.filter(doc => {
    const score = fuzzySearch.calculateRelevanceScore(doc, 'PETS');
    return score > 0;
});

console.log(`📊 Resultados (${petsResults.length}):`);
petsResults.forEach((doc, index) => {
    const score = fuzzySearch.calculateRelevanceScore(doc, 'PETS');
    console.log(`   ${index + 1}. "${doc.title}" (Score: ${score})`);
});

// Prueba 3: DAILY VEGGIE (debe encontrar solo DAILY VEGGIE)
console.log('\n🔍 Búsqueda: "DAILY VEGGIE"');
console.log('✅ Debe mostrar solo DAILY VEGGIE\n');

const dailyVeggieResults = testDocs.filter(doc => {
    const score = fuzzySearch.calculateRelevanceScore(doc, 'DAILY VEGGIE');
    return score > 0;
});

console.log(`📊 Resultados (${dailyVeggieResults.length}):`);
dailyVeggieResults.forEach((doc, index) => {
    const score = fuzzySearch.calculateRelevanceScore(doc, 'DAILY VEGGIE');
    console.log(`   ${index + 1}. "${doc.title}" (Score: ${score})`);
});

// Prueba 4: VITAMIN C (debe encontrar solo VITAMIN C)
console.log('\n🔍 Búsqueda: "VITAMIN C"');
console.log('✅ Debe mostrar solo VITAMIN C\n');

const vitaminCResults = testDocs.filter(doc => {
    const score = fuzzySearch.calculateRelevanceScore(doc, 'VITAMIN C');
    return score > 0;
});

console.log(`📊 Resultados (${vitaminCResults.length}):`);
vitaminCResults.forEach((doc, index) => {
    const score = fuzzySearch.calculateRelevanceScore(doc, 'VITAMIN C');
    console.log(`   ${index + 1}. "${doc.title}" (Score: ${score})`);
});

console.log('\n✅ PRUEBA COMPLETADA');