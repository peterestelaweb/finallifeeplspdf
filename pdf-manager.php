<?php
/**
 * Panel de gestión de PDFs - Versión ultra simplificada para evitar bloqueos
 */

session_start();

// Configuración
$config = [
    'admin_password' => 'LifePlus2025@Admin',
    'pdfs_dir' => __DIR__ . '/../pdfs/',
    'data_dir' => __DIR__ . '/../data/',
    'index_file' => __DIR__ . '/../data/pdf-index.json',
    'search_local_file' => __DIR__ . '/../js/search-local.js',
    'log_file' => __DIR__ . '/../data/admin-indexer.log'
];

// Función para logging
function logMessage($message, $config) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($config['log_file'], $logMessage, FILE_APPEND);
}

// Procesar formulario
if ($_POST && isset($_POST['password'])) {
    if ($_POST['password'] === $config['admin_password']) {
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
        logMessage("Login exitoso desde IP: " . $_SERVER['REMOTE_ADDR'], $config);
        header('Location: pdf-manager.php');
        exit;
    } else {
        $error = "Contraseña incorrecta";
    }
}

// Si está logueado y quiere indexar
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true && isset($_POST['action']) && $_POST['action'] === 'index') {

    // Generar índice JSON
    ob_start();
    $result = include __DIR__ . '/generate-index.php';
    $output = ob_get_clean();

    $responseData = json_decode($output, true);

    if ($responseData && $responseData['success']) {
        // Regenerar search-local.js
        $indexData = json_decode(file_get_contents($config['index_file']), true);

        $template = "// Sistema de búsqueda local - Actualizado: " . date('Y-m-d H:i:s') . "
class LocalSearchEngine {
    constructor() {
        this.data = " . json_encode($indexData, JSON_UNESCAPED_UNICODE) . ";
        this.init();
    }

    init() {
        console.log('✅ PDFs cargados:', this.data.total_pdfs);
    }

    search(query, options = {}) {
        if (!this.data || !this.data.pdfs) return [];
        let results = this.data.pdfs;

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

        return results.slice(0, 100);
    }
}

window.localSearchEngine = new LocalSearchEngine();";

        file_put_contents($config['search_local_file'], $template);
        logMessage("Indexación completada: {$responseData['total_pdfs']} PDFs", $config);
        $success = "✅ Indexación completada: {$responseData['total_pdfs']} PDFs procesados";
    } else {
        $error = "❌ Error en la indexación";
    }
}

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: pdf-manager.php');
    exit;
}

// Verificar si está logueado
$logged_in = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Gestor de PDFs</title>
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
    </style>
</head>
<body>
    <div class="container">
        <?php if (!$logged_in): ?>
        <!-- Pantalla de Login -->
        <div class="login-box">
            <h1>🔐 Panel de Administración</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Sistema de Gestión de PDFs</p>

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

            <p style="text-align: center; color: #999; margin-top: 20px; font-size: 12px;">
                Zona restringida para administradores
            </p>
        </div>

        <?php else: ?>
        <!-- Panel de Administración -->
        <div class="dashboard">
            <div class="header">
                <div>
                    <h1>📊 Panel de Administración</h1>
                    <p style="color: #666; margin-top: 5px;">Gestiona tu biblioteca de PDFs</p>
                </div>
                <a href="?logout=1" class="logout-btn">Cerrar Sesión</a>
            </div>

            <?php if (isset($success)): ?>
                <div class="success"><?php echo $success; ?></div>
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
                    <button type="submit" class="action-btn" onclick="return confirm('¿Indexar todos los PDFs? Esto actualizará el buscador.')">
                        🚀 Indexar Todos los PDFs
                    </button>
                </form>

                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                    <h3 style="margin-bottom: 10px; color: #333;">📝 Instrucciones:</h3>
                    <ol style="color: #666; line-height: 1.6;">
                        <li>Sube nuevos PDFs a la carpeta <code>/pdfs/</code></li>
                        <li>Haz clic en "Indexar Todos los PDFs"</li>
                        <li>Espera a que complete el proceso</li>
                        <li>Los PDFs estarán disponibles en el buscador</li>
                    </ol>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>