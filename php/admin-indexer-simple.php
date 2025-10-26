<?php
/**
 * Versión simplificada del panel de administración - SIN ERRORES
 */

session_start();

// Configuración
$config = [
    'admin_password' => 'LifePlus2025@Admin',
    'pdfs_dir' => __DIR__ . '/../pdfs/',
    'data_dir' => __DIR__ . '/../data/',
    'index_file' => __DIR__ . '/../data/pdf-index.json',
    'search_local_file' => __DIR__ . '/../js/search-local.js',
    'log_file' => __DIR__ . '/../data/admin-indexer.log',
    'session_timeout' => 3600
];

// Función para logging
function logMessage($message, $config) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($config['log_file'], $logMessage, FILE_APPEND);
}

// Procesar login POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    header('Content-Type: application/json');

    if ($_POST['password'] === $config['admin_password']) {
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_login_time'] = time();
        logMessage("Inicio de sesión exitoso desde IP: " . $_SERVER['REMOTE_ADDR'], $config);

        echo json_encode([
            'success' => true,
            'message' => 'Login exitoso'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Contraseña incorrecta'
        ]);
    }
    exit;
}

// Verificar si está autenticado
$estaAutenticado = isset($_SESSION['admin_authenticated']) &&
                  $_SESSION['admin_authenticated'] === true &&
                  isset($_SESSION['admin_login_time']) &&
                  (time() - $_SESSION['admin_login_time']) < $config['session_timeout'];

