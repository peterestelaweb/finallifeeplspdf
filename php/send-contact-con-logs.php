<?php
/**
 * Versión con LOGGING completo para capturar exactamente qué pasa con el formulario
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuración
$destinatario = 'maykasunshineteam@gmail.com';

// Headers para respuesta JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Función para sanitizar datos
function sanitizar($dato) {
    return htmlspecialchars(trim($dato));
}

try {
    // LOG INICIAL
    $log = [
        'timestamp' => date('Y-m-d H:i:s'),
        'metodo' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
        'content_length' => $_SERVER['CONTENT_LENGTH'] ?? 'not set'
    ];

    // Leer datos del formulario
    $input = file_get_contents('php://input');
    $log['input_length'] = strlen($input);
    $log['input_preview'] = substr($input, 0, 200);

    $data = [];

    // Intentar decodificar JSON
    if (!empty($input)) {
        $json_data = json_decode($input, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
            $data = $json_data;
            $log['json_decode'] = 'success';
        } else {
            $log['json_decode'] = 'failed: ' . json_last_error_msg();
        }
    }

    // Combinar con POST
    $data = array_merge($data, $_POST);
    $log['datos_combinados'] = $data;

    // Recibir y sanitizar datos
    $nombre = sanitizar($data['nombre'] ?? '');
    $email = sanitizar($data['email'] ?? '');
    $telefono = sanitizar($data['telefono'] ?? '');
    $motivo = sanitizar($data['motivo'] ?? '');
    $ayuda = sanitizar($data['ayuda'] ?? '');
    $tieneCliente = isset($data['tieneCliente']) ? 'Sí' : 'No';
    $pinCliente = sanitizar($data['pinCliente'] ?? '');
    $recomendado = sanitizar($data['recomendado'] ?? '');

    // LOG de datos procesados
    $log['datos_procesados'] = [
        'nombre' => ['valor' => $nombre, 'vacio' => empty($nombre), 'longitud' => strlen($nombre)],
        'email' => ['valor' => $email, 'vacio' => empty($email), 'longitud' => strlen($email)],
        'motivo' => ['valor' => $motivo, 'vacio' => empty($motivo), 'longitud' => strlen($motivo)],
        'ayuda' => ['valor' => $ayuda, 'vacio' => empty($ayuda), 'longitud' => strlen($ayuda)],
        'telefono' => ['valor' => $telefono, 'vacio' => empty($telefono), 'longitud' => strlen($telefono)],
        'recomendado' => ['valor' => $recomendado, 'vacio' => empty($recomendado), 'longitud' => strlen($recomendado)]
    ];

    // Validación simple
    if (empty($nombre) || empty($email) || empty($motivo) || empty($ayuda)) {
        $log['resultado'] = 'VALIDACION_FALLA';
        echo json_encode([
            'success' => false,
            'message' => 'Por favor, completa los campos obligatorios (nombre, email, motivo, cómo podemos ayudar)',
            'log' => $log
        ]);
        exit;
    }

    // Mapear motivo
    $motivos = [
        'informacion' => 'Información sobre productos',
        'compra' => 'Quiero comprar productos',
        'oportunidad' => 'Oportunidad de negocio',
        'soporte' => 'Soporte técnico',
        'otro' => 'Otro'
    ];
    $motivoTexto = $motivos[$motivo] ?? $motivo;

    // Crear email
    $asunto = '📧 CONTACTO LIFEPLUS - ' . $nombre;

    $mensaje = "
    <html>
    <body style='font-family: Arial, sans-serif;'>
        <div style='max-width: 600px; margin: 0 auto; border: 2px solid #1e3c72; border-radius: 10px;'>
            <div style='background: #1e3c72; color: white; padding: 20px; text-align: center;'>
                <h1>📋 Información del Contacto</h1>
                <p>SUNSHINE TEAM - LifePlus PDF</p>
            </div>

            <div style='padding: 30px; background: #f8f9fa;'>
                <p><strong>Fecha:</strong> " . date('d/m/Y, H:i:s') . "</p>
                <p><strong>Nombre:</strong> $nombre</p>
                <p><strong>Email:</strong> $email</p>";

    if (!empty($telefono)) {
        $mensaje .= "<p><strong>Teléfono:</strong> $telefono</p>";
    }

    $mensaje .= "
                <p><strong>Motivo:</strong> $motivoTexto</p>
                <p><strong>Tiene cliente:</strong> $tieneCliente</p>";

    if ($tieneCliente === 'Sí' && !empty($pinCliente)) {
        $mensaje .= "<p><strong>PIN Cliente:</strong> $pinCliente</p>";
    }

    if (!empty($recomendado)) {
        $mensaje .= "<p><strong>Recomendado por:</strong> $recomendado</p>";
    }

    $mensaje .= "
                <hr>
                <h3>❓ ¿Cómo podemos ayudar?</h3>
                <p style='background: white; padding: 15px; border-radius: 5px;'>" . nl2br($ayuda) . "</p>
            </div>

            <div style='background: #1e3c72; color: white; padding: 15px; text-align: center;'>
                <p>Enviado desde: lifepluspdf.peterestela.com</p>
            </div>
        </div>
    </body>
    </html>";

    // Headers
    $headers = "From: contacto@lifepluspdf.peterestela.com\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    $log['email_info'] = [
        'destinatario' => $destinatario,
        'asunto' => $asunto,
        'mensaje_length' => strlen($mensaje),
        'headers_count' => count(explode("\r\n", $headers))
    ];

    // Enviar email
    $enviado = mail($destinatario, $asunto, $mensaje, $headers);

    if ($enviado) {
        $log['resultado'] = 'EMAIL_ENVIADO';
        echo json_encode([
            'success' => true,
            'message' => '✅ Mensaje enviado correctamente. Te contactaremos pronto.',
            'log' => $log
        ]);
    } else {
        $log['resultado'] = 'EMAIL_FALLA';
        $log['error_php'] = error_get_last();
        echo json_encode([
            'success' => false,
            'message' => '❌ Error al enviar email. Por favor, inténtalo más tarde.',
            'log' => $log
        ]);
    }

} catch (Exception $e) {
    $log['resultado'] = 'EXCEPTION';
    $log['exception'] = $e->getMessage();
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'log' => $log
    ]);
}
?>