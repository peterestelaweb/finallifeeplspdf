<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forzar Actualización - LifePlus PDF</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 20px; }
        .btn { display: block; width: 100%; background: #007cba; color: white; border: none; padding: 15px; border-radius: 6px; font-size: 16px; cursor: pointer; margin: 10px 0; }
        .btn:hover { background: #005a87; }
        .btn.success { background: #28a745; }
        .btn.success:hover { background: #218838; }
        .info { background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #007cba; }
        .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 Herramienta de Actualización Forzada</h1>

        <div class="info">
            <strong>ℹ️ Instrucciones:</strong><br>
            1. Haz clic en los botones en orden<br>
            2. Espera a que cada uno complete<br>
            3. Luego vuelve a tu sitio principal
        </div>

        <?php
        // Cargar estadísticas actuales
        $index_file = __DIR__ . '/data/pdf-index.json';
        $stats = ['total_pdfs' => 0, 'generated_at' => 'N/A'];

        if (file_exists($index_file)) {
            $data = json_decode(file_get_contents($index_file), true);
            if ($data) {
                $stats = $data;
            }
        }
        ?>

        <div class="stats">
            <div class="stat">
                <div class="stat-number"><?php echo $stats['total_pdfs']; ?></div>
                <div class="stat-label">PDFs en Índice</div>
            </div>
            <div class="stat">
                <div class="stat-number"><?php echo date('H:i', strtotime($stats['generated_at'])); ?></div>
                <div class="stat-label">Última Actualización</div>
            </div>
        </div>

        <button class="btn" onclick="clearCache()">
            🗑️ 1. Limpiar Caché del Navegador
        </button>

        <button class="btn" onclick="forceReload()">
            🔄 2. Forzar Recarga Completa
        </button>

        <button class="btn success" onclick="goToMainSite()">
            🏠 3. Ir al Sitio Principal
        </button>

        <div class="info" style="margin-top: 30px;">
            <strong>📋 Estado Actual:</strong><br>
            • PDFs indexados: <strong><?php echo $stats['total_pdfs']; ?></strong><br>
            • Última actualización: <strong><?php echo date('d/m/Y H:i:s', strtotime($stats['generated_at'])); ?></strong><br>
            • Archivo JSON: <strong><?php echo file_exists($index_file) ? '✅ Existe' : '❌ No encontrado'; ?></strong>
        </div>
    </div>

    <script>
        function clearCache() {
            // Limpiar localStorage
            localStorage.clear();

            // Limpiar sessionStorage
            sessionStorage.clear();

            alert('✅ Caché local limpiada');
        }

        function forceReload() {
            // Forzar recarga sin caché
            window.location.reload(true);
        }

        function goToMainSite() {
            // Ir al sitio principal con timestamp para evitar caché
            var timestamp = new Date().getTime();
            window.open('../?t=' + timestamp, '_blank');
        }

        // Auto-verificar cada 5 segundos
        setInterval(function() {
            fetch('data/pdf-index.json?t=' + new Date().getTime())
                .then(response => response.json())
                .then(data => {
                    document.querySelector('.stat-number').textContent = data.total_pdfs;
                    document.querySelector('.stat:nth-child(2) .stat-number').textContent =
                        new Date(data.generated_at).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
                })
                .catch(() => {});
        }, 5000);
    </script>
</body>
</html>