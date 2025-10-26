<?php
/**
 * Script para verificar si el índice de PDFs necesita actualización
 */

$pdfDir = __DIR__ . '/../pdfs';
$dataFile = __DIR__ . '/../data/pdf-index.json';
$lastCheckFile = __DIR__ . '/../data/last-check.txt';
$lastCheckTimeFile = __DIR__ . '/../data/last-check-time.txt';

// Función para verificar si hay cambios
function needsUpdate($pdfDir, $dataFile, $lastCheckFile, $lastCheckTimeFile) {
    // Si no existe el archivo de índice, necesita actualización
    if (!file_exists($dataFile)) {
        return true;
    }

    // Si no existe el archivo de última verificación, necesita actualización
    if (!file_exists($lastCheckFile)) {
        return true;
    }

    // Si no existe el archivo de timestamp, necesita actualización
    if (!file_exists($lastCheckTimeFile)) {
        return true;
    }

    $lastCheckTime = (int)file_get_contents($lastCheckTimeFile);

    // Obtener archivos PDF actuales
    $currentFiles = glob($pdfDir . '/*.pdf');
    $currentFilenames = array_map('basename', $currentFiles);

    // Cargar archivos anteriores desde el último check
    $previousFiles = file($lastCheckFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($previousFiles === false) {
        $previousFiles = [];
    }

    // Verificar si hay archivos nuevos o eliminados
    $added = array_diff($currentFilenames, $previousFiles);
    $removed = array_diff($previousFiles, $currentFilenames);

    if (!empty($added) || !empty($removed)) {
        return true;
    }

    // Verificar si algún archivo fue modificado
    foreach ($currentFiles as $file) {
        $fileModTime = filemtime($file);
        if ($fileModTime > $lastCheckTime) {
            return true;
        }
    }

    return false;
}

// Verificar si necesita actualización
$needsUpdate = needsUpdate($pdfDir, $dataFile, $lastCheckFile, $lastCheckTimeFile);

// Siempre devolver respuesta JSON
header('Content-Type: application/json');
echo json_encode([
    'needsUpdate' => $needsUpdate,
    'timestamp' => time(),
    'lastCheck' => file_exists($lastCheckTimeFile) ? file_get_contents($lastCheckTimeFile) : null
]);
?>