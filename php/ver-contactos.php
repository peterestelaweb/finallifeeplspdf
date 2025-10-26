<?php
/**
 * Script para ver los contactos guardados en el log
 */

header('Content-Type: text/html; charset=utf-8');

$logFile = __DIR__ . '/../data/contactos.log';

echo "<h1>📋 Contactos Recibidos</h1>";

if (file_exists($logFile)) {
    $contactos = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    if (empty($contactos)) {
        echo "<p>No hay contactos guardados aún.</p>";
    } else {
        echo "<p>Se encontraron " . count($contactos) . " contactos:</p>";
        echo "<div style='background: #f8f9fa; padding: 20px; border-radius: 5px;'>";

        foreach (array_reverse($contactos) as $index => $linea) {
            $datos = json_decode($linea, true);
            if ($datos) {
                echo "<div style='border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; background: white;'>";
                echo "<h3>Contacto #" . (count($contactos) - $index) . " - " . $datos['nombre'] . "</h3>";
                echo "<p><strong>Email:</strong> " . htmlspecialchars($datos['email']) . "</p>";
                if (!empty($datos['telefono'])) {
                    echo "<p><strong>Teléfono:</strong> " . htmlspecialchars($datos['telefono']) . "</p>";
                }
                echo "<p><strong>Motivo:</strong> " . htmlspecialchars($datos['motivo']) . "</p>";
                echo "<p><strong>Tiene cliente:</strong> " . htmlspecialchars($datos['tieneCliente']) . "</p>";
                if ($datos['tieneCliente'] === 'Sí' && !empty($datos['pinCliente'])) {
                    echo "<p><strong>PIN:</strong> " . htmlspecialchars($datos['pinCliente']) . "</p>";
                }
                echo "<div style='background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 3px;'>";
                echo "<strong>Pregunta:</strong><br>" . nl2br(htmlspecialchars($datos['pregunta']));
                echo "</div>";
                echo "<div style='background: #e8f4fd; padding: 10px; margin: 10px 0; border-radius: 3px;'>";
                echo "<strong>¿Cómo podemos ayudar?:</strong><br>" . nl2br(htmlspecialchars($datos['ayuda']));
                echo "</div>";
                echo "<p style='font-size: 0.8em; color: #666;'>Fecha: " . date('d/m/Y H:i:s', strtotime($datos['timestamp'] ?? 'now')) . " - IP: " . $datos['ip'] . "</p>";
                echo "</div>";
            }
        }

        echo "</div>";
    }
} else {
    echo "<p>No existe el archivo de contactos aún.</p>";
}

echo "<p><a href='/'>Volver al inicio</a></p>";
?>