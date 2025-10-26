<?php
/**
 * Interfaz web para escanear y gestionar PDFs
 *
 * Este script proporciona una interfaz amigable para:
 * - Ver el estado actual del índice
 * - Escanear manualmente nuevos PDFs
 * - Ver logs del sistema
 * - Configurar opciones
 */

// Configuración
$config = [
    'pdfs_dir' => __DIR__ . '/../pdfs/',
    'data_dir' => __DIR__ . '/../data/',
    'index_file' => __DIR__ . '/../data/pdf-index.json',
    'log_file' => __DIR__ . '/../data/indexer.log'
];

// Función para formatear tamaño de archivo
function formatFileSize($bytes) {
    if ($bytes == 0) return '0 Bytes';
    $k = 1024;
    $sizes = ['Bytes', 'KB', 'MB', 'GB'];
    $i = floor(log($bytes, 1024));
    return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
}

// Función para formatear fecha
function formatDate($dateString) {
    return date('d/m/Y H:i', strtotime($dateString));
}

// Función para leer logs
function readLogs($logFile, $lines = 50) {
    if (!file_exists($logFile)) {
        return [];
    }

    $logs = [];
    $file = fopen($logFile, 'r');
    $counter = 0;

    while (!feof($file) && $counter < $lines) {
        $line = fgets($file);
        if (trim($line) !== '') {
            array_unshift($logs, trim($line));
            $counter++;
        }
    }

    fclose($file);
    return $logs;
}

// Obtener acción solicitada
$action = $_GET['action'] ?? 'dashboard';

