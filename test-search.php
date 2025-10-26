<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔍 Test de Búsqueda - Menaplus</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .test-btn { background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin: 5px; }
        .test-btn:hover { background: #005a87; }
        .result { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; font-family: monospace; }
        .found { background: #d4edda; color: #155724; border-left: 4px solid #28a745; }
        .not-found { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>🔍 Test de Búsqueda - Menaplus</h1>
            <p>Prueba diferentes términos de búsqueda para ver si encuentra "MENAPLUS ES. FINAL.PDF"</p>

            <div style="margin: 20px 0;">
                <h3>🧪 Términos para probar:</h3>
                <button class="test-btn" onclick="testSearch('mena')">Buscar "mena"</button>
                <button class="test-btn" onclick="testSearch('plus')">Buscar "plus"</button>
                <button class="test-btn" onclick="testSearch('Menaplus')">Buscar "Menaplus"</button>
                <button class="test-btn" onclick="testSearch('MENAPLUS')">Buscar "MENAPLUS"</button>
                <button class="test-btn" onclick="testSearch('final')">Buscar "final"</button>
                <button class="test-btn" onclick="testSearch('FEMENINE BALANCE')">Buscar "FEMENINE BALANCE"</button>
                <button class="test-btn" onclick="testSearch('femmenine Balance')">Buscar "femmenine Balance"</button>
            </div>

            <div id="results"></div>
        </div>
    </div>

    <script>
        async function testSearch(query) {
            const resultsDiv = document.getElementById('results');

            try {
                // Cargar índice
                const response = await fetch('data/pdf-index.json');
                const data = await response.json();

                if (!data.pdfs) {
                    resultsDiv.innerHTML = '<div class="result not-found">❌ Error: No se pudo cargar el índice</div>';
                    return;
                }

                // Buscar coincidencias
                const results = data.pdfs.filter(pdf => {
                    const searchText = (
                        (pdf.title || '') + ' ' +
                        (pdf.filename || '') + ' ' +
                        (pdf.description || '') + ' ' +
                        (pdf.keywords || []).join(' ') + ' ' +
                        (pdf.tags || []).join(' ')
                    ).toLowerCase();

                    const queryLower = query.toLowerCase();

                    // Búsqueda exacta
                    if (searchText.includes(queryLower)) {
                        return true;
                    }

                    // Búsqueda sin espacios ni caracteres
                    const cleanSearch = queryLower.replace(/[^a-z0-9]/g, '');
                    const cleanText = searchText.replace(/[^a-z0-9]/g, '');
                    if (cleanText.includes(cleanSearch)) {
                        return true;
                    }

                    return false;
                });

                if (results.length > 0) {
                    const resultHtml = results.map(pdf =>
                        `<div class="result found">
                            ✅ ENCONTRADO: ${pdf.filename}<br>
                            📄 Título: ${pdf.title}<br>
                            🏷️ Keywords: ${(pdf.keywords || []).join(', ')}
                        </div>`
                    ).join('');

                    resultsDiv.innerHTML = `
                        <div class="result found">
                            🔍 Buscando: "<strong>${query}</strong>"<br>
                            ✅ Se encontraron ${results.length} resultados:
                        </div>
                        ${resultHtml}
                    `;
                } else {
                    resultsDiv.innerHTML = `
                        <div class="result not-found">
                            🔍 Buscando: "<strong>${query}</strong>"<br>
                            ❌ NO se encontraron resultados
                        </div>
                    `;
                }

            } catch (error) {
                resultsDiv.innerHTML = `<div class="result not-found">❌ Error: ${error.message}</div>`;
            }
        }

        // Test automático al cargar
        window.onload = function() {
            testSearch('mena');
        };
    </script>
</body>
</html>