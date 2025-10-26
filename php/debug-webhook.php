<?php
/**
 * Script para diagnosticar problemas con el webhook de Google Sheets
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Diagnóstico de Webhook Google Sheets</h1>";

// Configuración
$webhookUrl = 'https://script.google.com/macros/s/AKfycbxknuOqnyzNBlmaE2fv29sXY7mnVPDwD0P3nb4kC-A5XXiDX6E8QbU1go_Ly8Pz44W4Gg/exec';

// Datos de prueba
$testData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'nombre' => 'Test Diagnóstico',
    'email' => 'test@diagnostico.com',
    'telefono' => '123456789',
    'motivo' => 'Información',
    'pregunta' => 'Pregunta de diagnóstico',
    'tieneCliente' => 'No',
    'pinCliente' => '',
    'recomendado' => '',
    'ayuda' => 'Ayuda de diagnóstico',
    'ip' => '127.0.0.1',
    'user_agent' => 'Diagnostic Script'
];

echo "<h2>📋 Datos de Prueba:</h2>";
echo "<pre>";
print_r($testData);
echo "</pre>";

echo "<h2>🌐 Enviando a Webhook...</h2>";

$payload = json_encode($testData);

$options = [
    'http' => [
        'header' => "Content-Type: application/json\r\n",
        'method' => 'POST',
        'content' => $payload,
        'ignore_errors' => true,
        'timeout' => 30
    ]
];

$context = stream_context_create($options);
$start_time = microtime(true);

try {
    $response = file_get_contents($webhookUrl, false, $context);
    $end_time = microtime(true);
    $duration = round(($end_time - $start_time) * 1000, 2);

    echo "<h3>✅ Envío Exitoso</h3>";
    echo "<p><strong>Tiempo de respuesta:</strong> {$duration}ms</p>";
    echo "<p><strong>Response Headers:</strong></p>";
    echo "<pre>";
    print_r($http_response_header);
    echo "</pre>";

    echo "<p><strong>Response Body:</strong></p>";
    echo "<pre>";
    echo htmlspecialchars($response);
    echo "</pre>";

    // Intentar decodificar JSON
    $responseData = json_decode($response, true);
    if ($responseData) {
        echo "<h3>📊 Response Data:</h3>";
        echo "<pre>";
        print_r($responseData);
        echo "</pre>";
    }

} catch (Exception $e) {
    echo "<h3>❌ Error en el Envío</h3>";
    echo "<p><strong>Error:</strong> " . $e->getMessage() . "</p>";
    echo "<p><strong>PHP Error:</strong> " . error_get_last()['message'] . "</p>";
}

echo "<h2>🔧 Información del Servidor:</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>Allow URL Open:</strong> " . (ini_get('allow_url_fopen') ? 'Yes' : 'No') . "</p>";
echo "<p><strong>OpenSSL:</strong> " . (extension_loaded('openssl') ? 'Enabled' : 'Disabled') . "</p>";

echo "<h2>📝 Prueba con cURL (alternativa):</h2>";

// Prueba con cURL
if (function_exists('curl_init')) {
    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

    $curl_response = curl_exec($ch);
    $curl_error = curl_error($ch);
    $curl_info = curl_getinfo($ch);
    curl_close($ch);

    if ($curl_error) {
        echo "<p><strong>cURL Error:</strong> " . $curl_error . "</p>";
    } else {
        echo "<p><strong>cURL Success:</strong></p>";
        echo "<pre>";
        echo htmlspecialchars($curl_response);
        echo "</pre>";
        echo "<p><strong>cURL Info:</strong></p>";
        echo "<pre>";
        print_r($curl_info);
        echo "</pre>";
    }
} else {
    echo "<p><strong>cURL:</strong> No disponible</p>";
}

echo "<p><a href='/'>Volver al inicio</a></p>";
?>