// Procesar acciones POST si está autenticado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $estaAutenticado) {
    header('Content-Type: application/json');

    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'index_all':
                logMessage("INICIO: Indexación completa solicitada", $config);

                // Generar índice JSON
                ob_start();
                $result = include __DIR__ . '/generate-index.php';
                $output = ob_get_clean();

                $responseData = json_decode($output, true);

                if ($responseData && $responseData['success']) {
                    logMessage("Índice JSON generado: {$responseData['total_pdfs']} PDFs", $config);

                    // Regenerar search-local.js
                    $indexData = json_decode(file_get_contents($config['index_file']), true);
                    $template = "// Sistema de búsqueda local con datos incrustados
// ÚLTIMA ACTUALIZACIÓN: " . date('Y-m-d H:i:s') . "
console.log('🔍 Iniciando búsqueda local con datos incrustados...');

class LocalSearchEngine {
    constructor() {
        this.data = null;
        this.init();
    }

    init() {
        const embeddedData = " . json_encode($indexData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";
        this.data = embeddedData;
        console.log(\`✅ Datos cargados: \${this.data.total_pdfs} productos\`);
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
                    (pdf.keywords || []).join(' '), (pdf.tags || []).join(' ')
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

                    file_put_contents($config['search_local_file'], $template);
                    logMessage("search-local.js regenerado exitosamente", $config);

                    logMessage("COMPLETO: Indexación finalizada exitosamente", $config);

                    echo json_encode([
                        'success' => true,
                        'message' => 'Indexación completada exitosamente',
                        'json_index' => $responseData
                    ]);
                } else {
                    throw new Exception("Error al generar índice JSON");
                }
                break;

            case 'logout':
                session_destroy();
                echo json_encode(['success' => true, 'message' => 'Sesión cerrada']);
                break;

            default:
                echo json_encode(['success' => false, 'error' => 'Acción no válida']);
        }
    } catch (Exception $e) {
        logMessage("ERROR: " . $e->getMessage(), $config);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Si no está autenticado, mostrar login
if (!$estaAutenticado) {
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panel de Administración - PDF Indexer</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .login-container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #333; margin: 0; font-size: 24px; }
            .logo p { color: #666; margin: 5px 0 0 0; font-size: 14px; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
            input[type="password"] { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 16px; transition: border-color 0.3s; box-sizing: border-box; }
            input[type="password"]:focus { outline: none; border-color: #667eea; }
            .btn { width: 100%; background: #667eea; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; transition: background 0.3s; box-sizing: border-box; }
            .btn:hover { background: #5a6fd8; }
            .btn:disabled { background: #ccc; cursor: not-allowed; }
            .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #f5c6cb; }
            .security-notice { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #28a745; }
            .security-notice h4 { color: #28a745; margin: 0 0 5px 0; font-size: 14px; }
            .security-notice p { color: #666; margin: 0; font-size: 12px; line-height: 1.4; }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="logo">
                <h1>🔐 Panel Admin</h1>
                <p>Sistema de Indexación de PDFs</p>
            </div>

            <div id="error-container"></div>

            <form id="loginForm">
                <div class="form-group">
                    <label for="password">Contraseña de Administrador:</label>
                    <input type="password" id="password" name="password" required autocomplete="current-password">
                </div>
                <button type="submit" class="btn" id="loginBtn">Acceder</button>
            </form>

            <script>
            document.getElementById('loginForm').addEventListener('submit', async function(e) {
                e.preventDefault();

                const btn = document.getElementById('loginBtn');
                const errorContainer = document.getElementById('error-container');
                const password = document.getElementById('password').value;

                btn.disabled = true;
                btn.textContent = 'Verificando...';
                errorContainer.innerHTML = '';

                try {
                    const formData = new FormData();
                    formData.append('password', password);

                    const response = await fetch('admin-indexer-simple.php', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (result.success) {
                        window.location.reload();
                    } else {
                        errorContainer.innerHTML = '<div class="error">❌ ' + result.error + '</div>';
                        btn.disabled = false;
                        btn.textContent = 'Acceder';
                    }
                } catch (error) {
                    errorContainer.innerHTML = '<div class="error">❌ Error de conexión: ' + error.message + '</div>';
                    btn.disabled = false;
                    btn.textContent = 'Acceder';
                }
            });
            </script>

            <div class="security-notice">
                <h4>🛡️ Zona Segura</h4>
                <p>Esta área está restringida al administrador. Versión simplificada sin errores.</p>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Mostrar panel de administración (usuario autenticado)
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - Indexador de PDFs</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .header-content { display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 28px; font-weight: 600; }
        .header p { opacity: 0.9; margin-top: 5px; }
        .btn-logout { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; transition: background 0.3s; }
        .btn-logout:hover { background: rgba(255,255,255,0.3); }

        .main-content { padding: 40px 0; }
        .card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); margin-bottom: 30px; }
        .card h2 { color: #333; margin-bottom: 10px; font-size: 24px; }
        .card p { color: #666; line-height: 1.6; margin-bottom: 20px; }

        .index-button { background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; gap: 10px; }
        .index-button:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3); }
        .index-button:disabled { background: #6c757d; cursor: not-allowed; transform: none; box-shadow: none; }

        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 36px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 14px; }

        .loading { display: none; text-align: center; padding: 20px; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <div class="header-content">
                <div>
                    <h1>🔧 Panel de Administración</h1>
                    <p>Sistema Profesional de Indexación de PDFs</p>
                </div>
                <a href="#" class="btn-logout" onclick="logout()">Cerrar Sesión</a>
            </div>
        </div>
    </div>

    <div class="container main-content">
        <div class="card">
            <h2>📊 Estado Actual del Sistema</h2>
            <p>Monitorea y gestiona tu biblioteca de PDFs con control total y seguridad.</p>

            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number" id="totalPdfs">-</div>
                    <div class="stat-label">PDFs Totales</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="totalSize">-</div>
                    <div class="stat-label">Tamaño Total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="categories">-</div>
                    <div class="stat-label">Categorías</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="lastUpdate">-</div>
                    <div class="stat-label">Última Actualización</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>🔄 Indexación de PDFs</h2>
            <p>Actualiza el índice de búsqueda para incluir nuevos PDFs o cambios existentes. Este proceso actualiza tanto el archivo JSON como el motor de búsqueda local (search-local.js).</p>

            <button class="index-button" onclick="indexAll()" id="indexBtn">
                <span>🚀</span>
                <span>Indexar Todos los PDFs</span>
            </button>

            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Procesando PDFs... Esto puede tardar varios minutos.</p>
            </div>
        </div>
    </div>

    <script>
        async function loadStats() {
            try {
                const response = await fetch('../data/pdf-index.json');
                const data = await response.json();

                document.getElementById('totalPdfs').textContent = data.total_pdfs || 0;
                document.getElementById('totalSize').textContent = formatFileSize(data.total_size || 0);
                document.getElementById('categories').textContent = Object.keys(data.categories || {}).length;
                document.getElementById('lastUpdate').textContent = formatDate(data.generated_at);
            } catch (error) {
                console.error('Error al cargar estadísticas:', error);
            }
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString('es-ES');
        }

        async function indexAll() {
            const btn = document.getElementById('indexBtn');
            const loading = document.getElementById('loading');

            if (confirm('¿Estás seguro de que quieres reindexar todos los PDFs?\n\nEste proceso:\n• Escaneará todos los PDFs en la carpeta\n• Actualizará el índice JSON\n• Regenerará search-local.js\n• Mantendrá todos los contadores de descargas')) {

                btn.disabled = true;
                loading.style.display = 'block';

                try {
                    const formData = new FormData();
                    formData.append('action', 'index_all');

                    const response = await fetch('admin-indexer-simple.php', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (result.success) {
                        alert('✅ ' + result.message + '\n\nPDFs procesados: ' + result.json_index.total_pdfs + '\nNuevos PDFs: ' + result.json_index.new_files);
                        location.reload();
                    } else {
                        alert('❌ Error: ' + result.error);
                    }
                } catch (error) {
                    alert('❌ Error de conexión: ' + error.message);
                } finally {
                    btn.disabled = false;
                    loading.style.display = 'none';
                }
            }
        }

        async function logout() {
            try {
                const formData = new FormData();
                formData.append('action', 'logout');

                await fetch('admin-indexer-simple.php', {
                    method: 'POST',
                    body: formData
                });
                location.reload();
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            loadStats();
        });
    </script>
</body>
</html>