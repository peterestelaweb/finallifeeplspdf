<?php
/**
 * Panel de Indexación Universal - Funciona con CUALQUIER nombre de archivo
 * Sistema infalible para indexar PDFs sin importar cómo se llamen
 */

session_start();

// Configuración
$config = [
    'admin_password' => 'LifePlus2025@Admin',
    'pdfs_dir' => __DIR__ . '/pdfs/',
    'data_dir' => __DIR__ . '/data/',
    'index_file' => __DIR__ . '/data/pdf-index.json',
    'search_local_file' => __DIR__ . '/js/search-local.js',
    'log_file' => __DIR__ . '/data/universal-indexer.log'
];

// Crear directorios si no existen
if (!file_exists($config['data_dir'])) mkdir($config['data_dir'], 0755, true);

// Función para logging
function logMessage($message, $config) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($config['log_file'], $logMessage, FILE_APPEND);
}

// Función de indexación universal - Acepta CUALQUIER nombre de archivo
function indexarUniversalmente($config) {
    logMessage("INICIO: Indexación universal de PDFs", $config);

    if (!file_exists($config['pdfs_dir'])) {
        throw new Exception("❌ Carpeta de PDFs no encontrada: " . $config['pdfs_dir']);
    }

    // Escanear carpeta de PDFs
    $files = scandir($config['pdfs_dir']);
    $pdfFiles = array_filter($files, function($file) {
        return strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'pdf';
    });

    logMessage("PDFs encontrados: " . count($pdfFiles), $config);

    // Generar datos de PDFs con metadata inteligente
    $pdfs = [];
    $totalSize = 0;
    $categoriesFound = [];

    foreach ($pdfFiles as $filename) {
        $filePath = $config['pdfs_dir'] . $filename;
        if (file_exists($filePath)) {
            $fileStats = stat($filePath);

            // Extraer información inteligente del nombre del archivo
            $title = pathinfo($filename, PATHINFO_FILENAME);
            $cleanTitle = preg_replace('/[-_]/', ' ', $title);
            $cleanTitle = preg_replace('/\s+/', ' ', $cleanTitle);

            // Generar keywords automáticamente del nombre
            $keywords = extractKeywordsFromFilename($filename);

            // Determinar categoría automáticamente
            $category = categorizeAutomatically($filename, $keywords);

            // Crear tags para búsqueda
            $tags = generateSearchTags($filename, $cleanTitle, $keywords);

            $pdfData = [
                'id' => md5($filename . time()),
                'filename' => $filename,
                'title' => $cleanTitle,
                'original_filename' => $filename,
                'description' => "Documento PDF: " . $cleanTitle,
                'category' => $category,
                'tags' => $tags,
                'keywords' => $keywords,
                'search_terms' => generateAllSearchTerms($filename, $cleanTitle, $keywords, $tags),
                'filePath' => 'pdfs/' . $filename,
                'fileSize' => $fileStats['size'],
                'mimeType' => 'application/pdf',
                'uploadDate' => date('Y-m-d H:i:s', $fileStats['mtime']),
                'updatedAt' => date('Y-m-d H:i:s'),
                'isActive' => true,
                'downloadCount' => 0
            ];

            $pdfs[] = $pdfData;
            $totalSize += $fileStats['size'];
            $categoriesFound[] = $category;

            logMessage("PDF indexado: " . $filename . " → " . $cleanTitle, $config);
        }
    }

    // Ordenar por fecha
    usort($pdfs, function($a, $b) {
        return strtotime($b['uploadDate']) - strtotime($a['uploadDate']);
    });

    // Extraer categorías únicas
    $categories = array_unique(array_filter($categoriesFound));
    sort($categories);

    // Crear índice JSON mejorado
    $indexData = [
        'success' => true,
        'version' => 'universal-v2.0',
        'generated_at' => date('Y-m-d H:i:s'),
        'total_pdfs' => count($pdfs),
        'total_size' => $totalSize,
        'categories' => array_values($categories),
        'pdfs' => $pdfs,
        'search_features' => [
            'exact_match' => true,
            'partial_match' => true,
            'case_insensitive' => true,
            'fuzzy_search' => true,
            'filename_search' => true
        ]
    ];

    // Guardar índice JSON
    $jsonContent = json_encode($indexData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if (!file_put_contents($config['index_file'], $jsonContent)) {
        throw new Exception("❌ No se pudo guardar el archivo de índice");
    }

    // Generar search-local.js con búsqueda universal
    $template = generateUniversalSearchJS($indexData);

    if (!file_put_contents($config['search_local_file'], $template)) {
        throw new Exception("❌ No se pudo guardar search-local.js");
    }

    logMessage("COMPLETO: Indexación universal finalizada - " . count($pdfs) . " PDFs procesados", $config);

    return [
        'success' => true,
        'total_pdfs' => count($pdfs),
        'categories_count' => count($categories),
        'message' => '✅ Indexación universal completada',
        'processed_files' => array_column($pdfs, 'filename')
    ];
}

// Funciones inteligentes para extraer información
function extractKeywordsFromFilename($filename) {
    $filename = pathinfo($filename, PATHINFO_FILENAME);
    $filename = preg_replace('/[-_]/', ' ', $filename);
    $filename = preg_replace('/\s+/', ' ', $filename);
    $filename = trim($filename);

    // Palabras clave comunes en productos de salud
    $healthKeywords = [
        'mena', 'plus', 'omega', 'vitamin', 'vitamina', 'daily', 'proanth', 'collagen',
        'mineral', 'supplement', 'health', 'wellness', 'energy', 'immune', 'strength',
        'formula', 'complex', 'natural', 'organic', 'caps', 'capsule', 'tablet',
        'softgel', 'liquid', 'powder', 'extract', 'oil', 'essence'
    ];

    $keywords = [];
    $words = explode(' ', strtolower($filename));

    foreach ($words as $word) {
        $word = trim($word);
        if (strlen($word) >= 3) {
            $keywords[] = $word;
        }
    }

    // Añadir palabras clave de salud si coinciden
    foreach ($healthKeywords as $keyword) {
        if (strpos(strtolower($filename), $keyword) !== false) {
            $keywords[] = $keyword;
        }
    }

    return array_unique($keywords);
}

function categorizeAutomatically($filename, $keywords) {
    $filename = strtolower($filename);
    $keywordsText = implode(' ', array_map('strtolower', $keywords));

    // Patrones de categorización
    $patterns = [
        'Vitaminas y Suplementos' => ['vitamin', 'vitamina', 'supplement', 'suplemento', 'daily'],
        'Omega y Ácidos Grasos' => ['omega', 'oil', 'ácido', 'aceite'],
        'Minerales' => ['mineral', 'calcium', 'magnesium', 'zinc', 'hierro'],
        'Antioxidantes' => ['antioxidant', 'proanth', 'polyphenol'],
        'Colágeno y Belleza' => ['collagen', 'belleza', 'skin', 'hair', 'nail'],
        'Energía y Rendimiento' => ['energy', 'performance', 'strength', 'power'],
        'Sistema Inmune' => ['immune', 'defense', 'protection'],
        'Salud General' => ['health', 'wellness', 'general']
    ];

    foreach ($patterns as $category => $terms) {
        foreach ($terms as $term) {
            if (strpos($filename, $term) !== false || strpos($keywordsText, $term) !== false) {
                return $category;
            }
        }
    }

    return 'General';
}

function generateSearchTags($filename, $title, $keywords) {
    $tags = [];

    // Tags del nombre del archivo
    $filename_tags = explode(' ', strtolower($title));
    $tags = array_merge($tags, $filename_tags);

    // Tags de keywords
    $tags = array_merge($tags, array_map('strtolower', $keywords));

    // Tags adicionales
    $tags[] = 'pdf';
    $tags[] = 'documento';
    $tags[] = 'ficha';
    $tags[] = 'técnica';

    // Limpiar y unique
    $tags = array_filter($tags);
    $tags = array_unique($tags);
    $tags = array_values($tags);

    return $tags;
}

function generateAllSearchTerms($filename, $title, $keywords, $tags) {
    $terms = [
        strtolower($filename),
        strtolower($title),
        implode(' ', array_map('strtolower', $keywords)),
        implode(' ', array_map('strtolower', $tags))
    ];

    // Generar variaciones
    $allTerms = [];
    foreach ($terms as $term) {
        $allTerms[] = $term;
        $allTerms[] = str_replace([' ', '-', '_'], '', $term);
        $allTerms[] = str_replace(['-', '_'], ' ', $term);
    }

    return implode(' ', array_unique($allTerms));
}

function generateUniversalSearchJS($indexData) {
    return "// Sistema de Búsqueda Universal - Encuentra CUALQUIER PDF
// ÚLTIMA ACTUALIZACIÓN: " . date('Y-m-d H:i:s') . "
console.log('🚀 Iniciando Sistema de Búsqueda Universal...');

class UniversalSearchEngine {
    constructor() {
        this.data = " . json_encode($indexData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";
        this.init();
    }

    init() {
        console.log('✅ Datos cargados:', this.data.total_pdfs, 'PDFs');
        console.log('📅 Última actualización:', this.data.generated_at);
        console.log('🔍 Búsqueda universal activada - Encuentra PDFs sin importar el nombre');
    }

    search(query, options = {}) {
        if (!this.data || !this.data.pdfs) return [];

        const {
            category = '',
            fuzzy = true,
            limit = 100
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
                // Búsqueda universal en múltiples campos
                const searchableText = this.createUniversalSearchText(pdf);

                // Búsqueda exacta
                if (searchableText.includes(searchTerm)) {
                    return true;
                }

                // Búsqueda sin espacios ni caracteres especiales
                const cleanSearch = searchTerm.replace(/[^a-z0-9]/g, '');
                const cleanText = searchableText.replace(/[^a-z0-9]/g, '');
                if (cleanText.includes(cleanSearch)) {
                    return true;
                }

                // Búsqueda por partes
                const searchParts = searchTerm.split(/\\s+/);
                const matchingParts = searchParts.filter(part =>
                    part.length > 1 && searchableText.includes(part)
                );

                if (matchingParts.length >= Math.ceil(searchParts.length / 2)) {
                    return true;
                }

                return false;
            });
        }

        return results.slice(0, limit);
    }

    createUniversalSearchText(pdf) {
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

// Inicializar motor universal
window.universalSearchEngine = new UniversalSearchEngine();
window.localSearchEngine = window.universalSearchEngine; // Compatibilidad

console.log('🌟 Sistema de Búsqueda Universal listo - Encuentra cualquier PDF');";
}

// Procesar login
if ($_POST && isset($_POST['password'])) {
    if ($_POST['password'] === $config['admin_password']) {
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
        logMessage("Login exitoso desde IP: " . $_SERVER['REMOTE_ADDR'], $config);
        header('Location: universal-indexer.php');
        exit;
    } else {
        $error = "❌ Contraseña incorrecta";
    }
}

// Procesar indexación
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true && isset($_POST['action']) && $_POST['action'] === 'index') {
    try {
        $result = indexarUniversalmente($config);
        $success = "✅ " . $result['message'] . ": " . $result['total_pdfs'] . " PDFs procesados<br>
                    📂 Categorías encontradas: " . $result['categories_count'] . "<br>
                    🔄 Sistema de búsqueda universal activado";
    } catch (Exception $e) {
        $error = "❌ Error: " . $e->getMessage();
        logMessage("ERROR: " . $e->getMessage(), $config);
    }
}

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: universal-indexer.php');
    exit;
}

