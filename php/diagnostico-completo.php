<?php
/**
 * Script de diagnóstico completo para el formulario de contacto
 * Analiza JavaScript, PHP, y todos los componentes del sistema
 */

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>🔍 Diagnóstico Completo del Formulario de Contacto</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .test-btn { background: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        .test-btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <h1>🔍 Diagnóstico Completo del Formulario de Contacto</h1>";

// 1. Verificar archivos necesarios
echo "<div class='section info'>";
echo "<h2>📁 Verificación de Archivos</h2>";

$archivos_necesarios = [
    '../js/contact-form.js' => 'JavaScript del formulario',
    '../index.html' => 'Página principal',
    'send-contact-direct-sheets.php' => 'PHP principal',
    '../data/contactos-direct.csv' => 'Archivo CSV de respaldo',
    '../data/last-check.txt' => 'Archivo de timestamp',
    '../data/last-check-time.txt' => 'Archivo de timestamp extendido'
];

foreach ($archivos_necesarios as $archivo => $descripcion) {
    if (file_exists($archivo)) {
        $tamano = filesize($archivo);
        $modificado = date('Y-m-d H:i:s', filemtime($archivo));
        echo "<div class='success'>✅ $descripcion: $archivo ($tamano bytes, modificado: $modificado)</div>";
    } else {
        echo "<div class='error'>❌ $descripcion: $archivo (NO EXISTE)</div>";
    }
}
echo "</div>";

// 2. Verificar permisos
echo "<div class='section info'>";
echo "<h2>🔒 Verificación de Permisos</h2>";

$directorios = [
    '.' => 'Directorio PHP',
    '..' => 'Directorio raíz',
    '../data' => 'Directorio de datos',
    '../js' => 'Directorio JavaScript'
];

foreach ($directorios as $dir => $descripcion) {
    if (is_dir($dir)) {
        if (is_writable($dir)) {
            echo "<div class='success'>✅ $descripcion: $dir (escribible)</div>";
        } else {
            echo "<div class='warning'>⚠️ $descripcion: $dir (solo lectura)</div>";
        }
    } else {
        echo "<div class='error'>❌ $descripcion: $dir (no existe)</div>";
    }
}
echo "</div>";

// 3. Verificar configuración PHP
echo "<div class='section info'>";
echo "<h2>⚙️ Configuración del Servidor PHP</h2>";

echo "<div class='info'><strong>PHP Version:</strong> " . phpversion() . "</div>";
echo "<div class='info'><strong>Server Software:</strong> " . $_SERVER['SERVER_SOFTWARE'] . "</div>";
echo "<div class='info'><strong>Document Root:</strong> " . $_SERVER['DOCUMENT_ROOT'] . "</div>";
echo "<div class='info'><strong>Script Filename:</strong> " . __FILE__ . "</div>";

// Extensiones necesarias
$extensiones = ['curl', 'json', 'openssl'];
foreach ($extensiones as $ext) {
    if (extension_loaded($ext)) {
        echo "<div class='success'>✅ Extensión $ext: habilitada</div>";
    } else {
        echo "<div class='error'>❌ Extensión $ext: no habilitada</div>";
    }
}

// Configuración importante
$php_settings = [
    'allow_url_fopen' => ini_get('allow_url_fopen'),
    'max_execution_time' => ini_get('max_execution_time'),
    'memory_limit' => ini_get('memory_limit'),
    'post_max_size' => ini_get('post_max_size'),
    'upload_max_filesize' => ini_get('upload_max_filesize')
];

foreach ($php_settings as $setting => $value) {
    echo "<div class='info'><strong>$setting:</strong> $value</div>";
}
echo "</div>";

// 4. Probar envío de email
echo "<div class='section info'>";
echo "<h2>📧 Prueba de Envío de Email</h2>";

if (function_exists('mail')) {
    echo "<div class='success'>✅ Función mail() está disponible</div>";

    // Probar envío de email
    $to = 'maykasunshineteam@gmail.com';
    $subject = 'Prueba de diagnóstico - LifePlus PDF';
    $message = 'Este es un email de prueba del sistema de diagnóstico.';
    $headers = 'From: noreply@lifepluspdf.peterestela.com' . "\r\n" .
               'Reply-To: noreply@lifepluspdf.peterestela.com' . "\r\n" .
               'X-Mailer: PHP/' . phpversion();

    $enviado = @mail($to, $subject, $message, $headers);

    if ($enviado) {
        echo "<div class='success'>✅ Email de prueba enviado a $to</div>";
    } else {
        echo "<div class='error'>❌ Email de prueba falló</div>";
        echo "<div class='warning'>Error: " . error_get_last()['message'] . "</div>";
    }
} else {
    echo "<div class='error'>❌ Función mail() no está disponible</div>";
}
echo "</div>";

// 5. Probar webhook directamente
echo "<div class='section info'>";
echo "<h2>🌐 Prueba de Webhook Directo</h2>";

$webhookUrl = 'https://script.google.com/macros/s/AKfycbxknuOqnyzNBlmaE2fv29sXY7mnVPDwD0P3nb4kC-A5XXiDX6E8QbU1go_Ly8Pz44W4Gg/exec';

$testData = [
    'token' => 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04',
    'name' => 'Diagnóstico PHP',
    'email' => 'test@diagnostico.com',
    'phone' => '123456789',
    'message' => 'Prueba desde diagnóstico PHP',
    'source' => 'lifepluspdf.peterestela.com'
];

echo "<div class='info'><strong>URL del Webhook:</strong> $webhookUrl</div>";
echo "<div class='info'><strong>Datos de prueba:</strong></div>";
echo "<pre>" . print_r($testData, true) . "</pre>";

if (function_exists('curl_init')) {
    echo "<div class='success'>✅ cURL está disponible</div>";

    $payload = http_build_query($testData);

    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);

    if ($error) {
        echo "<div class='error'>❌ Error cURL: " . htmlspecialchars($error) . "</div>";
    } else {
        echo "<div class='success'>✅ cURL ejecutado correctamente</div>";
        echo "<div class='info'><strong>Response:</strong> " . htmlspecialchars($response) . "</div>";
        echo "<div class='info'><strong>Info:</strong></div>";
        echo "<pre>" . print_r($info, true) . "</pre>";
    }
} else {
    echo "<div class='error'>❌ cURL no está disponible</div>";

    // Probar con file_get_contents
    if (ini_get('allow_url_fopen')) {
        echo "<div class='info'>Probando con file_get_contents...</div>";
        $payload = json_encode($testData);

        $options = [
            'http' => [
                'header' => "Content-Type: application/json\r\n" .
                           "User-Agent: LifePlus-PDF-Diagnostic/1.0\r\n",
                'method' => 'POST',
                'content' => $payload,
                'ignore_errors' => true,
                'follow_location' => 1,
                'max_redirects' => 5,
                'timeout' => 30
            ]
        ];

        $context = stream_context_create($options);
        $response = @file_get_contents($webhookUrl, false, $context);

        if ($response !== false) {
            echo "<div class='success'>✅ file_get_contents funcionó</div>";
            echo "<div class='info'><strong>Response:</strong> " . htmlspecialchars($response) . "</div>";
        } else {
            echo "<div class='error'>❌ file_get_contents falló: " . error_get_last()['message'] . "</div>";
        }
    }
}
echo "</div>";

