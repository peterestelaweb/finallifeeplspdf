<?php
/**
 * Versión FINAL LIMPIA del formulario de contacto - Sin debug, profesional
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
    // Verificar método de solicitud
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        exit;
    }

    // Leer datos del formulario
    $input = file_get_contents('php://input');
    $data = [];

    if (!empty($input)) {
        $json_data = json_decode($input, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
            $data = $json_data;
        }
    }
    $data = array_merge($data, $_POST);

    // Recibir y sanitizar datos
    $nombre = sanitizar($data['nombre'] ?? '');
    $email = sanitizar($data['email'] ?? '');
    $telefono = sanitizar($data['telefono'] ?? '');
    $motivo = sanitizar($data['motivo'] ?? '');
    $ayuda = sanitizar($data['ayuda'] ?? '');
    $tieneCliente = isset($data['tieneCliente']) ? 'Sí' : 'No';
    $pinCliente = sanitizar($data['pinCliente'] ?? '');
    $recomendado = sanitizar($data['recomendado'] ?? '');

    // Validación simple
    if (empty($nombre) || empty($email) || empty($motivo) || empty($ayuda)) {
        echo json_encode([
            'success' => false,
            'message' => 'Por favor, completa los campos obligatorios'
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
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; border: 2px solid #1e3c72; border-radius: 10px;'>
            <div style='background: #1e3c72; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>
                <h1 style='margin: 0; font-size: 24px;'>📋 Información del Contacto</h1>
                <p style='margin: 10px 0 0 0; opacity: 0.9;'>SUNSHINE TEAM - LifePlus PDF</p>
            </div>

            <div style='padding: 30px; background: #f8f9fa; border-radius: 0 0 8px 8px;'>
                <p style='margin: 5px 0;'><strong>Fecha:</strong> " . date('d/m/Y, H:i:s') . "</p>
                <p style='margin: 5px 0;'><strong>Nombre:</strong> $nombre</p>
                <p style='margin: 5px 0;'><strong>Email:</strong> $email</p>";

    if (!empty($telefono)) {
        $mensaje .= "<p style='margin: 5px 0;'><strong>Teléfono:</strong> $telefono</p>";
    }

    $mensaje .= "
                <p style='margin: 5px 0;'><strong>Motivo:</strong> $motivoTexto</p>
                <p style='margin: 5px 0;'><strong>Tiene cliente:</strong> $tieneCliente</p>";

    if ($tieneCliente === 'Sí' && !empty($pinCliente)) {
        $mensaje .= "<p style='margin: 5px 0;'><strong>PIN Cliente:</strong> $pinCliente</p>";
    }

    if (!empty($recomendado)) {
        $mensaje .= "<p style='margin: 5px 0;'><strong>Recomendado por:</strong> $recomendado</p>";
    }

    $mensaje .= "
                <hr style='margin: 20px 0; border: 1px solid #ddd;'>
                <h3 style='color: #1e3c72; margin-top: 0;'>❓ ¿Cómo podemos ayudar?</h3>
                <div style='background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3; margin: 15px 0;'>
                    " . nl2br($ayuda) . "
                </div>

                <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 0.9rem;'>
                    <p>Enviado desde: lifepluspdf.peterestela.com</p>
                    <p>IP: " . $_SERVER['REMOTE_ADDR'] . "</p>
                </div>
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
            'message' => '¡Gracias por contactarnos! Hemos recibido tu mensaje correctamente.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al enviar el mensaje. Por favor, inténtalo más tarde.'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>