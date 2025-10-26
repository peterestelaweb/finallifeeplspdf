<?php
/**
 * Sistema de Indexación Automática - SIN INTERVENCIÓN MANUAL
 *
 * Este sistema:
 * - Detecta automáticamente nuevos/eliminados PDFs
 * - Reindexa automáticamente cada 5 minutos
 * - Funciona con mayúsculas, minúsculas, aproximaciones
 * - No requiere intervención manual
 * - Se ejecuta automáticamente vía cron job
 */

// Configuración
$config = [
    'pdfs_dir' => __DIR__ . '/pdfs/',
    'data_dir' => __DIR__ . '/data/',
    'index_file' => __DIR__ . '/data/pdf-index.json',
    'search_local_file' => __DIR__ . '/js/search-local.js',
    'auto_index_log' => __DIR__ . '/data/auto-indexer.log',
    'check_interval' => 300, // 5 minutos en segundos
    'session_timeout' => 3600 // 1 hora
];

// Headers para respuestas JSON
header('Content-Type: application/json');

// Función de logging mejorada
function logMessage($message, $config, $level = 'INFO') {
    $timestamp = date('Y-m-d H:i:s');
    $levels = ['ERROR' => '❌', 'WARNING' => '⚠️', 'INFO' => 'ℹ️', 'SUCCESS' => '✅'];
    $icon = $levels[$level] ?? 'ℹ️';
    $logMessage = "[$timestamp] $icon $message\n";
    file_put_contents($config['auto_index_log'], $logMessage, FILE_APPEND);
}