// 6. Probar el script principal con datos de prueba
echo "<div class='section info'>";
echo "<h2>🧪 Prueba del Script Principal</h2>";

// Simular datos POST
$_POST = [
    'nombre' => 'Usuario de Prueba',
    'email' => 'test@diagnostico.com',
    'telefono' => '612345678',
    'motivo' => 'informacion',
    'pregunta' => 'Esta es una pregunta de prueba desde el diagnóstico',
    'tieneCliente' => 'on',
    'pinCliente' => '12345',
    'recomendado' => 'Juan Pérez',
    'ayuda' => 'Necesito ayuda con el buscador'
];

echo "<div class='info'><strong>Simulando datos POST:</strong></div>";
echo "<pre>" . print_r($_POST, true) . "</pre>";

echo "<div class='info'>Ejecutando script principal...</div>";

// Incluir y ejecutar el script principal
ob_start();
include 'send-contact-direct-sheets.php';
$resultado = ob_get_clean();

echo "<div class='info'><strong>Resultado del script:</strong></div>";
echo "<pre>" . htmlspecialchars($resultado) . "</pre>";
echo "</div>";

// 7. Verificar archivos generados
echo "<div class='section info'>";
echo "<h2>📄 Verificación de Archivos Generados</h2>";

$archivos_datos = [
    '../data/contactos-direct.csv' => 'CSV de contactos',
    '../data/last-check.txt' => 'Última verificación',
    '../data/last-check-time.txt' => 'Timestamp extendido'
];

