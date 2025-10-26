<?php
/**
 * Sistema de Indexación Seguro de PDFs - Solo para Administrador
 *
 * Este sistema:
 * - Requiere autenticación
 * - Indexa PDFs automáticamente
 * - Actualiza ambos sistemas (JSON y search-local.js)
 * - Registra todas las operaciones
 * - No es accesible públicamente
 */

session_start();

// Configuración de seguridad
$config = [
    'admin_password' => 'LifePlus2025@Admin',  // <-- CAMBIA ESTA CONTRASEÑA
    'pdfs_dir' => __DIR__ . '/../pdfs/',
    'data_dir' => __DIR__ . '/../data/',
    'index_file' => __DIR__ . '/../data/pdf-index.json',
    'search_local_file' => __DIR__ . '/../js/search-local.js',
    'log_file' => __DIR__ . '/../data/admin-indexer.log',
    'session_timeout' => 3600 // 1 hora
];

// Función de seguridad
function requireAuth() {
    global $config;

    // Verificar si ya está autenticado
    if (isset($_SESSION['admin_authenticated']) &&
        $_SESSION['admin_authenticated'] === true &&
        isset($_SESSION['admin_login_time']) &&
        (time() - $_SESSION['admin_login_time']) < $config['session_timeout']) {
        return true;
    }

    // Verificar credenciales POST
    if ($_SERVER['REQUEST_METHOD'] === 'POST' &&
        isset($_POST['password']) &&
        $_POST['password'] === $config['admin_password']) {
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_login_time'] = time();
        logMessage("Inicio de sesión exitoso desde IP: " . $_SERVER['REMOTE_ADDR'], $config);
        return true;
    }

    return false;
}

// Función para logging
function logMessage($message, $config) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($config['log_file'], $logMessage, FILE_APPEND);
}