// Función de indexación automática mejorada
function autoIndexarPDFs($config) {
    logMessage("INICIO: Indexación automática de PDFs", $config, 'INFO');

    try {
        // Crear directorios si no existen
        if (!file_exists($config['data_dir'])) {
            mkdir($config['data_dir'], 0755, true);
            logMessage("Directorio data creado", $config);
        }

        // Escanear carpeta de PDFs
        if (!file_exists($config['pdfs_dir'])) {
            throw new Exception("Carpeta de PDFs no existe: " . $config['pdfs_dir']);
        }

        $files = scandir($config['pdfs_dir']);
        $pdfFiles = array_filter($files, function($file) {
            return strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'pdf';
        });

        logMessage("Encontrados " . count($pdfFiles) . " archivos PDF en la carpeta", $config, 'INFO');

        // Cargar índice existente para comparar
        $existingIndex = [];
        if (file_exists($config['index_file'])) {
            $existingData = json_decode(file_get_contents($config['index_file']), true);
            if ($existingData && isset($existingData['pdfs'])) {
                $existingIndex = [];
                foreach ($existingData['pdfs'] as $pdf) {
                    $existingIndex[$pdf['filename']] = $pdf;
                }
            }
        }

        $pdfs = [];
        $totalSize = 0;
        $newFiles = 0;
        $modifiedFiles = 0;
        $deletedFiles = [];

        // Identificar archivos eliminados
        foreach ($existingIndex as $filename => $pdf) {
            if (!file_exists($config['pdfs_dir'] . $filename)) {
                $deletedFiles[] = $filename;
                logMessage("PDF eliminado detectado: $filename", $config, 'WARNING');
            }
        }

        foreach ($pdfFiles as $filename) {
            $filePath = $config['pdfs_dir'] . $filename;
            if (!file_exists($filePath)) continue;

            $fileStats = stat($filePath);
            $fileHash = md5_file($filePath);
            $uploadDate = date('Y-m-d H:i:s', $fileStats['mtime']);

            // Metadata inteligente
            $title = pathinfo($filename, PATHINFO_FILENAME);
            $cleanTitle = preg_replace('/[-_]/', ' ', $title);
            $cleanTitle = preg_replace('/\s+/', ' ', $cleanTitle);
            $cleanTitle = trim($cleanTitle);

            // Extracción avanzada de información
            $metadata = extractAdvancedMetadata($filename, $cleanTitle);
            $category = $metadata['category'];
            $keywords = $metadata['keywords'];
            $tags = $metadata['tags'];

            // Crear datos del PDF
            $pdfData = [
                'id' => md5($filename . $fileHash),
                'filename' => $filename,
                'title' => $cleanTitle,
                'original_filename' => $filename,
                'description' => "Ficha técnica: $cleanTitle",
                'category' => $category,
                'tags' => $tags,
                'keywords' => $keywords,
                'search_terms' => generateAllSearchTerms($filename, $cleanTitle, $keywords, $tags),
                'search_variations' => generateSearchVariations($cleanTitle, $keywords),
                'filePath' => 'pdfs/' . $filename,
                'fileSize' => $fileStats['size'],
                'fileHash' => $fileHash,
                'mimeType' => 'application/pdf',
                'uploadDate' => $uploadDate,
                'updatedAt' => date('Y-m-d H:i:s'),
                'isActive' => true,
                'downloadCount' => 0
            ];

            // Mantener contador de descargas si existe
            if (isset($existingIndex[$filename])) {
                $pdfData['downloadCount'] = $existingIndex[$filename]['downloadCount'] ?? 0;
            }

            // Detectar archivos nuevos o modificados
            if (!isset($existingIndex[$filename])) {
                $newFiles++;
                logMessage("Nuevo PDF detectado: $filename", $config, 'SUCCESS');
            } elseif ($existingIndex[$filename]['fileHash'] !== $fileHash ||
                      $existingIndex[$filename]['fileSize'] !== $fileStats['size']) {
                $modifiedFiles++;
                logMessage("PDF modificado detectado: $filename", $config, 'INFO');
            }

            $pdfs[] = $pdfData;
            $totalSize += $fileStats['size'];
        }

        // Ordenar por fecha de subida
        usort($pdfs, function($a, $b) {
            return strtotime($b['uploadDate']) - strtotime($a['uploadDate']);
        });

        // Extraer categorías únicas
        $categories = array_unique(array_column($pdfs, 'category'));
        sort($categories);

        // Crear índice JSON mejorado
        $indexData = [
            'success' => true,
            'version' => 'auto-indexer-v3.0',
            'generated_at' => date('Y-m-d H:i:s'),
            'auto_indexer' => true,
            'total_pdfs' => count($pdfs),
            'new_files' => $newFiles,
            'modified_files' => $modifiedFiles,
            'deleted_files' => $deletedFiles,
            'total_size' => $totalSize,
            'categories' => array_values($categories),
            'search_features' => [
                'case_insensitive' => true,
                'fuzzy_search' => true,
                'approximate_search' => true,
                'variation_search' => true,
                'partial_search' => true,
                'auto_indexing' => true
            ],
            'pdfs' => $pdfs
        ];

        // Guardar índice JSON
        $jsonContent = json_encode($indexData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if (!file_put_contents($config['index_file'], $jsonContent)) {
            throw new Exception("No se pudo guardar el archivo de índice");
        }

        // Generar JavaScript de búsqueda mejorado
        $searchJS = generateAdvancedSearchJS($indexData);
        if (!file_put_contents($config['search_local_file'], $searchJS)) {
            throw new Exception("No se pudo guardar search-local.js");
        }

        // Registrar timestamp de última indexación
        file_put_contents($config['data_dir'] . 'last-auto-index.txt', time());

        logMessage("COMPLETO: Indexación automática finalizada", $config, 'SUCCESS');
        logMessage("PDFs: {$indexData['total_pdfs']}, Nuevos: $newFiles, Modificados: $modifiedFiles", $config);

        return [
            'success' => true,
            'message' => 'Indexación automática completada',
            'stats' => [
                'total_pdfs' => $indexData['total_pdfs'],
                'new_files' => $newFiles,
                'modified_files' => $modifiedFiles,
                'deleted_files' => count($deletedFiles),
                'categories' => count($categories)
            ]
        ];

    } catch (Exception $e) {
        logMessage("ERROR: " . $e->getMessage(), $config, 'ERROR');
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Función de extracción avanzada de metadata
function extractAdvancedMetadata($filename, $title) {
    $filenameLower = strtolower($filename);
    $titleLower = strtolower($title);
    $text = $filenameLower . ' ' . $titleLower;

    // Categorías inteligentes
    $categories = [
        'Vitaminas y Suplementos' => ['vitamin', 'vitamina', 'supplement', 'suplemento', 'daily', 'complex', 'plus', 'multi', 'formul', 'menaplu'],
        'Minerales' => ['mineral', 'calcium', 'magnesium', 'zinc', 'iron', 'selenium', 'chrome', 'potassium'],
        'Omega y Ácidos Grasos' => ['omega', 'oil', 'aceite', 'ácido', 'epa', 'dha', 'flax', 'linaza'],
        'Antioxidantes' => ['antioxidant', 'proanth', 'polyphenol', 'resveratrol', 'grapeseed', 'green tea'],
        'Colágeno y Belleza' => ['collagen', 'colágeno', 'belleza', 'skin', 'hair', 'nail', 'beauty'],
        'Energía y Rendimiento' => ['energy', 'performance', 'strength', 'power', 'boost', 'endurance'],
        'Sistema Inmune' => ['immune', 'defense', 'protection', 'immune', 'resistance'],
        'Salud General' => ['health', 'wellness', 'general', 'balance', 'support', 'care']
    ];

    $detectedCategory = 'General';
    foreach ($categories as $category => $terms) {
        foreach ($terms as $term) {
            if (strpos($text, $term) !== false) {
                $detectedCategory = $category;
                break 2;
            }
        }
    }

    // Keywords avanzados
    $healthKeywords = [
        'vitamin', 'vitamina', 'mineral', 'omega', 'oil', 'collagen', 'energy', 'immune',
        'antioxidant', 'proanth', 'daily', 'plus', 'complex', 'formul', 'mena', 'feminine',
        'balance', 'strength', 'power', 'support', 'care', 'health', 'wellness', 'protection'
    ];

    $keywords = [];
    $words = explode(' ', $text);
    foreach ($words as $word) {
        $word = trim($word);
        if (strlen($word) >= 3) {
            $keywords[] = $word;
        }
    }

    // Añadir palabras clave de salud
    foreach ($healthKeywords as $keyword) {
        if (strpos($text, $keyword) !== false && !in_array($keyword, $keywords)) {
            $keywords[] = $keyword;
        }
    }

    $keywords = array_unique(array_filter($keywords));
    sort($keywords);

    // Tags adicionales
    $tags = ['pdf', 'ficha', 'técnica', 'documento'];
    foreach ($keywords as $keyword) {
        if (strlen($keyword) >= 3) {
            $tags[] = $keyword;
        }
    }
    $tags = array_unique($tags);

    return [
        'category' => $detectedCategory,
        'keywords' => $keywords,
        'tags' => $tags
    ];
}

// Generar todos los términos de búsqueda
function generateAllSearchTerms($filename, $title, $keywords, $tags) {
    $terms = [
        strtolower($filename),
        strtolower($title),
        implode(' ', array_map('strtolower', $keywords)),
        implode(' ', array_map('strtolower', $tags))
    ];

    // Variaciones de búsqueda
    $allTerms = [];
    foreach ($terms as $term) {
        $allTerms[] = $term;
        $allTerms[] = str_replace([' ', '-', '_'], '', $term); // Sin espacios ni caracteres
        $allTerms[] = str_replace(['-', '_'], ' ', $term); // Guiones a espacios
        $allTerms[] = str_replace('_', ' ', $term); // Guiones bajos a espacios
        $allTerms[] = str_replace('-', ' ', $term); // Guiones normales a espacios
    }

    return implode(' ', array_unique($allTerms));
}

// Generar variaciones de búsqueda
function generateSearchVariations($title, $keywords) {
    $variations = [];
    $title = strtolower($title);

    // Variaciones del título
    $variations[] = $title;
    $variations[] = str_replace(' ', '', $title); // Sin espacios
    $variations[] = str_replace('-', ' ', $title); // Guiones a espacios

    // Variaciones de keywords
    foreach ($keywords as $keyword) {
        $variations[] = strtolower($keyword);
    }

    // Palabras sueltas
    $words = explode(' ', $title);
    foreach ($words as $word) {
        if (strlen($word) >= 3) {
            $variations[] = strtolower($word);
        }
    }

    return array_unique(array_filter($variations));
}

// Generar JavaScript de búsqueda avanzado
function generateAdvancedSearchJS($indexData) {
    return "// Sistema de Búsqueda Avanzado - Auto-indexación
// ÚLTIMA ACTUALIZACIÓN AUTOMÁTICA: " . date('Y-m-d H:i:s') . "
console.log('🚀 Iniciando Sistema de Búsqueda Avanzado con Auto-indexación...');

class AdvancedSearchEngine {
    constructor() {
        this.data = " . json_encode($indexData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";
        this.init();
    }

    init() {
        console.log('✅ Datos cargados:', this.data.total_pdfs, 'PDFs');
        console.log('📅 Última actualización:', this.data.generated_at);
        console.log('🔄 Auto-indexación activada');
        console.log('🔍 Búsqueda avanzada con múltiples capas activada');
    }

    search(query, options = {}) {
        if (!this.data || !this.data.pdfs) return [];

        const {
            category = '',
            fuzzy = true,
            limit = 100,
            approximate = true,
            partial = true
        } = options;

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
                // Múltiples capas de búsqueda
                return this.exactSearch(pdf, searchTerm) ||
                       this.fuzzySearch(pdf, searchTerm) ||
                       this.partialSearch(pdf, searchTerm) ||
                       this.variationSearch(pdf, searchTerm);
            });
        }

        // Ordenar por relevancia
        results = this.sortByRelevance(results, searchTerm);

        return results.slice(0, limit);
    }

    exactSearch(pdf, searchTerm) {
        const searchableText = this.createSearchableText(pdf);
        return searchableText.includes(searchTerm);
    }

    fuzzySearch(pdf, searchTerm) {
        const searchableText = this.createSearchableText(pdf);
        // Búsqueda con tolerancia a errores (simplificado)
        const searchWords = searchTerm.split(/\s+/);
        const textWords = searchableText.split(/\s+/);

        let matches = 0;
        foreach ($searchWords as $searchWord) {
            foreach ($textWords as $textWord) {
                if (levenshteinDistance($searchWord, $textWord) <= 2) {
                    $matches++;
                    break;
                }
            }
        }

        return $matches >= Math.ceil(count($searchWords) / 2);
    }

    partialSearch(pdf, searchTerm) {
        const searchableText = this.createSearchableText(pdf);
        const searchParts = searchTerm.split(/\s+/);

        return searchParts.every(part =>
            part.length < 2 || searchableText.includes(part)
        );
    }

    variationSearch(pdf, searchTerm) {
        // Usar variaciones pre-calculadas
        if (pdf.search_variations) {
            return pdf.search_variations.some(variation =>
                variation.includes(searchTerm)
            );
        }
        return false;
    }

    createSearchableText(pdf) {
        const parts = [
            pdf.title || '',
            pdf.original_filename || '',
            pdf.filename || '',
            pdf.description || '',
            pdf.search_terms || '',
            (pdf.keywords || []).join(' '),
            (pdf.tags || []).join(' ')
        ];

        return parts.join(' ').toLowerCase();
    }

    sortByRelevance(results, searchTerm) {
        if (!searchTerm) return results;

        return results.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, searchTerm);
            const scoreB = this.calculateRelevanceScore(b, searchTerm);
            return scoreB - scoreA;
        });
    }

    calculateRelevanceScore(pdf, searchTerm) {
        let score = 0;
        const searchableText = this.createSearchableText(pdf);

        // Exact match en título
        if (pdf.title && pdf.title.toLowerCase().includes(searchTerm)) {
            score += 100;
        }

        // Exact match en filename
        if (pdf.filename && pdf.filename.toLowerCase().includes(searchTerm)) {
            score += 80;
        }

        // Match en keywords
        if (pdf.keywords) {
            foreach ($pdf.keywords as $keyword) {
                if (strtolower($keyword) === $searchTerm) {
                    score += 50;
                }
            }
        }

        // Match en texto completo
        if (searchableText.includes(searchTerm)) {
            score += 20;
        }

        return score;
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
            last_update: this.data.generated_at,
            auto_indexer: this.data.auto_indexer,
            new_files: this.data.new_files || 0,
            modified_files: this.data.modified_files || 0
        };
    }
}

