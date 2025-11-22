<?php
/**
 * Script para arreglar permisos de archivos PDF y crear un gestor de descargas mejorado
 */

$pdfsDir = __DIR__ . '/../pdfs';

echo "<h1>🔧 Fix PDF Permissions</h1>";

// Verificar si el directorio pdfs existe
if (!file_exists($pdfsDir)) {
    echo "<p style='color: red;'>❌ El directorio pdfs no existe. Creándolo...</p>";
    mkdir($pdfsDir, 0755, true);
} else {
    echo "<p>✅ Directorio pdfs encontrado</p>";
}

// Listar archivos PDF
$pdfFiles = glob($pdfsDir . '/*.pdf');
echo "<h3>📄 Archivos PDF encontrados: " . count($pdfFiles) . "</h3>";

if (count($pdfFiles) === 0) {
    echo "<p style='color: orange;'>⚠️ No se encontraron archivos PDF en el directorio.</p>";
    echo "<p>Por favor, sube los archivos PDF a la carpeta <code>pdfs/</code></p>";
} else {
    echo "<ul>";
    foreach ($pdfFiles as $pdfFile) {
        $filename = basename($pdfFile);
        $fileSize = filesize($pdfFile);
        $perms = fileperms($pdfFile);

        // Fix permissions
        if (!chmod($pdfFile, 0644)) {
            echo "<li style='color: red;'>❌ $filename - Error al cambiar permisos</li>";
        } else {
            echo "<li style='color: green;'>✅ $filename - " . formatFileSize($fileSize) . " - Permisos arreglados</li>";
        }
    }
    echo "</ul>";
}

// Crear un .htaccess para PDFs
$htaccessContent = "
# Configuración para PDFs
<FilesMatch \"\.pdf$\">
    Order Allow,Deny
    Allow from all
    # Forzar descarga correcta
    Header set Content-Disposition attachment
    Header set Content-Type application/pdf
</FilesMatch>

# Desactivar buffering para descargas grandes
php_flag output_buffering off
php_value output_buffering 0
";

$htaccessFile = $pdfsDir . '/.htaccess';
if (file_put_contents($htaccessFile, $htaccessContent)) {
    echo "<p style='color: green;'>✅ .htaccess creado para PDFs</p>";
} else {
    echo "<p style='color: red;'>❌ Error al crear .htaccess para PDFs</p>";
}

// Crear script de descarga mejorado
$downloadScript = <<<PHP
<?php
/**
 * Script de descarga de PDFs mejorado
 */

$pdfDir = __DIR__ . '/../pdfs';
$filename = isset($_GET['file']) ? basename($_GET['file']) : '';

// Validar que el archivo exista
if (empty($filename) || !file_exists(\$pdfDir . '/' . \$filename)) {
    header('HTTP/1.0 404 Not Found');
    echo 'Archivo no encontrado';
    exit;
}

// Validar que sea un PDF
if (strtolower(pathinfo(\$filename, PATHINFO_EXTENSION)) !== 'pdf') {
    header('HTTP/1.0 403 Forbidden');
    echo 'Acceso denegado';
    exit;
}

\$filePath = \$pdfDir . '/' . \$filename;
\$fileSize = filesize(\$filePath);

// Limpiar buffer
if (ob_get_level()) {
    ob_end_clean();
}

// Headers para descarga
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . \$filename . '"');
header('Content-Length: ' . \$fileSize);
header('Cache-Control: private, no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Enviar archivo
readfile(\$filePath);
exit;
?>
PHP;

$downloadFile = __DIR__ . '/download-pdf.php';
if (file_put_contents($downloadFile, $downloadScript)) {
    echo "<p style='color: green;'>✅ Script de descarga mejorado creado: <a href='download-pdf.php'>test</a></p>";
} else {
    echo "<p style='color: red;'>❌ Error al crear script de descarga</p>";
}

// Función para formatear tamaño
function formatFileSize($bytes) {
    if ($bytes == 0) return '0 Bytes';
    $k = 1024;
    $sizes = ['Bytes', 'KB', 'MB', 'GB'];
    $i = floor(log($bytes, 1024));
    return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
}

echo "<h3>🔍 Instrucciones:</h3>";
echo "<ol>";
echo "<li>Verifica que los archivos PDF estén en la carpeta <code>pdfs/</code></li>";
echo "<li>Asegúrate de que tengan permisos de lectura (644)</li>";
echo "<li>Usa el nuevo script de descarga: <code>php/download-pdf.php?file=nombre.pdf</code></li>";
echo "<li>El .htaccess configurado ayudará con la descarga directa</li>";
echo "</ol>";

echo "<p><a href='javascript:history.back()'>← Volver</a></p>";
?>