// Función para regenerar search-local.js
function regenerateSearchLocal($config) {
    if (!file_exists($config['index_file'])) {
        throw new Exception("Archivo de índice JSON no encontrado");
    }

    $indexData = json_decode(file_get_contents($config['index_file']), true);
    if (!$indexData) {
        throw new Exception("Error al leer índice JSON");
    }

    logMessage("Iniciando regeneración de search-local.js con {$indexData['total_pdfs']} PDFs", $config);

    // Plantilla actualizada de search-local.js
    $template = "// Sistema de búsqueda local con datos incrustados
// ÚLTIMA ACTUALIZACIÓN: " . date('Y-m-d H:i:s') . "
console.log('🔍 Iniciando búsqueda local con datos incrustados...');

// Función de búsqueda optimizada
class LocalSearchEngine {
    constructor() {
        this.data = null;
        this.init();
    }

    init() {
        // Datos incrustados directamente - ACTUALIZADO AUTOMÁTICAMENTE
        const embeddedData = " . json_encode($indexData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";

        this.data = embeddedData;
        console.log(\`✅ Datos cargados: \${this.data.total_pdfs} productos\`);
        console.log(\`📅 Última actualización: \${this.data.generated_at}\`);
    }

    // Búsqueda exacta y por coincidencias
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

        // Filtrar por texto
        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            results = results.filter(pdf => {
                const searchableText = [
                    pdf.title || '',
                    pdf.description || '',
                    pdf.filename || '',
                    (pdf.ingredients || []).join(' '),
                    (pdf.benefits || []).join(' '),
                    (pdf.keywords || []).join(' '),
                    (pdf.tags || []).join(' ')
                ].join(' ').toLowerCase();

                if (fuzzy) {
                    // Búsqueda con tolerancia a errores
                    return searchableText.includes(searchTerm) ||
                           this.levenshteinDistance(searchTerm, searchableText) <= 2;
                } else {
                    return searchableText.includes(searchTerm);
                }
            });
        }

        return results.slice(0, limit);
    }

    // Algoritmo de Levenshtein simplificado para fuzzy search
    levenshteinDistance(str1, str2) {
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

    // Obtener categorías disponibles
    getCategories() {
        if (!this.data || !this.data.pdfs) return [];
        const categories = this.data.pdfs.map(pdf => pdf.category || 'General');
        return [...new Set(categories)].sort();
    }

    // Obtener estadísticas
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

// Inicializar motor de búsqueda global
window.localSearchEngine = new LocalSearchEngine();
console.log('🚀 Motor de búsqueda local inicializado');";

    // Guardar archivo actualizado
    if (file_put_contents($config['search_local_file'], $template)) {
        logMessage("search-local.js regenerado exitosamente", $config);
        return true;
    } else {
        throw new Exception("Error al guardar search-local.js");
    }
}

// Generar índice JSON (usando el script existente)
function generateJSONIndex($config) {
    logMessage("Iniciando generación de índice JSON", $config);

    // Incluir el script existente
    ob_start();
    $result = include __DIR__ . '/generate-index.php';
    $output = ob_get_clean();

    $responseData = json_decode($output, true);

    if ($responseData && $responseData['success']) {
        logMessage("Índice JSON generado: {$responseData['total_pdfs']} PDFs, {$responseData['new_files']} nuevos", $config);
        return $responseData;
    } else {
        throw new Exception("Error al generar índice JSON: " . ($responseData['error'] ?? 'Error desconocido'));
    }
}

// Procesar solicitud
try {
    // Verificar autenticación
    if (!requireAuth()) {
        // Si es POST con contraseña, procesar login
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
            header('Content-Type: application/json');
            if ($_POST['password'] === $config['admin_password']) {
                $_SESSION['admin_authenticated'] = true;
                $_SESSION['admin_login_time'] = time();
                logMessage("Inicio de sesión exitoso desde IP: " . $_SERVER['REMOTE_ADDR'], $config);
                echo json_encode(['success' => true, 'redirect' => 'admin-indexer.php']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Contraseña incorrecta']);
            }
            exit;
        }

        // Si es POST para otras acciones, no está autenticado
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Acción no válida']);
            exit;
        }

        // Mostrar formulario de login
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
                input[type="password"] { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 16px; transition: border-color 0.3s; }
                input[type="password"]:focus { outline: none; border-color: #667eea; }
                .btn { width: 100%; background: #667eea; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; transition: background 0.3s; }
                .btn:hover { background: #5a6fd8; }
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
                <form id="loginForm" method="POST">
                    <div class="form-group">
                        <label for="password">Contraseña de Administrador:</label>
                        <input type="password" id="password" name="password" required autocomplete="current-password">
                    </div>
                    <button type="submit" class="btn">Acceder</button>
                </form>

                <script>
                document.getElementById('loginForm').addEventListener('submit', async function(e) {
                    e.preventDefault();

                    const btn = e.target.querySelector('button[type="submit"]');
                    const originalText = btn.textContent;
                    btn.disabled = true;
                    btn.textContent = 'Verificando...';

                    try {
                        const formData = new FormData(e.target);
                        const response = await fetch('admin-indexer.php', {
                            method: 'POST',
                            body: formData
                        });

                        const result = await response.json();

                        if (result.success) {
                            window.location.reload();
                        } else {
                            alert('❌ Error: ' + result.error);
                            btn.disabled = false;
                            btn.textContent = originalText;
                        }
                    } catch (error) {
                        alert('❌ Error de conexión: ' + error.message);
                        btn.disabled = false;
                        btn.textContent = originalText;
                    }
                });
                </script>
                <div class="security-notice">
                    <h4>🛡️ Zona Segura</h4>
                    <p>Esta área está restringida al administrador. Todas las acciones son registradas para fines de seguridad.</p>
                </div>
            </div>
        </body>
        </html>
        <?php
        exit;
    }

    // Procesar acciones POST (ya autenticado)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        header('Content-Type: application/json');

        $action = $_POST['action'] ?? '';

        try {
            switch ($action) {
                case 'index_all':
                    logMessage("INICIO: Indexación completa solicitada", $config);

                    // 1. Generar índice JSON
                    $jsonResult = generateJSONIndex($config);

                    // 2. Regenerar search-local.js
                    regenerateSearchLocal($config);

                    // 3. Respuesta exitosa
                    logMessage("COMPLETO: Indexación finalizada exitosamente", $config);

                    echo json_encode([
                        'success' => true,
                        'message' => 'Indexación completada exitosamente',
                        'json_index' => $jsonResult,
                        'timestamp' => date('Y-m-d H:i:s')
                    ]);
                    break;

                case 'logout':
                    session_destroy();
                    echo json_encode(['success' => true, 'message' => 'Sesión cerrada']);
                    break;

                default:
                    throw new Exception('Acción no válida');
            }
        } catch (Exception $e) {
            logMessage("ERROR: " . $e->getMessage(), $config);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
        exit;
    }

    // Mostrar panel de control (usuario autenticado)
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

            .log-section { margin-top: 30px; }
            .log-container { background: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 8px; font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; max-height: 400px; overflow-y: auto; }
            .log-entry { margin-bottom: 5px; padding: 5px; border-radius: 3px; }
            .log-success { background: rgba(40, 167, 69, 0.2); }
            .log-error { background: rgba(220, 53, 69, 0.2); }
            .log-info { background: rgba(23, 162, 184, 0.2); }

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

            <div class="card log-section">
                <h2>📋 Registro de Actividades</h2>
                <div class="log-container" id="logContainer">
                    Cargando registros...
                </div>
            </div>
        </div>

        <script>
            // Cargar estadísticas
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

            // Formatear tamaño de archivo
            function formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }

            // Formatear fecha
            function formatDate(dateString) {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                return date.toLocaleString('es-ES');
            }

            // Indexar todos los PDFs
            async function indexAll() {
                const btn = document.getElementById('indexBtn');
                const loading = document.getElementById('loading');

                if (confirm('¿Estás seguro de que quieres reindexar todos los PDFs?\\n\\nEste proceso:\\n• Escaneará todos los PDFs en la carpeta\\n• Actualizará el índice JSON\\n• Regenerará search-local.js\\n• Mantendrá todos los contadores de descargas')) {

                    btn.disabled = true;
                    loading.style.display = 'block';

                    try {
                        const response = await fetch('admin-indexer.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: 'action=index_all'
                        });

                        const result = await response.json();

                        if (result.success) {
                            alert('✅ ' + result.message + '\\n\\nPDFs procesados: ' + result.json_index.total_pdfs + '\\nNuevos PDFs: ' + result.json_index.new_files);
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

            // Cerrar sesión
            async function logout() {
                try {
                    await fetch('admin-indexer.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'action=logout'
                    });
                    location.reload();
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                }
            }

            // Cargar logs
            async function loadLogs() {
                try {
                    const response = await fetch('../data/admin-indexer.log');
                    const text = await response.text();
                    const container = document.getElementById('logContainer');

                    if (text.trim()) {
                        const lines = text.split('\\n').reverse().slice(0, 50);
                        container.innerHTML = lines.map(line => {
                            let className = 'log-entry';
                            if (line.includes('ERROR')) className += ' log-error';
                            else if (line.includes('COMPLETO') || line.includes('✅')) className += ' log-success';
                            else className += ' log-info';

                            return `<div class="${className}">${line}</div>`;
                        }).join('');
                    } else {
                        container.innerHTML = '<div class="log-entry log-info">No hay registros disponibles</div>';
                    }
                } catch (error) {
                    document.getElementById('logContainer').innerHTML = '<div class="log-entry log-error">Error al cargar registros: ' + error.message + '</div>';
                }
            }

            // Inicializar
            document.addEventListener('DOMContentLoaded', function() {
                loadStats();
                loadLogs();

                // Actualizar cada 30 segundos
                setInterval(() => {
                    loadStats();
                    loadLogs();
                }, 30000);
            });
        </script>
    </body>
    </html>
    <?php

} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>