foreach ($archivos_datos as $archivo => $descripcion) {
    if (file_exists($archivo)) {
        $tamano = filesize($archivo);
        $modificado = date('Y-m-d H:i:s', filemtime($archivo));
        echo "<div class='success'>✅ $descripcion: $archivo ($tamano bytes, modificado: $modificado)</div>";

        if ($tamano > 0 && $tamano < 50000) {
            echo "<div class='info'><strong>Contenido:</strong></div>";
            echo "<pre>" . htmlspecialchars(file_get_contents($archivo)) . "</pre>";
        }
    } else {
        echo "<div class='error'>❌ $descripcion: $archivo (no existe)</div>";
    }
}
echo "</div>";

// 8. JavaScript Diagnostic
echo "<div class='section info'>";
echo "<h2>📜 Diagnóstico JavaScript</h2>";

$js_file = '../js/contact-form.js';
if (file_exists($js_file)) {
    $js_content = file_get_contents($js_file);
    echo "<div class='success'>✅ Archivo JavaScript encontrado</div>";

    // Verificar funciones clave
    $funciones_clave = ['addEventListener', 'preventDefault', 'fetch', 'FormData'];
    foreach ($funciones_clave as $funcion) {
        if (strpos($js_content, $funcion) !== false) {
            echo "<div class='success'>✅ Función $funcion encontrada en el código</div>";
        } else {
            echo "<div class='warning'>⚠️ Función $funcion no encontrada</div>";
        }
    }

    echo "<div class='info'><strong>Tamaño del archivo:</strong> " . filesize($js_file) . " bytes</div>";
    echo "<div class='info'><strong>Primeras líneas del código:</strong></div>";
    $lineas = explode("\n", $js_content);
    for ($i = 0; $i < min(10, count($lineas)); $i++) {
        echo "<div class='info'>" . htmlspecialchars($lineas[$i]) . "</div>";
    }
} else {
    echo "<div class='error'>❌ Archivo JavaScript no encontrado</div>";
}
echo "</div>";

// 9. Conclusiones y recomendaciones
echo "<div class='section warning'>";
echo "<h2>📋 Conclusiones y Recomendaciones</h2>";
echo "<div class='warning'>
    <h3>Posibles Problemas Identificados:</h3>
    <ul>
        <li><strong>JavaScript:</strong> El formulario podría no estar interceptando el envío correctamente</li>
        <li><strong>PHP:</strong> El script podría tener errores en la ejecución</li>
        <li><strong>Email:</strong> El servidor podría tener restricciones de envío</li>
        <li><strong>Webhook:</strong> Google Apps Script podría estar rechazando las peticiones</li>
        <li><strong>Permisos:</strong> Los archivos podrían no tener los permisos correctos</li>
        <li><strong>CORS:</strong> Problemas de política de mismo origen</li>
    </ul>

    <h3>Soluciones Recomendadas:</h3>
    <ol>
        <li>Verificar la consola del navegador para errores JavaScript</li>
        <li>Revisar los logs del servidor para errores PHP</li>
        <li>Probar con diferentes métodos de envío</li>
        <li>Verificar la configuración del Google Apps Script</li>
        <li>Asegurar que todos los archivos tengan permisos de escritura</li>
    </ol>