// Algoritmo de Levenshtein simplificado
function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}

// Inicializar motor de búsqueda avanzado
window.advancedSearchEngine = new AdvancedSearchEngine();

// Compatibilidad con sistemas existentes
window.localSearchEngine = window.advancedSearchEngine;

// Función global para búsqueda
window.performSearch = function(query, options = {}) {
    if (window.advancedSearchEngine) {
        return window.advancedSearchEngine.search(query, options);
    }
    return [];
};

console.log('🌟 Sistema de Búsqueda Avanzada con Auto-indexación listo');";

// Función para forzar reindexación manual
window.forceReindex = async function() {
    console.log('🔄 Forzando reindexación manual...');
    try {
        const response = await fetch('auto-indexer.php?action=index');
        const result = await response.json();
        if (result.success) {
            console.log('✅ Reindexación completada:', result.message);
            // Recargar la página
            window.location.reload();
        } else {
            console.error('❌ Error en reindexación:', result.error);
        }
    } catch (error) {
        console.error('❌ Error al ejecutar reindexación:', error);
    }
};";

    // Guardar logs del proceso
    file_put_contents($config['auto_index_log'], str_repeat("=", 80) . "\n", FILE_APPEND);
    file_put_contents($config['auto_index_log'], "INICIO DE SESIÓN - " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
    file_put_contents($config['auto_index_log'], str_repeat("=", 80) . "\n", FILE_APPEND);

    return $result;
} catch (Exception $e) {
    file_put_contents($config['auto_index_log'], "[ERROR] " . date('Y-m-d H:i:s') . ": " . $e->getMessage() . "\n", FILE_APPEND);

    return [
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ];
}

