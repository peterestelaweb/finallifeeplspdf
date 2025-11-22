<?php
/**
 * Script para generar índice de PDFs automáticamente
 *
 * Este script escanea la carpeta de PDFs y genera un archivo JSON
 * con la metadata de todos los documentos para la búsqueda.
 *
 * Uso:
 * - Manual: Acceder a este script via navegador
 * - Automático: Configurar cron job para ejecución periódica
 */

// Configuración
$config = [
    'pdfs_dir' => __DIR__ . '/../pdfs/',
    'data_dir' => __DIR__ . '/../data/',
    'index_file' => __DIR__ . '/../data/pdf-index.json',
    'log_file' => __DIR__ . '/../data/indexer.log'
];

// Establecer headers para respuesta JSON
header('Content-Type: application/json');

try {
    // Crear directorios si no existen
    if (!file_exists($config['data_dir'])) {
        mkdir($config['data_dir'], 0755, true);
    }

    // Función para logging
    function logMessage($message, $config) {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message\n";
        file_put_contents($config['log_file'], $logMessage, FILE_APPEND);
    }

    // Función para generar título limpio
    function generateTitle($filename) {
        $title = pathinfo($filename, PATHINFO_FILENAME);
        // Eliminar caracteres especiales y limpiar
        $title = preg_replace('/[™®®]/u', '', $title);
        $title = str_replace(['_', '-'], ' ', $title);
        $title = preg_replace('/\s+/', ' ', $title);
        return trim($title);
    }

    // Función para extraer categoría del nombre de archivo
    function extractCategory($filename) {
        $patterns = [
            '/VITAMIN/i',
            '/OMEGA/i',
            '/PROANTH/i',
            '/DAILY/i',
            '/COLLAGEN/i',
            '/MINERAL/i',
            '/SUPPLEMENT/i',
            '/NUTRITION/i',
            '/HEALTH/i',
            '/WELLNESS/i'
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $filename, $matches)) {
                return ucfirst(strtolower($matches[0]));
            }
        }

        return 'General';
    }

    // Función para generar tags
    function generateTags($filename, $title) {
        $tags = [];
        $text = strtolower($filename . ' ' . $title);

        // Palabras clave comunes
        $keywords = [
            'vitamin', 'omega', 'proanth', 'daily', 'collagen',
            'mineral', 'supplement', 'nutrition', 'health',
            'wellness', 'antioxidant', 'immune', 'energy',
            'strength', 'formula', 'complex', 'plus', 'extra'
        ];

        foreach ($keywords as $keyword) {
            if (strpos($text, $keyword) !== false) {
                $tags[] = ucfirst($keyword);
            }
        }

        return array_unique($tags);
    }

    // Escanear carpeta de PDFs
    logMessage("Iniciando escaneo de PDFs en: " . $config['pdfs_dir'], $config);

    if (!file_exists($config['pdfs_dir'])) {
        mkdir($config['pdfs_dir'], 0755, true);
        logMessage("Carpeta de PDFs creada: " . $config['pdfs_dir'], $config);
    }

    $files = scandir($config['pdfs_dir']);
    $pdfFiles = array_filter($files, function($file) {
        return strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'pdf';
    });

    logMessage("Encontrados " . count($pdfFiles) . " archivos PDF", $config);

    // Cargar índice existente si existe
    $existingIndex = [];
    if (file_exists($config['index_file'])) {
        $existingData = file_get_contents($config['index_file']);
        $existingIndex = json_decode($existingData, true);
        if ($existingIndex && isset($existingIndex['pdfs'])) {
            // Convertir a array asociativo por filename para fácil búsqueda
            $tempIndex = [];
            foreach ($existingIndex['pdfs'] as $pdf) {
                $tempIndex[$pdf['filename']] = $pdf;
            }
            $existingIndex = $tempIndex;
        }
    }

    $pdfs = [];
    $newFiles = 0;
    $updatedFiles = 0;

    foreach ($pdfFiles as $filename) {
        $filePath = $config['pdfs_dir'] . $filename;
        $fileStats = stat($filePath);

        // Generar metadata del PDF
        $pdfData = [
            'id' => md5($filename),
            'filename' => $filename,
            'title' => generateTitle($filename),
            'description' => "Documento PDF: " . generateTitle($filename),
            'category' => extractCategory($filename),
            'tags' => generateTags($filename, generateTitle($filename)),
            'filePath' => 'pdfs/' . $filename,
            'fileSize' => $fileStats['size'],
            'mimeType' => 'application/pdf',
            'uploadDate' => date('Y-m-d H:i:s', $fileStats['mtime']),
            'updatedAt' => date('Y-m-d H:i:s'),
            'isActive' => true,
            'downloadCount' => 0
        ];

        // Verificar si es un archivo nuevo o actualizado
        if (!isset($existingIndex[$filename])) {
            $newFiles++;
            logMessage("Nuevo PDF detectado: $filename", $config);
        } else {
            $existing = $existingIndex[$filename];
            if ($existing['fileSize'] != $pdfData['fileSize'] ||
                $existing['uploadDate'] != $pdfData['uploadDate']) {
                $updatedFiles++;
                logMessage("PDF actualizado: $filename", $config);
            } else {
                // Mantener contador de descargas existente
                $pdfData['downloadCount'] = $existing['downloadCount'];
            }
        }

        $pdfs[] = $pdfData;
    }

    // Ordenar por fecha de subida
    usort($pdfs, function($a, $b) {
        return strtotime($b['uploadDate']) - strtotime($a['uploadDate']);
    });

    // Crear estructura del índice
    $indexData = [
        'success' => true,
        'generated_at' => date('Y-m-d H:i:s'),
        'total_pdfs' => count($pdfs),
        'new_files' => $newFiles,
        'updated_files' => $updatedFiles,
        'total_size' => array_sum(array_column($pdfs, 'fileSize')),
        'categories' => array_unique(array_column($pdfs, 'category')),
        'pdfs' => $pdfs
    ];

    // Guardar índice
    $jsonContent = json_encode($indexData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if (file_put_contents($config['index_file'], $jsonContent)) {
        logMessage("Índice generado exitosamente: " . count($pdfs) . " PDFs", $config);

        // Configurar permisos
        chmod($config['index_file'], 0644);

        // Guardar registro de archivos verificados para futuras comprobaciones
        $lastCheckFile = $config['data_dir'] . 'last-check.txt';
        $pdfFiles = glob($config['pdfs_dir'] . '*.pdf');
        $fileList = array_map('basename', $pdfFiles);
        file_put_contents($lastCheckFile, implode("\n", $fileList));

        // Guardar timestamp de última verificación
        file_put_contents($config['data_dir'] . 'last-check-time.txt', time());

        // Respuesta exitosa
        echo json_encode([
            'success' => true,
            'message' => 'Índice generado exitosamente',
            'total_pdfs' => count($pdfs),
            'new_files' => $newFiles,
            'updated_files' => $updatedFiles,
            'generated_at' => date('Y-m-d H:i:s')
        ]);

    } else {
        throw new Exception("No se pudo guardar el archivo de índice");
    }

} catch (Exception $e) {
    // Log error
    if (isset($config)) {
        logMessage("ERROR: " . $e->getMessage(), $config);
    }

    // Respuesta de error
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'message' => 'Error al generar índice'
    ]);
}
?>