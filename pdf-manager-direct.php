<?php
/**
 * Gestor de PDFs con indexación directa - Sin dependencias
 */

session_start();

// Configuración
$config = [
    'admin_password' => 'LifePlus2025@Admin',
    'pdfs_dir' => __DIR__ . '/pdfs/',
    'data_dir' => __DIR__ . '/data/',
    'index_file' => __DIR__ . '/data/pdf-index.json',
    'search_local_file' => __DIR__ . '/js/search-local.js',
    'log_file' => __DIR__ . '/data/admin-indexer.log'
];

// Crear directorios si no existen
if (!file_exists($config['data_dir'])) mkdir($config['data_dir'], 0755, true);

// Función para logging
function logMessage($message, $config) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($config['log_file'], $logMessage, FILE_APPEND);
}

// Función de indexación directa
function indexarPDFsDirectamente($config) {
    logMessage("INICIO: Indexación directa de PDFs", $config);

    if (!file_exists($config['pdfs_dir'])) {
        throw new Exception("Carpeta de PDFs no encontrada: " . $config['pdfs_dir']);
    }

    // Escanear carpeta de PDFs
    $files = scandir($config['pdfs_dir']);
    $pdfFiles = array_filter($files, function($file) {
        return strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'pdf';
    });

    logMessage("Encontrados " . count($pdfFiles) . " archivos PDF", $config);

    // Generar datos de PDFs
    $pdfs = [];
    $totalSize = 0;

    foreach ($pdfFiles as $filename) {
        $filePath = $config['pdfs_dir'] . $filename;
        if (file_exists($filePath)) {
            $fileStats = stat($filePath);

            // Extraer categoría del nombre
            $category = 'General';
            if (preg_match('/VITAMIN|OMEGA|PROANTH|DAILY|COLLAGEN|MINERAL/i', $filename, $matches)) {
                $category = ucfirst(strtolower($matches[0]));
            }

            $pdfData = [
                'id' => md5($filename),
                'filename' => $filename,
                'title' => pathinfo($filename, PATHINFO_FILENAME),
                'description' => "Documento PDF: " . pathinfo($filename, PATHINFO_FILENAME),
                'category' => $category,
                'tags' => [],
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
        }
    }

    // Ordenar por fecha
    usort($pdfs, function($a, $b) {
        return strtotime($b['uploadDate']) - strtotime($a['uploadDate']);
    });

    // Extraer categorías únicas
    $categories = array_unique(array_column($pdfs, 'category'));

    // Crear índice JSON
    $indexData = [
        'success' => true,
        'generated_at' => date('Y-m-d H:i:s'),
        'total_pdfs' => count($pdfs),
        'total_size' => $totalSize,
        'categories' => array_values($categories),
        'pdfs' => $pdfs
    ];

    // Guardar índice JSON
    $jsonContent = json_encode($indexData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if (!file_put_contents($config['index_file'], $jsonContent)) {
        throw new Exception("No se pudo guardar el archivo de índice");
    }

    // Generar search-local.js
    $template = "// Sistema de búsqueda local - Actualizado: " . date('Y-m-d H:i:s') . "
console.log('🔍 Iniciando búsqueda local con datos incrustados...');

class LocalSearchEngine {
    constructor() {
        this.data = " . json_encode($indexData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";
        this.init();
    }

    init() {
        console.log('✅ Datos cargados: ' + this.data.total_pdfs + ' productos');
        console.log('📅 Última actualización: ' + this.data.generated_at);
    }

    search(query, options = {}) {
        if (!this.data || !this.data.pdfs) return [];

        const { category = '', fuzzy = true, limit = 100 } = options;
        let results = this.data.pdfs;

        if (category) {
            results = results.filter(pdf =>
                pdf.category && pdf.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            results = results.filter(pdf => {
                const searchableText = [
                    pdf.title || '', pdf.description || '', pdf.filename || '',
                    (pdf.ingredients || []).join(' '), (pdf.benefits || []).join(' '),
                    (pdf.tags || []).join(' ')
                ].join(' ').toLowerCase();

                return searchableText.includes(searchTerm);
            });
        }

        return results.slice(0, limit);
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

window.localSearchEngine = new LocalSearchEngine();
console.log('🚀 Motor de búsqueda local inicializado');";

    if (!file_put_contents($config['search_local_file'], $template)) {
        throw new Exception("No se pudo guardar search-local.js");
    }

    logMessage("COMPLETO: Indexación finalizada - " . count($pdfs) . " PDFs procesados", $config);

    return [
        'success' => true,
        'total_pdfs' => count($pdfs),
        'message' => 'Indexación completada exitosamente'
    ];
}

// Procesar login
if ($_POST && isset($_POST['password'])) {
    if ($_POST['password'] === $config['admin_password']) {
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
        logMessage("Login exitoso desde IP: " . $_SERVER['REMOTE_ADDR'], $config);
        header('Location: pdf-manager-direct.php');
        exit;
    } else {
        $error = "Contraseña incorrecta";
    }
}

// Procesar indexación
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true && isset($_POST['action']) && $_POST['action'] === 'index') {
    try {
        $result = indexarPDFsDirectamente($config);
        $success = "✅ " . $result['message'] . ": " . $result['total_pdfs'] . " PDFs procesados";
    } catch (Exception $e) {
        $error = "❌ Error: " . $e->getMessage();
        logMessage("ERROR: " . $e->getMessage(), $config);
    }
}

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: pdf-manager-direct.php');
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
    <title>📊 Gestor de PDFs - Versión Directa</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; }
        .container { max-width: 1000px; margin: 0 auto; padding: 20px; }

        .login-box { max-width: 400px; margin: 100px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .login-box h1 { color: #333; text-align: center; margin-bottom: 30px; font-size: 24px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
        input[type="password"] { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; }
        input[type="password"]:focus { outline: none; border-color: #007cba; }
        .btn { width: 100%; background: #007cba; color: white; border: none; padding: 12px; border-radius: 4px; font-size: 16px; cursor: pointer; }
        .btn:hover { background: #005a87; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 20px; text-align: center; }
        .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin-bottom: 20px; text-align: center; }

        .dashboard { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { color: #333; font-size: 28px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 32px; font-weight: bold; color: #007cba; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 14px; }
        .action-btn { background: #28a745; color: white; border: none; padding: 15px 30px; border-radius: 6px; font-size: 16px; cursor: pointer; margin: 10px 0; }
        .action-btn:hover { background: #218838; }
        .logout-btn { background: #dc3545; color: white; text-decoration: none; padding: 8px 16px; border-radius: 4px; text-decoration: none; }
        .logout-btn:hover { background: #c82333; }
        .debug-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px; font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <?php if (!$logged_in): ?>
        <!-- Login -->
        <div class="login-box">
            <h1>🔐 Panel de Administración</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Gestor de PDFs - Versión Directa</p>

            <?php if (isset($error)): ?>
                <div class="error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="btn">Acceder</button>
            </form>
        </div>

        <?php else: ?>
        <!-- Panel -->
        <div class="dashboard">
            <div class="header">
                <div>
                    <h1>📊 Panel de Administración</h1>
                    <p style="color: #666; margin-top: 5px;">Gestor de PDFs - Indexación Directa</p>
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
                    <div class="stat-label">PDFs Totales</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><?php echo number_format($stats['total_size'] / 1024 / 1024, 1); ?> MB</div>
                    <div class="stat-label">Tamaño Total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><?php echo count($stats['categories'] ?? []); ?></div>
                    <div class="stat-label">Categorías</div>
                </div>
            </div>

            <div style="margin-top: 30px;">
                <h2 style="margin-bottom: 15px; color: #333;">🔄 Acciones</h2>

                <form method="POST" style="display: inline;">
                    <input type="hidden" name="action" value="index">
                    <button type="submit" class="action-btn" onclick="return confirm('¿Indexar todos los PDFs? Este proceso es directo y rápido.')">
                        🚀 Indexar PDFs (Método Directo)
                    </button>
                </form>

                <div class="debug-info">
                    <strong>Información de Depuración:</strong><br>
                    • Carpeta PDFs: <?php echo $config['pdfs_dir']; ?> <?php echo file_exists($config['pdfs_dir']) ? '✅' : '❌'; ?><br>
                    • Archivo JSON: <?php echo $config['index_file']; ?> <?php echo file_exists($config['index_file']) ? '✅' : '❌'; ?><br>
                    • Search-local.js: <?php echo $config['search_local_file']; ?> <?php echo file_exists($config['search_local_file']) ? '✅' : '❌'; ?><br>
                    • Última actualización: <?php echo date('Y-m-d H:i:s'); ?>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>