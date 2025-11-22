/**
 * Sistema de búsqueda difusa (Fuzzy Search) en JavaScript puro
 * Versión optimizada para X-CELL y correcciones fonéticas
 */

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
     * Aplica correcciones fonéticas a una cadena
     */
    applyPhoneticCorrections(str) {
        let corrected = str.toLowerCase();

        // Aplicar correcciones de errores comunes
        for (const [error, correction] of Object.entries(this.phoneticCorrections)) {
            if (corrected.includes(error)) {
                corrected = corrected.replace(new RegExp(error, 'g'), correction);
            }
        }

        // Remover guiones
        corrected = corrected.replace(/[-‐‑‒–—]/g, '');

        return corrected;
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

        // Aplicar correcciones fonéticas
        const phonetic = this.applyPhoneticCorrections(normalized);
        variations.add(phonetic);

        // Generar variaciones comunes de errores
        const commonErrors = [
            normalized.replace(/u/g, 'o'),  // u -> o
            normalized.replace(/v/g, 'b'),  // v -> b
            normalized.replace(/b/g, 'v'),  // b -> v
            normalized.replace(/c/g, 's'),  // c -> s
            normalized.replace(/s/g, 'c'),  // s -> c
        ];

        commonErrors.forEach(variation => variations.add(variation));

        return Array.from(variations);
    }

    /**
     * Verifica si una cadena contiene aproximadamente otra
     * Incluye correcciones fonéticas y manejo de guiones
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

        // Para consultas cortas (como "xcell"), también buscar en el haystack sin guiones
        if (needle.length <= 6) {
            const haystackWithoutHyphens = normalizedHaystack.replace(/[-‐‑‒–—]/g, '');
            for (const variation of needleVariations) {
                if (haystackWithoutHyphens.includes(variation)) {
                    return true;
                }
            }
        }

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

        // Coincidencia exacta en descripción
        if (pdf.description && this.normalizeString(pdf.description).includes(normalizedQuery)) {
            score += 60;
        }

        // Solo aplicar búsqueda aproximada si no hay coincidencias exactas
        if (score === 0) {
            // Búsqueda aproximada especial para X-CELL
            if (this.handleXCellSearch(query)) {
                if (this.containsApproximate(pdf.title, query, 0.85)) {
                    score += 100;
                }
            } else {
                // Coincidencia aproximada estricta en título
                if (this.containsApproximate(pdf.title, query, 0.85)) {
                    score += 70;
                }
            }

            // Coincidencia aproximada estricta en nombre de archivo
            if (this.containsApproximate(pdf.filename, query, 0.85)) {
                score += 50;
            }

            // Coincidencia aproximada en descripción
            if (pdf.description && this.containsApproximate(pdf.description, query, 0.85)) {
                score += 30;
            }

            // Bonus por coincidencia de categoría (solo si es extremadamente relevante)
            if (pdf.category && this.containsApproximate(pdf.category, query, 0.95)) {
                score += 25;
            }

            // Bonus por coincidencia de tags (solo si es extremadamente relevante)
            if (pdf.tags && Array.isArray(pdf.tags)) {
                for (const tag of pdf.tags) {
                    if (this.containsApproximate(tag, query, 0.95)) {
                        score += 15;
                    }
                }
            }
        }

        // Establecer puntuación mínima para evitar resultados irrelevantes
        if (score > 0 && score < 50) {
            score = 0; // Ignorar coincidencias muy débiles
        }

        return score;
    }

    /**
     * Extrae palabras clave de una cadena
     */
    extractKeywords(text) {
        return this.normalizeString(text)
            .split(/\s+/)
            .filter(word => word.length > 2);
    }

    /**
     * Establece el umbral de similitud
     */
    setThreshold(threshold) {
        this.threshold = Math.max(0.1, Math.min(1, threshold));
    }

    /**
     * Obtiene el umbral actual
     */
    getThreshold() {
        return this.threshold;
    }
}

// Exportar para uso global
window.FuzzySearch = FuzzySearch;