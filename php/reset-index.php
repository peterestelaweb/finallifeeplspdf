<?php
/**
 * Script para limpiar y regenerar el índice de PDFs
 */

$dataDir = __DIR__ . '/../data';

echo "<h1>🧹 Limpieza y Regeneración del Índice</h1>";

// Eliminar archivos existentes
$filesToDelete = [
    $dataDir . '/pdf-index.json',
    $dataDir . '/last-check.txt',
    $dataDir . '/last-check-time.txt'
];

foreach ($filesToDelete as $file) {
    if (file_exists($file)) {
        if (unlink($file)) {
            echo "<p>✅ Archivo eliminado: " . basename($file) . "</p>";
        } else {
            echo "<p>❌ Error al eliminar: " . basename($file) . "</p>";
        }
    } else {
        echo "<p>📄 Archivo no existe: " . basename($file) . "</p>";
    }
}

echo "<h2>🔄 Generando nuevo índice...</h2>";

// Llamar al script de generación
$response = file_get_contents('http://' . $_SERVER['HTTP_HOST'] . '/php/generate-index.php');
$data = json_decode($response, true);

if ($data && $data['success']) {
    echo "<p>✅ Índice generado correctamente</p>";
    echo "<p>📊 Total PDFs: " . $data['total_pdfs'] . "</p>";
    echo "<p>📁 Nuevos archivos: " . $data['new_files'] . "</p>";
    echo "<p>🔄 Archivos actualizados: " . $data['updated_files'] . "</p>";
} else {
    echo "<p>❌ Error al generar índice</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
}

// Verificar estado final
echo "<h2>📋 Estado Final:</h2>";
$checkResponse = file_get_contents('http://' . $_SERVER['HTTP_HOST'] . '/php/check-index.php');
$checkData = json_decode($checkResponse, true);

echo "<pre>" . htmlspecialchars($checkResponse) . "</pre>";

echo "<p><a href='/'>Volver al inicio</a></p>";
?>