<?php
/**
 * Script para actualizar términos de búsqueda OMEGA3 en el índice principal
 * Agrega "omega3" y "omega-3" como términos de búsqueda para OMEGOLD y VEGAN OMEGOLD
 */

header('Content-Type: application/json');

try {
    // Ruta al archivo JSON principal
    $indexPath = __DIR__ . '/../data/pdf-index.json';

    if (!file_exists($indexPath)) {
        throw new Exception('Archivo pdf-index.json no encontrado');
    }

    // Leer el archivo JSON
    $jsonContent = file_get_contents($indexPath);
    $data = json_decode($jsonContent, true);

    if (!$data) {
        throw new Exception('Error al decodificar JSON');
    }

    $productosActualizados = 0;
    $productosEncontrados = [];

    // Actualizar cada producto
    foreach ($data as &$producto) {
        $actualizado = false;
        $nombreOriginal = $producto['title'] ?? '';
        $descripcionOriginal = $producto['description'] ?? '';

        // Buscar OMEGOLD
        if (strpos(strtoupper($nombreOriginal), 'OMEGOLD') !== false) {
            $productosEncontrados[] = $nombreOriginal;

            // Agregar "omega3" y "omega-3" a los términos de búsqueda
            if (!isset($producto['searchTerms'])) {
                $producto['searchTerms'] = [];
            }

            // Agregar términos si no existen
            if (!in_array('omega3', $producto['searchTerms'])) {
                $producto['searchTerms'][] = 'omega3';
                $actualizado = true;
            }

            if (!in_array('omega-3', $producto['searchTerms'])) {
                $producto['searchTerms'][] = 'omega-3';
                $actualizado = true;
            }

            // También agregar como palabras clave si existe el campo
            if (!isset($producto['keywords'])) {
                $producto['keywords'] = [];
            }

            if (!in_array('omega3', $producto['keywords'])) {
                $producto['keywords'][] = 'omega3';
                $actualizado = true;
            }

            if (!in_array('omega-3', $producto['keywords'])) {
                $producto['keywords'][] = 'omega-3';
                $actualizado = true;
            }
        }

        // Buscar VEGAN OMEGOLD
        if (strpos(strtoupper($nombreOriginal), 'VEGAN') !== false && strpos(strtoupper($nombreOriginal), 'OMEGOLD') !== false) {
            if (!in_array($nombreOriginal, $productosEncontrados)) {
                $productosEncontrados[] = $nombreOriginal;

                // Agregar términos de búsqueda
                if (!isset($producto['searchTerms'])) {
                    $producto['searchTerms'] = [];
                }

                if (!in_array('omega3', $producto['searchTerms'])) {
                    $producto['searchTerms'][] = 'omega3';
                    $actualizado = true;
                }

                if (!in_array('omega-3', $producto['searchTerms'])) {
                    $producto['searchTerms'][] = 'omega-3';
                    $actualizado = true;
                }

                if (!isset($producto['keywords'])) {
                    $producto['keywords'] = [];
                }

                if (!in_array('omega3', $producto['keywords'])) {
                    $producto['keywords'][] = 'omega3';
                    $actualizado = true;
                }

                if (!in_array('omega-3', $producto['keywords'])) {
                    $producto['keywords'][] = 'omega-3';
                    $actualizado = true;
                }
            }
        }

        if ($actualizado) {
            $productosActualizados++;
        }
    }

    // Guardar el JSON actualizado
    $jsonActualizado = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    file_put_contents($indexPath, $jsonActualizado);

    // Crear backup
    $backupFile = $indexPath . '.backup.' . date('Y-m-d-H-i-s');
    copy($indexPath, $backupFile);

    echo json_encode([
        'success' => true,
        'message' => 'Términos OMEGA3 actualizados correctamente',
        'productos_encontrados' => $productosEncontrados,
        'productos_actualizados' => $productosActualizados,
        'backup_creado' => basename($backupFile),
        'total_productos' => count($data),
        'fecha_actualizacion' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'error' => $e->getMessage()
    ]);
}
?>