<?php
/**
 * Script para verificar el estado del sistema de PDFs
 */

header('Content-Type: text/html; charset=utf-8');

$pdfDir = __DIR__ . '/pdfs/';
$dataDir = __DIR__ . '/data/';
$indexFile = __DIR__ . '/data/pdf-index.json';

echo "<h1>📋 Verificación del Sistema PDF</h1>";

// Verificar carpeta pdfs
echo "<h2>📁 Carpeta PDFs:</h2>";
if (file_exists($pdfDir)) {
    echo "✅ Carpeta pdfs existe<br>";
    $pdfFiles = glob($pdfDir . '*.pdf');
    echo "📄 Encontrados " . count($pdfFiles) . " archivos PDF:<br>";
    echo "<ul>";
    foreach ($pdfFiles as $pdf) {
        $filename = basename($pdf);
        $size = filesize($pdf);
        echo "<li>$filename - " . round($size / 1024 / 1024, 2) . " MB</li>";
    }
    echo "</ul>";
} else {
    echo "❌ Carpeta pdfs NO existe<br>";
}

// Verificar carpeta data
echo "<h2>📁 Carpeta Data:</h2>";
if (file_exists($dataDir)) {
    echo "✅ Carpeta data existe<br>";
} else {
    echo "❌ Carpeta data NO existe - Creando...<br>";
    mkdir($dataDir, 0755, true);
    echo "✅ Carpeta data creada<br>";
}

// Verificar archivo de índice
echo "<h2>📄 Archivo de Índice:</h2>";
if (file_exists($indexFile)) {
    echo "✅ Archivo pdf-index.json existe<br>";
    echo "📊 Tamaño: " . round(filesize($indexFile) / 1024, 2) . " KB<br>";
    echo "🕒 Modificado: " . date('Y-m-d H:i:s', filemtime($indexFile)) . "<br>";

    // Mostrar contenido
    $content = file_get_contents($indexFile);
    $data = json_decode($content, true);
    if ($data && isset($data['pdfs'])) {
        echo "📋 Total PDFs en índice: " . count($data['pdfs']) . "<br>";
    }
} else {
    echo "❌ Archivo pdf-index.json NO existe<br>";
}

// Verificar permisos
echo "<h2>🔐 Permisos:</h2>";
echo "Carpeta pdfs: " . substr(sprintf('%o', fileperms($pdfDir)), -4) . "<br>";
echo "Carpeta data: " . substr(sprintf('%o', fileperms($dataDir)), -4) . "<br>";

// Botones de acción
echo "<h2>🛠️ Acciones:</h2>";
echo "<button onclick='generateIndex()'>🔄 Generar Índice</button>";
echo "<button onclick='clearCache()'>🗑️ Limpiar Cache</button>";

echo "<script>
function generateIndex() {
    fetch('php/generate-index.php')
        .then(response => response.json())
        .then(data => {
            alert('Índice generado: ' + JSON.stringify(data, null, 2));
            location.reload();
        });
}

function clearCache() {
    if (confirm('¿Limpiar cache del navegador?')) {
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        localStorage.clear();
        sessionStorage.clear();
        alert('Cache limpiada. Recarga la página.');
    }
}
</script>";
?>