<?php
/**
 * Script para enviar datos del formulario de contacto a Google Sheets
 * Opción 1: Google Forms (más simple)
 */

header('Content-Type: application/json');

// Configuración del Google Form
// DEBES CREAR UN GOOGLE FORM Y OBTENER ESTOS DATOS:
$formConfig = [
    'form_id' => 'TU_FORM_ID_AQUI', // Ej: '1FAIpQLSfX9n2J3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O'
    'entry_fields' => [
        'nombre' => 'entry.1234567890',    // Reemplazar con los entry IDs reales
        'email' => 'entry.0987654321',     // de tu Google Form
        'telefono' => 'entry.1122334455',
        'motivo' => 'entry.2233445566',
        'pregunta' => 'entry.3344556677',
        'tieneCliente' => 'entry.4455667788',
        'pinCliente' => 'entry.5566778899',
        'recomendado' => 'entry.6677889900',
        'ayuda' => 'entry.7788990011'
    ]
];

// Función para sanitizar datos
function sanitizar($dato) {
    $dato = trim($dato);
    $dato = stripslashes($dato);
    $dato = htmlspecialchars($dato);
    return $dato;
}

// Función para enviar a Google Forms
function enviarAGoogleForms($datos, $config) {
    $formUrl = "https://docs.google.com/forms/d/e/{$config['form_id']}/formResponse";

    $postData = [];
    foreach ($config['entry_fields'] as $campo => $entryId) {
        if (isset($datos[$campo])) {
            $postData[$entryId] = $datos[$campo];
        }
    }

    $options = [
        'http' => [
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($postData),
            'ignore_errors' => true
        ]
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($formUrl, false, $context);

    return $response !== false;
}

try {
    // Verificar método de solicitud
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Recibir y sanitizar datos
    $datos = [
        'nombre' => sanitizar($_POST['nombre'] ?? ''),
        'email' => sanitizar($_POST['email'] ?? ''),
        'telefono' => sanitizar($_POST['telefono'] ?? ''),
        'motivo' => sanitizar($_POST['motivo'] ?? ''),
        'pregunta' => sanitizar($_POST['pregunta'] ?? ''),
        'tieneCliente' => isset($_POST['tieneCliente']) ? 'Sí' : 'No',
        'pinCliente' => sanitizar($_POST['pinCliente'] ?? ''),
        'recomendado' => sanitizar($_POST['recomendado'] ?? ''),
        'ayuda' => sanitizar($_POST['ayuda'] ?? ''),
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR']
    ];

    // Validar campos obligatorios
    $errores = [];
    if (empty($datos['nombre'])) $errores[] = 'El nombre es obligatorio';
    if (empty($datos['email'])) $errores[] = 'El email es obligatorio';
    if (empty($datos['motivo'])) $errores[] = 'El motivo es obligatorio';
    if (empty($datos['pregunta'])) $errores[] = 'La pregunta es obligatoria';
    if (empty($datos['ayuda'])) $errores[] = 'El campo ayuda es obligatorio';

    if (!empty($errores)) {
        echo json_encode([
            'success' => false,
            'message' => 'Por favor, completa todos los campos obligatorios',
            'errores' => $errores
        ]);
        exit;
    }

    // Enviar a Google Forms
    $googleFormsSuccess = false;
    if ($formConfig['form_id'] !== 'TU_FORM_ID_AQUI') {
        $googleFormsSuccess = enviarAGoogleForms($datos, $formConfig);
    }

    // Guardar en archivo local como respaldo
    $logFile = __DIR__ . '/../data/contactos-google.log';
    if (!file_exists(__DIR__ . '/../data')) {
        mkdir(__DIR__ . '/../data', 0755, true);
    }

    $logEntry = date('Y-m-d H:i:s') . " - " . json_encode($datos, JSON_UNESCAPED_UNICODE) . "\n";
    $localSuccess = file_put_contents($logFile, $logEntry, FILE_APPEND) !== false;

    // Respuesta
    if ($googleFormsSuccess) {
        echo json_encode([
            'success' => true,
            'message' => '¡Mensaje enviado con éxito a Google Sheets! Te contactaremos pronto.',
            'metodo' => 'google_forms',
            'debug' => [
                'google_forms' => $googleFormsSuccess,
                'local_backup' => $localSuccess
            ]
        ]);
    } elseif ($localSuccess) {
        echo json_encode([
            'success' => true,
            'message' => 'Mensaje guardado localmente. Configura Google Forms para integración completa.',
            'metodo' => 'local_backup',
            'debug' => [
                'google_forms' => $googleFormsSuccess,
                'local_backup' => $localSuccess,
                'nota' => 'Debes configurar el form_id en el script'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar el mensaje. Por favor, intenta más tarde.',
            'debug' => [
                'google_forms' => $googleFormsSuccess,
                'local_backup' => $localSuccess
            ]
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>