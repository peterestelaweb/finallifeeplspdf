<?php
/**
 * Script para simular exactamente lo que envía el formulario web
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>📝 Test de Envío de Formulario Web</h1>";

// Simular los datos exactos que viene del formulario
$_POST = [
    'nombre' => 'Test Usuario',
    'email' => 'test@ejemplo.com',
    'telefono' => '612345678',
    'motivo' => 'informacion',
    'pregunta' => 'Esta es una pregunta de prueba',
    'tieneCliente' => 'on',
    'pinCliente' => '12345',
    'recomendado' => 'Juan Pérez',
    'ayuda' => 'Necesito ayuda con el buscador'
];

echo "<h2>📋 Datos POST simulados:</h2>";
echo "<pre>";
print_r($_POST);
echo "</pre>";

// Incluir el script original
include 'send-contact-direct-sheets.php';

echo "<p><a href='/'>Volver al inicio</a></p>";
echo "<p><a href='debug-advanced.php'>Ver diagnóstico avanzado</a></p>";
?>