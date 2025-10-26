<?php
/**
 * Script para diagnosticar diferencias entre curl funcional y formulario web
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Diagnóstico Avanzado: Curl vs Formulario Web</h1>";

// Configuración
$webhookUrl = 'https://script.google.com/macros/s/AKfycbxknuOqnyzNBlmaE2fv29sXY7mnVPDwD0P3nb4kC-A5XXiDX6E8QbU1go_Ly8Pz44W4Gg/exec';

// Datos de prueba (mismo formato que curl funcional)
$curlTestData = [
    'token' => 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04',
    'name' => 'Prueba CURL',
    'email' => 'prueba@demo.com',
    'phone' => '123456',
    'message' => 'Hola desde curl',
    'source' => 'lifepluspdf.peterestela.com'
];

// Datos del formulario web (formato real del formulario)
$formTestData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'nombre' => 'Pedro Estela',
    'email' => 'peterestela@gmail.com',
    'telefono' => '+34 637 506 066',
    'motivo' => 'informacion',
    'pregunta' => 'Prueba desde formulario web',
    'tieneCliente' => 'Sí',
    'pinCliente' => '',
    'recomendado' => '',
    'ayuda' => 'Prueba de ayuda',
    'ip' => '127.0.0.1',
    'user_agent' => 'Mozilla/5.0 (Diagnostico)'
];

echo "<h2>📋 Prueba 1: CURL (formato que funciona)</h2>";
echo "<pre>";
print_r($curlTestData);
echo "</pre>";

$payload1 = http_build_query($curlTestData);
echo "<p><strong>Payload URL-encoded:</strong> " . htmlspecialchars($payload1) . "</p>";

// Test curl con formato funcional
$ch1 = curl_init($webhookUrl);
curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch1, CURLOPT_POST, true);
curl_setopt($ch1, CURLOPT_POSTFIELDS, $payload1);
curl_setopt($ch1, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
curl_setopt($ch1, CURLOPT_TIMEOUT, 30);
curl_setopt($ch1, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch1, CURLOPT_SSL_VERIFYHOST, false);

$response1 = curl_exec($ch1);
$error1 = curl_error($ch1);
$info1 = curl_getinfo($ch1);
curl_close($ch1);

if ($error1) {
    echo "<p><strong>❌ CURL Error:</strong> " . htmlspecialchars($error1) . "</p>";
} else {
    echo "<p><strong>✅ CURL Success:</strong></p>";
    echo "<pre>" . htmlspecialchars($response1) . "</pre>";
    echo "<p><strong>Info:</strong></p>";
    echo "<pre>";
    print_r($info1);
    echo "</pre>";
}

echo "<hr><h2>📋 Prueba 2: Formulario Web (formato JSON)</h2>";
echo "<pre>";
print_r($formTestData);
echo "</pre>";

$payload2 = json_encode($formTestData);
echo "<p><strong>Payload JSON:</strong> " . htmlspecialchars($payload2) . "</p>";

// Test formulario con formato JSON
$ch2 = curl_init($webhookUrl);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, $payload2);
curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch2, CURLOPT_TIMEOUT, 30);
curl_setopt($ch2, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch2, CURLOPT_SSL_VERIFYHOST, false);

$response2 = curl_exec($ch2);
$error2 = curl_error($ch2);
$info2 = curl_getinfo($ch2);
curl_close($ch2);

if ($error2) {
    echo "<p><strong>❌ JSON Error:</strong> " . htmlspecialchars($error2) . "</p>";
} else {
    echo "<p><strong>✅ JSON Success:</strong></p>";
    echo "<pre>" . htmlspecialchars($response2) . "</pre>";
    echo "<p><strong>Info:</strong></p>";
    echo "<pre>";
    print_r($info2);
    echo "</pre>";
}

echo "<hr><h2>📋 Prueba 3: Formulario Web (formato URL-encoded)</h2>";

$payload3 = http_build_query($formTestData);
echo "<p><strong>Payload URL-encoded:</strong> " . htmlspecialchars($payload3) . "</p>";

// Test formulario con formato URL-encoded
$ch3 = curl_init($webhookUrl);
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_POST, true);
curl_setopt($ch3, CURLOPT_POSTFIELDS, $payload3);
curl_setopt($ch3, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
curl_setopt($ch3, CURLOPT_TIMEOUT, 30);
curl_setopt($ch3, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch3, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch3, CURLOPT_SSL_VERIFYHOST, false);

$response3 = curl_exec($ch3);
$error3 = curl_error($ch3);
$info3 = curl_getinfo($ch3);
curl_close($ch3);

if ($error3) {
    echo "<p><strong>❌ Form URL-encoded Error:</strong> " . htmlspecialchars($error3) . "</p>";
} else {
    echo "<p><strong>✅ Form URL-encoded Success:</strong></p>";
    echo "<pre>" . htmlspecialchars($response3) . "</pre>";
    echo "<p><strong>Info:</strong></p>";
    echo "<pre>";
    print_r($info3);
    echo "</pre>";
}

echo "<hr><h2>📋 Prueba 4: Google Apps Script actual (recepción JSON)</h2>";

// Mostrar cómo el Google Apps Script está configurado para recibir datos
echo "<p><strong>Google Apps Script espera:</strong></p>";
echo "<pre>";
echo "function doPost(e) {
  const postData = JSON.parse(e.postData.contents);
  // ... procesar datos JSON
}";
echo "</pre>";

echo "<p><a href='/'>Volver al inicio</a></p>";
echo "<p><a href='debug-webhook.php'>Ver diagnóstico básico</a></p>";
?>