// Procesar solicitudes
$action = $_GET['action'] ?? 'index';

switch ($action) {
    case 'index':
        $result = autoIndexarPDFs($config);
        echo json_encode($result);
        break;

    case 'status':
        // Verificar estado del sistema
        $status = [
            'auto_indexer_active' => true,
            'last_check' => file_exists($config['data_dir'] . 'last-auto-index.txt') ? date('Y-m-d H:i:s', filemtime($config['data_dir'] . 'last-auto-index.txt')) : 'Nunca',
            'index_exists' => file_exists($config['index_file']),
            'search_local_exists' => file_exists($config['search_local_file']),
            'pdfs_dir_exists' => file_exists($config['pdfs_dir']),
            'logs_count' => file_exists($config['auto_index_log']) ? count(file($config['auto_index_log'])) : 0
        ];

        if ($status['index_exists']) {
            $data = json_decode(file_get_contents($config['index_file']), true);
            if ($data) {
                $status['total_pdfs'] = $data['total_pdfs'];
                $status['last_update'] = $data['generated_at'];
            }
        }

        echo json_encode(['success' => true, 'status' => $status]);
        break;

    case 'logs':
        // Obtener logs recientes
        $logs = [];
        if (file_exists($config['auto_index_log'])) {
            $lines = file($config['auto_index_log'], FILE_IGNORE_NEW_LINES);
            $logs = array_slice(array_reverse($lines), 0, 50);
        }
        echo json_encode(['success' => true, 'logs' => $logs]);
        break;

    case 'check':
        // Verificar si hay cambios sin reindexar completo
        $result = autoIndexarPDFs($config);
        echo json_encode($result);
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Acción no válida']);
        break;
}
?>