// Verificar login
$logged_in = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Indexador Universal de PDFs</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1000px; margin: 0 auto; }

        .login-box { max-width: 400px; margin: 100px auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .login-box h1 { color: #333; text-align: center; margin-bottom: 20px; font-size: 28px; }
        .login-box .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
        input[type="password"] { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 16px; }
        input[type="password"]:focus { outline: none; border-color: #667eea; }
        .btn { width: 100%; background: #667eea; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.3s; }
        .btn:hover { background: #5a6fd8; }
        .btn:disabled { background: #ccc; cursor: not-allowed; }
        .error { background: #f8d7da; color: #721c24; padding: 12px; border-radius: 6px; margin-bottom: 20px; text-align: center; border: 1px solid #f5c6cb; }
        .success { background: #d4edda; color: #155724; padding: 12px; border-radius: 6px; margin-bottom: 20px; text-align: center; border: 1px solid #c3e6cb; }

        .dashboard { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { color: #333; font-size: 32px; }
        .header .subtitle { color: #666; margin-top: 5px; }
        .logout-btn { background: #dc3545; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; text-decoration: none; transition: background 0.3s; }
        .logout-btn:hover { background: #c82333; }

        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; text-align: center; }
        .stat-number { font-size: 36px; font-weight: bold; margin-bottom: 5px; }
        .stat-label { opacity: 0.9; font-size: 14px; }

        .action-section { background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px; }
        .action-section h2 { color: #333; margin-bottom: 15px; }
        .action-btn { background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3); }
        .action-btn:disabled { background: #6c757d; cursor: not-allowed; transform: none; box-shadow: none; }

        .procedure { background: #e7f3ff; padding: 20px; border-radius: 10px; border-left: 5px solid #007cba; }
        .procedure h3 { color: #007cba; margin-bottom: 15px; }
        .procedure ol { color: #333; line-height: 1.8; margin-left: 20px; }
        .procedure li { margin-bottom: 8px; }

        .file-list { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px; max-height: 300px; overflow-y: auto; }
        .file-item { padding: 8px 12px; margin-bottom: 5px; background: white; border-radius: 5px; font-family: monospace; font-size: 14px; border-left: 3px solid #28a745; }

        .features { background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 5px solid #ffc107; }
        .features h3 { color: #856404; margin-bottom: 15px; }
        .features ul { color: #856404; line-height: 1.6; margin-left: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <?php if (!$logged_in): ?>
        <!-- Login -->
        <div class="login-box">
            <h1>🚀 Indexador Universal</h1>
            <p class="subtitle">Sistema infalible para indexar PDFs</p>

            <?php if (isset($error)): ?>
                <div class="error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label for="password">🔐 Contraseña de Administrador:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="btn">Acceder al Sistema</button>
            </form>
        </div>

        <?php else: ?>
        <!-- Panel Principal -->
        <div class="dashboard">
            <div class="header">
                <div>
                    <h1>🚀 Panel de Indexación Universal</h1>
                    <p class="subtitle">Sistema infalible para indexar PDFs con cualquier nombre</p>
                </div>
                <a href="?logout=1" class="logout-btn">Cerrar Sesión</a>
            </div>

            <?php if (isset($success)): ?>
                <div class="success"><?php echo $success; ?></div>
            <?php endif; ?>

            <?php if (isset($error)): ?>
                <div class="error"><?php echo $error; ?></div>
            <?php endif; ?>

            <?php
            // Cargar estadísticas
            $stats = ['total_pdfs' => 0, 'total_size' => 0, 'categories' => []];
            if (file_exists($config['index_file'])) {
                $data = json_decode(file_get_contents($config['index_file']), true);
                if ($data) {
                    $stats = $data;
                }
            }
            ?>

            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number"><?php echo $stats['total_pdfs']; ?></div>
                    <div class="stat-label">PDFs Indexados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><?php echo count($stats['categories'] ?? []); ?></div>
                    <div class="stat-label">Categorías</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><?php echo number_format(($stats['total_size'] ?? 0) / 1024 / 1024, 1); ?> MB</div>
                    <div class="stat-label">Tamaño Total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">🌟</div>
                    <div class="stat-label">Búsqueda Universal</div>
                </div>
            </div>

            <div class="action-section">
                <h2>🔄 Acciones de Indexación</h2>

                <form method="POST" style="display: inline;">
                    <input type="hidden" name="action" value="index">
                    <button type="submit" class="action-btn" onclick="return confirm('¿Indexar todos los PDFs con nombres universales?\\n\\nEste sistema:\\n• Acepta CUALQUIER nombre de archivo\\n• Crea metadata automáticamente\\n• Indexa sin cambios manuales\\n• Funciona siempre igual')">
                        🚀 Indexar PDFs (Método Universal)
                    </button>
                </form>

                <div class="procedure">
                    <h3>📋 PROCEDIMIENTO ESTÁNDAR PARA NUEVOS PDFs:</h3>
                    <ol>
                        <li><strong>Subir PDF:</strong> Coloca el archivo en la carpeta <code>/pdfs/</code></li>
                        <li><strong>Nombre:</strong> Usa CUALQUIER nombre (el sistema lo adapta automáticamente)</li>
                        <li><strong>Indexar:</strong> Presiona el botón verde de arriba</li>
                        <li><strong>Listo:</strong> El PDF será searchable inmediatamente</li>
                    </ol>
                    <p><strong>✅ Sin cambios manuales • ✅ Sin renombrar • ✅ Siempre funciona</strong></p>
                </div>
            </div>

            <div class="features">
                <h3>🌟 Características del Sistema Universal:</h3>
                <ul>
                    <li><strong>✅ Nombres reales:</strong> Funciona con el nombre original de cada PDF</li>
                    <li><strong>✅ Búsqueda inteligente:</strong> Encuentra PDFs aunque busques "mena" por "Menaplus ES FINAL"</li>
                    <li><strong>✅ Metadata automática:</strong> Crea categorías, tags y keywords automáticamente</li>
                    <li><strong>✅ Búsqueda flexible:</strong> Busca por partes, sin espacios, con mayúsculas/minúsculas</li>
                    <li><strong>✅ Proceso estándar:</strong> Siempre el mismo procedimiento para todos los PDFs</li>
                </ul>
            </div>

            <?php if (file_exists($config['index_file'])): ?>
            <div class="file-list">
                <h3>📄 Últimos PDFs Procesados:</h3>
                <?php
                $data = json_decode(file_get_contents($config['index_file']), true);
                if ($data && isset($data['pdfs'])) {
                    $recent_pdfs = array_slice($data['pdfs'], 0, 10);
                    foreach ($recent_pdfs as $pdf) {
                        echo '<div class="file-item">📄 ' . htmlspecialchars($pdf['filename']) . ' → ' . htmlspecialchars($pdf['title']) . '</div>';
                    }
                }
                ?>
            </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>