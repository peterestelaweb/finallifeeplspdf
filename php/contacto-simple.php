<?php
/**
 * Versión simplificada y robusta del formulario de contacto
 * Elimina dependencias y usa métodos directos
 */

// Configurar headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Función simple de registro
function registrarContacto($datos) {
    $logFile = __DIR__ . '/../data/contactos-log.txt';
    $logDir = dirname($logFile);

    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }

    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] " . json_encode($datos, JSON_UNESCAPED_UNICODE) . "\n";

    return file_put_contents($logFile, $logEntry, FILE_APPEND) !== false;
}

// Función para enviar email (método simple)
function enviarEmailSimple($datos) {
    $to = 'maykasunshineteam@gmail.com';
    $subject = 'Nuevo contacto - LifePlus PDF';

    $message = "Nuevo mensaje de contacto:\n\n";
    $message .= "Nombre: " . $datos['nombre'] . "\n";
    $message .= "Email: " . $datos['email'] . "\n";
    $message .= "Teléfono: " . $datos['telefono'] . "\n";
    $message .= "Motivo: " . $datos['motivo'] . "\n";
    $message .= "Ayuda: " . $datos['ayuda'] . "\n";

    if (!empty($datos['pinCliente'])) {
        $message .= "PIN Cliente: " . $datos['pinCliente'] . "\n";
    }

    if (!empty($datos['recomendado'])) {
        $message .= "Recomendado por: " . $datos['recomendado'] . "\n";
    }

    $message .= "\nEnviado desde: lifepluspdf.peterestela.com";

    $headers = "From: contacto@lifepluspdf.peterestela.com\r\n";
    $headers .= "Reply-To: " . $datos['email'] . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    return @mail($to, $subject, $message, $headers);
}

// Función para enviar a Google Sheets (método directo)
function enviarAGoogleSheets($datos) {
    $url = 'https://script.google.com/macros/s/AKfycbxknuOqnyzNBlmaE2fv29sXY7mnVPDwD0P3nb4kC-A5XXiDX6E8QbU1go_Ly8Pz44W4Gg/exec';

    // Preparar datos en columnas separadas
    $postData = [
        'token' => 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04',
        'name' => $datos['nombre'],
        'email' => $datos['email'],
        'phone' => $datos['telefono'],
        'motivo' => $datos['motivo'],
        'ayuda' => $datos['ayuda'],
        'pinCliente' => !empty($datos['pinCliente']) ? $datos['pinCliente'] : '',
        'recomendado' => !empty($datos['recomendado']) ? $datos['recomendado'] : '',
        'source' => 'lifepluspdf.peterestela.com'
    ];

    // Usar método que funciona
    $payload = http_build_query($postData);

    // Intentar con cURL primero
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode == 200) {
            return true;
        }
    }

    // Fallback a file_get_contents
    if (ini_get('allow_url_fopen')) {
        $options = [
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => $payload,
                'timeout' => 10,
                'ignore_errors' => true
            ]
        ];

        $context = stream_context_create($options);
        $response = @file_get_contents($url, false, $context);

        if ($response !== false) {
            return true;
        }
    }

    return false;
}

// Procesar la solicitud
try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Obtener y sanitizar datos
        $datos = [
            'nombre' => isset($_POST['nombre']) ? trim($_POST['nombre']) : '',
            'email' => isset($_POST['email']) ? trim($_POST['email']) : '',
            'telefono' => isset($_POST['telefono']) ? trim($_POST['telefono']) : '',
            'motivo' => isset($_POST['motivo']) ? trim($_POST['motivo']) : '',
            'pregunta' => isset($_POST['pregunta']) ? trim($_POST['pregunta']) : '',
            'ayuda' => isset($_POST['ayuda']) ? trim($_POST['ayuda']) : '',
            'pinCliente' => isset($_POST['pinCliente']) ? trim($_POST['pinCliente']) : '',
            'recomendado' => isset($_POST['recomendado']) ? trim($_POST['recomendado']) : '',
            'timestamp' => date('Y-m-d H:i:s'),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ];

        // Validar campos requeridos
        $errores = [];
        if (empty($datos['nombre'])) $errores[] = 'El nombre es requerido';
        if (empty($datos['email'])) $errores[] = 'El email es requerido';
        if (empty($datos['motivo'])) $errores[] = 'El motivo es requerido';
        if (empty($datos['ayuda'])) $errores[] = 'El campo ayuda es requerido';

        if (!empty($errores)) {
            echo json_encode([
                'success' => false,
                'message' => 'Por favor completa todos los campos requeridos',
                'errores' => $errores,
                'datos_recibidos' => $datos
            ]);
            exit;
        }

        // Registrar el contacto (siempre funciona)
        $logSuccess = registrarContacto($datos);

        // Intentar enviar email
        $emailSuccess = enviarEmailSimple($datos);

        // Intentar enviar a Google Sheets
        $sheetsSuccess = enviarAGoogleSheets($datos);

        // Responder según los resultados
        if ($sheetsSuccess && $emailSuccess) {
            echo json_encode([
                'success' => true,
                'message' => '¡Mensaje enviado correctamente! Te contactaremos pronto.',
                'metodo' => 'sheets_y_email',
                'detalles' => [
                    'log' => $logSuccess,
                    'email' => $emailSuccess,
                    'sheets' => $sheetsSuccess
                ]
            ]);
        } elseif ($emailSuccess) {
            echo json_encode([
                'success' => true,
                'message' => '¡Mensaje enviado por email! Te contactaremos pronto.',
                'metodo' => 'email',
                'detalles' => [
                    'log' => $logSuccess,
                    'email' => $emailSuccess,
                    'sheets' => $sheetsSuccess
                ]
            ]);
        } elseif ($logSuccess) {
            echo json_encode([
                'success' => true,
                'message' => '¡Mensaje registrado! Te contactaremos pronto.',
                'metodo' => 'log',
                'detalles' => [
                    'log' => $logSuccess,
                    'email' => $emailSuccess,
                    'sheets' => $sheetsSuccess
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error al procesar el mensaje. Por favor intenta más tarde.',
                'detalles' => [
                    'log' => $logSuccess,
                    'email' => $emailSuccess,
                    'sheets' => $sheetsSuccess
                ]
            ]);
        }

    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido',
            'metodo' => $_SERVER['REQUEST_METHOD']
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>