</div>";
echo "</div>";

// 10. Botones de prueba
echo "<div class='section info'>";
echo "<h2>🧪 Herramientas de Prueba Adicionales</h2>";
echo "<button class='test-btn' onclick='testFormSubmit()'>Probar Envío de Formulario</button>";
echo "<button class='test-btn' onclick='testJavaScript()'>Probar JavaScript</button>";
echo "<button class='test-btn' onclick='testWebhook()'>Probar Webhook</button>";
echo "<button class='test-btn' onclick='clearLogs()'>Limpiar Logs</button>";
echo "</div>";

// JavaScript para pruebas adicionales
echo "<script>
function testFormSubmit() {
    console.log('🧪 Probando envío de formulario...');

    // Buscar el formulario
    const form = document.getElementById('contactForm');
    if (form) {
        console.log('✅ Formulario encontrado');

        // Simular envío
        const formData = new FormData(form);
        console.log('📋 Datos del formulario:', Object.fromEntries(formData));

        // Probar fetch
        fetch('php/send-contact-direct-sheets.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('✅ Respuesta del servidor:', data);
            alert('✅ Envío de formulario probado. Revisa la consola para detalles.');
        })
        .catch(error => {
            console.error('❌ Error en el envío:', error);
            alert('❌ Error en el envío. Revisa la consola para detalles.');
        });
    } else {
        console.error('❌ Formulario no encontrado');
        alert('❌ Formulario no encontrado en la página');
    }
}

function testJavaScript() {
    console.log('🧪 Probando JavaScript...');

    // Verificar funciones disponibles
    const funciones = ['fetch', 'FormData', 'addEventListener', 'preventDefault'];
    let todoOk = true;

    funciones.forEach(func => {
        if (typeof window[func] === 'function' || typeof window[func] === 'object') {
            console.log('✅ ' + func + ' disponible');
        } else {
            console.error('❌ ' + func + ' no disponible');
            todoOk = false;
        }
    });

    if (todoOk) {
        alert('✅ Todas las funciones JavaScript necesarias están disponibles');
    } else {
        alert('❌ Algunas funciones JavaScript no están disponibles. Revisa la consola.');
    }
}

function testWebhook() {
    console.log('🧪 Probando webhook directamente...');

    const testData = {
        token: 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04',
        name: 'Test JavaScript',
        email: 'test@js.com',
        phone: '123456',
        message: 'Prueba desde JavaScript',
        source: 'lifepluspdf.peterestela.com'
    };

    const payload = new URLSearchParams(testData).toString();

    fetch('https://script.google.com/macros/s/AKfycbxknuOqnyzNBlmaE2fv29sXY7mnVPDwD0P3nb4kC-A5XXiDX6E8QbU1go_Ly8Pz44W4Gg/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
        mode: 'no-cors'
    })
    .then(() => {
        console.log('✅ Webhook test enviado');
        alert('✅ Webhook probado. Revisa la consola y Google Sheets.');
    })
    .catch(error => {
        console.error('❌ Error en webhook:', error);
        alert('❌ Error en webhook. Revisa la consola.');
    });
}

function clearLogs() {
    console.clear();
    alert('🧹 Consola limpiada');
}

// Auto-ejecutar pruebas al cargar la página
window.addEventListener('load', function() {
    console.log('🚀 Iniciando diagnóstico automático...');
    setTimeout(() => {
        testJavaScript();
    }, 1000);
});
</script>";

echo "</body>
</html>";