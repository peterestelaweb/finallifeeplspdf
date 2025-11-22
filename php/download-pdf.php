<?php
/**
 * Script de descarga de PDFs mejorado
 */

$pdfDir = __DIR__ . '/../pdfs';
$filename = isset($_GET['file']) ? basename($_GET['file']) : '';

// Validar que el archivo exista
if (empty($filename) || !file_exists($pdfDir . '/' . $filename)) {
    header('HTTP/1.0 404 Not Found');
    echo 'Archivo no encontrado';
    exit;
}

// Validar que sea un PDF
if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) !== 'pdf') {
    header('HTTP/1.0 403 Forbidden');
    echo 'Acceso denegado';
    exit;
}

$filePath = $pdfDir . '/' . $filename;
$fileSize = filesize($filePath);

// Limpiar buffer
if (ob_get_level()) {
    ob_end_clean();
}

// Headers para descarga
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . $fileSize);
header('Cache-Control: private, no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Enviar archivo
readfile($filePath);
exit;
?>