// Procesar acciones POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');

    try {
        switch ($_POST['action']) {
            case 'scan':
                // Ejecutar escaneo
                $result = include __DIR__ . '/generate-index.php';
                echo json_encode([
                    'success' => true,
                    'message' => 'Escaneo completado'
                ]);
                break;

            case 'clear_logs':
                // Limpiar logs
                if (file_exists($config['log_file'])) {
                    unlink($config['log_file']);
                }
                echo json_encode([
                    'success' => true,
                    'message' => 'Logs limpiados'
                ]);
                break;

            default:
                throw new Exception('Acción no válida');
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

// Mostrar interfaz según acción
switch ($action) {
    case 'dashboard':
    default:
        // Cargar datos del índice
        $indexData = [
            'total_pdfs' => 0,
            'total_size' => 0,
            'categories' => [],
            'pdfs' => []
        ];

        if (file_exists($config['index_file'])) {
            $jsonContent = file_get_contents($config['index_file']);
            $indexData = json_decode($jsonContent, true);
        }

        // Obtener archivos en la carpeta
        $pdfFiles = glob($config['pdfs_dir'] . '*.pdf');
        $folderCount = count($pdfFiles);
        $folderSize = array_sum(array_map('filesize', $pdfFiles));

        // Obtener logs recientes
        $logs = readLogs($config['log_file'], 20);

        // Mostrar dashboard
        ?>
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Panel de Control - PDF Search</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: #f5f5f5;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .header {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .stat-number {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #333;
                }
                .stat-label {
                    color: #666;
                    margin-top: 5px;
                }
                .actions {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .btn {
                    background: #007cba;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 10px;
                    font-size: 14px;
                }
                .btn:hover {
                    background: #005a87;
                }
                .btn-danger {
                    background: #dc3545;
                }
                .btn-danger:hover {
                    background: #c82333;
                }
                .logs {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .log-entry {
                    padding: 8px;
                    border-bottom: 1px solid #eee;
                    font-family: monospace;
                    font-size: 13px;
                }
                .log-entry:last-child {
                    border-bottom: none;
                }
                .log-error {
                    color: #dc3545;
                }
                .log-success {
                    color: #28a745;
                }
                .log-info {
                    color: #007cba;
                }
                .recent-pdfs {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .pdf-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                }
                .pdf-item:last-child {
                    border-bottom: none;
                }
                .pdf-name {
                    font-weight: 500;
                }
                .pdf-date {
                    color: #666;
                    font-size: 14px;
                }
                .status-synced {
                    color: #28a745;
                }
                .status-pending {
                    color: #ffc107;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📊 Panel de Control - PDF Search</h1>
                    <p>Gestiona tu biblioteca de PDFs y monitorea el sistema de búsqueda</p>
                </div>

                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number"><?php echo $indexData['total_pdfs']; ?></div>
                        <div class="stat-label">PDFs Indexados</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number"><?php echo $folderCount; ?></div>
                        <div class="stat-label">PDFs en Carpeta</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number"><?php echo formatFileSize($indexData['total_size']); ?></div>
                        <div class="stat-label">Tamaño Total Indexado</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number"><?php echo count($indexData['categories']); ?></div>
                        <div class="stat-label">Categorías</div>
                    </div>
                </div>

                <div class="actions">
                    <h3>🛠️ Acciones Rápidas</h3>
                    <button class="btn" onclick="scanPdfs()">🔄 Escanear Nuevos PDFs</button>
                    <button class="btn btn-danger" onclick="clearLogs()">🗑️ Limpiar Logs</button>
                    <a href="generate-index.php" class="btn" target="_blank">📄 Ver Índice JSON</a>
                    <a href="../" class="btn" target="_blank">🔍 Ver Buscador</a>
                </div>

                <?php if ($indexData['total_pdfs'] > 0): ?>
                <div class="recent-pdfs">
                    <h3>📄 PDFs Recientes</h3>
                    <?php
                    $recentPdfs = array_slice($indexData['pdfs'], 0, 10);
                    foreach ($recentPdfs as $pdf):
                    ?>
                    <div class="pdf-item">
                        <div class="pdf-name"><?php echo htmlspecialchars($pdf['title']); ?></div>
                        <div class="pdf-date"><?php echo formatDate($pdf['uploadDate']); ?></div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>

                <div class="logs">
                    <h3>📋 Logs Recientes</h3>
                    <?php if (empty($logs)): ?>
                    <p>No hay logs disponibles.</p>
                    <?php else: ?>
                    <?php foreach ($logs as $log): ?>
                    <div class="log-entry <?php
                        if (strpos($log, 'ERROR') !== false) echo 'log-error';
                        elseif (strpos($log, '✅') !== false || strpos($log, 'exitoso') !== false) echo 'log-success';
                        else echo 'log-info';
                    ?>">
                        <?php echo htmlspecialchars($log); ?>
                    </div>
                    <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

            <script>
                function scanPdfs() {
                    if (!confirm('¿Estás seguro de que quieres escanear nuevos PDFs?')) {
                        return;
                    }

                    const btn = event.target;
                    btn.disabled = true;
                    btn.textContent = 'Escaneando...';

                    fetch('<?php echo $_SERVER['PHP_SELF']; ?>', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: 'action=scan'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('✅ Escaneo completado exitosamente');
                            location.reload();
                        } else {
                            alert('❌ Error: ' + (data.error || data.message));
                        }
                    })
                    .catch(error => {
                        alert('❌ Error de conexión: ' + error.message);
                    })
                    .finally(() => {
                        btn.disabled = false;
                        btn.textContent = '🔄 Escanear Nuevos PDFs';
                    });
                }

                function clearLogs() {
                    if (!confirm('¿Estás seguro de que quieres limpiar todos los logs?')) {
                        return;
                    }

                    fetch('<?php echo $_SERVER['PHP_SELF']; ?>', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: 'action=clear_logs'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('✅ Logs limpiados exitosamente');
                            location.reload();
                        } else {
                            alert('❌ Error: ' + (data.error || data.message));
                        }
                    })
                    .catch(error => {
                        alert('❌ Error de conexión: ' + error.message);
                    });
                }
            </script>
        </body>
        </html>
        <?php
        break;
}
?>