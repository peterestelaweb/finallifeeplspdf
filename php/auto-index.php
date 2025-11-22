<?php
/**
 * Script de indexación automática para cron jobs
 *
 * Este script está diseñado para ejecutarse automáticamente via cron job
 * para mantener el índice de PDFs actualizado.
 *
 * Configuración de cron job recomendada:
 * 0 */6 * * * /usr/bin/php /home/usuario/public_html/pdfs/php/auto-index.php
 * (Se ejecuta cada 6 horas)
 */

// Configuración
$config = [
    'pdfs_dir' => __DIR__ . '/../pdfs/',
    'data_dir' => __DIR__ . '/../data/',
    'index_file' => __DIR__ . '/../data/pdf-index.json',
    'log_file' => __DIR__ . '/../data/auto-index.log',
    'lock_file' => __DIR__ . '/../data/auto-index.lock',
    'last_check_file' => __DIR__ . '/../data/last-check.txt',
    'max_execution_time' => 300 // 5 minutos máximo
];

// Evitar ejecución simultánea
if (file_exists($config['lock_file'])) {
    $lockTime = filemtime($config['lock_file']);
    if (time() - $lockTime < $config['max_execution_time']) {
        die("Script ya está en ejecución.\n");
    } else {
        // Eliminar lock file viejo
        unlink($config['lock_file']);
    }
}

// Crear lock file
file_put_contents($config['lock_file'], getmypid());

// Función para logging
function logMessage($message, $config) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($config['log_file'], $logMessage, FILE_APPEND);
}

try {
    logMessage("=== Iniciando indexación automática ===", $config);

    // Crear directorios si no existen
    if (!file_exists($config['data_dir'])) {
        mkdir($config['data_dir'], 0755, true);
        logMessage("Directorio de datos creado: " . $config['data_dir'], $config);
    }

    // Función para verificar si hay cambios en la carpeta de PDFs
    function hasChanges($pdfsDir, $lastCheckFile) {
        if (!file_exists($lastCheckFile)) {
            return true; // Primera ejecución
        }

        $lastCheck = file_get_contents($lastCheckFile);
        $lastCheckTime = (int)$lastCheck;

        // Obtener última modificación de la carpeta
        $dirModTime = filemtime($pdfsDir);

        // Escanear archivos PDF
        $files = glob($pdfsDir . '*.pdf');
        foreach ($files as $file) {
            $fileModTime = filemtime($file);
            if ($fileModTime > $lastCheckTime) {
                return true; // Hay archivos modificados
            }
        }

        // Verificar si se eliminaron archivos
        if (file_exists($lastCheckFile)) {
            $previousFiles = file($lastCheckFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $currentFiles = array_map('basename', $files);

            if (array_diff($previousFiles, $currentFiles) || array_diff($currentFiles, $previousFiles)) {
                return true; // Hay archivos nuevos o eliminados
            }
        }

        return false;
    }

    // Verificar si hay cambios
    if (!hasChanges($config['pdfs_dir'], $config['last_check_file'])) {
        logMessage("No hay cambios, omitiendo indexación", $config);

        // Actualizar tiempo de última verificación
        file_put_contents($config['last_check_file'], time());

        // Eliminar lock file
        unlink($config['lock_file']);

        echo "No hay cambios que procesar.\n";
        exit(0);
    }

    logMessage("Detectados cambios, iniciando indexación", $config);

    // Incluir el script de generación de índice
    require_once __DIR__ . '/generate-index.php';

    // Actualizar tiempo de última verificación
    file_put_contents($config['last_check_file'], time());

    // Guardar lista de archivos actuales
    $files = glob($config['pdfs_dir'] . '*.pdf');
    $fileList = array_map('basename', $files);
    file_put_contents($config['last_check_file'], implode("\n", $fileList));

    logMessage("=== Indexación automática completada ===", $config);

} catch (Exception $e) {
    logMessage("ERROR en indexación automática: " . $e->getMessage(), $config);
    echo "Error: " . $e->getMessage() . "\n";
} finally {
    // Eliminar lock file
    if (file_exists($config['lock_file'])) {
        unlink($config['lock_file']);
    }
}
?>