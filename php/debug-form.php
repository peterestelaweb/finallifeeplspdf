<?php
/**
 * Script para depurar el envío del formulario
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Depuración del Formulario</h1>";

// Mostrar información de la solicitud
echo "<h2>Información de la solicitud:</h2>";
echo "<p><strong>Método:</strong> " . $_SERVER['REQUEST_METHOD'] . "</p>";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<h2>Datos recibidos (POST):</h2>";
    echo "<pre>";
    foreach ($_POST as $key => $value) {
        echo "$key: " . htmlspecialchars($value) . "\n";
    }
    echo "</pre>";

    echo "<h2>Archivos recibidos (FILES):</h2>";
    echo "<pre>";
    foreach ($_FILES as $key => $file) {
        echo "$key: " . print_r($file, true) . "\n";
    }
    echo "</pre>";

    echo "<h2>Headers:</h2>";
    echo "<pre>";
    foreach (getallheaders() as $name => $value) {
        echo "$name: $value\n";
    }
    echo "</pre>";
} else {
    echo "<p>Este script espera una solicitud POST. Usa este formulario de prueba:</p>";
    echo "<form method='post' action='debug-form.php'>";
    echo "<input type='text' name='nombre' placeholder='Nombre' required><br><br>";
    echo "<input type='email' name='email' placeholder='Email' required><br><br>";
    echo "<input type='text' name='telefono' placeholder='Teléfono'><br><br>";
    echo "<select name='motivo' required>";
    echo "<option value=''>Selecciona motivo</option>";
    echo "<option value='informacion'>Información</option>";
    echo "<option value='compra'>Compra</option>";
    echo "</select><br><br>";
    echo "<textarea name='pregunta' placeholder='Pregunta' required></textarea><br><br>";
    echo "<textarea name='ayuda' placeholder='¿Cómo te podemos ayudar?' required></textarea><br><br>";
    echo "<input type='checkbox' name='tieneCliente' id='tieneCliente'>";
    echo "<label for='tieneCliente'>Tengo cliente</label><br><br>";
    echo "<input type='text' name='pinCliente' placeholder='PIN cliente'><br><br>";
    echo "<input type='text' name='recomendado' placeholder='Quién te recomendó'><br><br>";
    echo "<button type='submit'>Enviar</button>";
    echo "</form>";
}

echo "<p><a href='/'>Volver al inicio</a></p>";
?>