<?php
/**
 * Versión AJAX para formulario con fetch - Acepta cualquier método y lee JSON
 */

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
    // Leer datos (tanto POST como JSON body)
    $input = file_get_contents('php://input');
    $data = [];

    // Intentar decodificar JSON (para AJAX con fetch)
    if (!empty($input)) {
        $json_data = json_decode($input, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
            $data = $json_data;
        }
    }

    // Combinar con datos POST (por si acaso)
    $data = array_merge($data, $_POST);

    // Recibir datos
    $nombre = sanitizar($data['nombre'] ?? '');
    $email = sanitizar($data['email'] ?? '');
    $telefono = sanitizar($data['telefono'] ?? '');
    $motivo = sanitizar($data['motivo'] ?? '');
    $ayuda = sanitizar($data['ayuda'] ?? '');
    $tieneCliente = isset($data['tieneCliente']) ? 'Sí' : 'No';
    $pinCliente = sanitizar($data['pinCliente'] ?? '');
    $recomendado = sanitizar($data['recomendado'] ?? '');

    // Debug de datos recibidos
    $debug = [
        'method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
        'input_length' => strlen($input),
        'data_recibida' => $data,
        'campos_vacios' => [
            'nombre' => empty($nombre),
            'email' => empty($email),
            'motivo' => empty($motivo),
            'ayuda' => empty($ayuda)
        ]
    ];

    // Validación simple
    if (empty($nombre) || empty($email) || empty($motivo) || empty($ayuda)) {
        echo json_encode([
            'success' => false,
            'message' => 'Por favor, completa los campos obligatorios (nombre, email, motivo, cómo podemos ayudar)',
            'debug' => $debug
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

    // Enviar email
    $enviado = mail($destinatario, $asunto, $mensaje, $headers);

    if ($enviado) {
        echo json_encode([
            'success' => true,
            'message' => '✅ Mensaje enviado correctamente. Te contactaremos pronto.',
            'debug' => $debug
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => '❌ Error al enviar email. Por favor, inténtalo más tarde.',
            'debug' => array_merge($debug, ['error' => error_get_last()])
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>