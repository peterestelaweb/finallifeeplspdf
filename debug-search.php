<?php
/**
 * Herramienta de depuración de búsqueda - Para encontrar Menaplus
 */

// Cargar índice
$index_file = __DIR__ . '/data/pdf-index.json';

if (!file_exists($index_file)) {
    die('❌ Archivo de índice no encontrado');
}

$index_data = json_decode(file_get_contents($index_file), true);

if (!$index_data || !isset($index_data['pdfs'])) {
    die('❌ Error al leer índice');
}

// Buscar PDFs relacionados con "mena"
$pdfs_mena = [];
$pdfs_all = [];

foreach ($index_data['pdfs'] as $pdf) {
    $pdfs_all[] = $pdf;

    // Buscar en diferentes campos
    $search_text = strtolower(
        $pdf['title'] . ' ' .
        $pdf['filename'] . ' ' .
        ($pdf['description'] ?? '') . ' ' .
        implode(' ', $pdf['tags'] ?? []) . ' ' .
        implode(' ', $pdf['keywords'] ?? [])
    );

    if (strpos($search_text, 'mena') !== false) {
        $pdfs_mena[] = [
            'filename' => $pdf['filename'],
            'title' => $pdf['title'],
            'description' => $pdf['description'] ?? '',
            'category' => $pdf['category'],
            'tags' => $pdf['tags'] ?? [],
            'keywords' => $pdf['keywords'] ?? [],
            'search_text' => $search_text
        ];
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔍 Depuración de Búsqueda - Menaplus</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .card h2 { color: #333; margin-bottom: 15px; }
        .pdf-item { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #007cba; }
        .pdf-filename { font-weight: bold; color: #007cba; margin-bottom: 5px; }
        .pdf-title { font-size: 16px; color: #333; margin-bottom: 8px; }
        .pdf-meta { font-size: 14px; color: #666; line-height: 1.4; }
        .search-text { background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; margin-top: 10px; word-break: break-all; }
        .highlight { background: #fff3cd; padding: 2px 4px; border-radius: 3px; }
        .no-results { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 6px; text-align: center; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat { background: #d1ecf1; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #0c5460; }
        .stat-label { color: #0c5460; font-size: 14px; margin-top: 5px; }
        .search-box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .search-box input { width: 70%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; }
        .search-box button { width: 25%; background: #007cba; color: white; border: none; padding: 10px; border-radius: 4px; font-size: 16px; cursor: pointer; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h2>🔍 Herramienta de Depuración de Búsqueda</h2>
            <p>Investigando por qué "Menaplus" no aparece en las búsquedas...</p>

            <div class="stats">
                <div class="stat">
                    <div class="stat-number"><?php echo count($index_data['pdfs']); ?></div>
                    <div class="stat-label">Total PDFs Indexados</div>
                </div>
                <div class="stat">
                    <div class="stat-number"><?php echo count($pdfs_mena); ?></div>
                    <div class="stat-label">PDFs con "mena" encontrado</div>
                </div>
                <div class="stat">
                    <div class="stat-number"><?php echo $index_data['generated_at']; ?></div>
                    <div class="stat-label">Última Actualización</div>
                </div>
            </div>
        </div>

        <div class="search-box">
            <h3>🔎 Prueba de Búsqueda Rápida:</h3>
            <input type="text" id="searchInput" placeholder="Escribe 'mena' o 'Menaplus' para probar">
            <button onclick="testSearch()">Buscar</button>
            <div id="searchResults" style="margin-top: 15px;"></div>
        </div>

        <div class="card">
            <h2>📋 PDFs que contienen "mena":</h2>
            <?php if (empty($pdfs_mena)): ?>
                <div class="no-results">
                    <strong>❌ NO SE ENCONTRARON PDFs con "mena" en los términos de búsqueda</strong>
                    <p>Esto explica por qué "Menaplus" no aparece en las búsquedas.</p>
                </div>
            <?php else: ?>
                <?php foreach ($pdfs_mena as $pdf): ?>
                    <div class="pdf-item">
                        <div class="pdf-filename">📄 <?php echo htmlspecialchars($pdf['filename']); ?></div>
                        <div class="pdf-title"><strong>Título:</strong> <?php echo htmlspecialchars($pdf['title']); ?></div>
                        <div class="pdf-meta">
                            <strong>Categoría:</strong> <?php echo htmlspecialchars($pdf['category']); ?><br>
                            <strong>Tags:</strong> <?php echo implode(', ', array_map('htmlspecialchars', $pdf['tags'])); ?><br>
                            <strong>Keywords:</strong> <?php echo implode(', ', array_map('htmlspecialchars', $pdf['keywords'])); ?>
                        </div>
                        <div class="search-text">
                            <strong>Texto searchable:</strong><br>
                            <?php
                            $highlighted = str_replace('mena', '<span class="highlight">mena</span>', $pdf['search_text']);
                            echo $highlighted;
                            ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <div class="card">
            <h2>📂 Todos los PDFs Indexados:</h2>
            <p>Lista completa para verificar el nombre exacto del archivo "Menaplus":</p>

            <?php
            $menaplus_found = false;
            foreach ($pdfs_all as $pdf):
                $is_mena = strpos(strtolower($pdf['filename']), 'mena') !== false;
                if ($is_mena) $menaplus_found = true;
            ?>
                <div class="pdf-item" style="border-left-color: <?php echo $is_mena ? '#28a745' : '#007cba'; ?>;">
                    <div class="pdf-filename" style="color: <?php echo $is_mena ? '#28a745' : '#007cba'; ?>;">
                        📄 <?php echo htmlspecialchars($pdf['filename']); ?> <?php if ($is_mena) echo '⭐'; ?>
                    </div>
                    <div class="pdf-title"><?php echo htmlspecialchars($pdf['title']); ?></div>
                </div>
            <?php endforeach; ?>

            <?php if (!$menaplus_found): ?>
                <div class="no-results">
                    <strong>❌ NO SE ENCONTRO NINGÚN PDF con "mena" en el nombre del archivo</strong>
                    <p>Verifica que el archivo esté correctamente nombrado en la carpeta /pdfs/</p>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <script>
        function testSearch() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const resultsDiv = document.getElementById('searchResults');

            if (!query) {
                resultsDiv.innerHTML = '<div style="color: #666;">Escribe algo para buscar</div>';
                return;
            }

            // Simular búsqueda (similar a como funciona el buscador real)
            const pdfs = <?php echo json_encode($index_data['pdfs']); ?>;
            const results = [];

            pdfs.forEach(pdf => {
                const searchText = (
                    (pdf.title || '') + ' ' +
                    (pdf.filename || '') + ' ' +
                    (pdf.description || '') + ' ' +
                    (pdf.tags || []).join(' ') + ' ' +
                    (pdf.keywords || []).join(' ')
                ).toLowerCase();

                if (searchText.includes(query)) {
                    results.push(pdf);
                }
            });

            if (results.length === 0) {
                resultsDiv.innerHTML = '<div class="no-results">❌ No se encontraron resultados para "' + query + '"</div>';
            } else {
                resultsDiv.innerHTML = '<strong>✅ Se encontraron ' + results.length + ' resultados:</strong><br>' +
                    results.map(pdf => '📄 ' + pdf.filename).join('<br>');
            }
        }

        // Buscar automáticamente con 'mena'
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('searchInput').value = 'mena';
            testSearch();
        });
    </script>
</body>
</html>