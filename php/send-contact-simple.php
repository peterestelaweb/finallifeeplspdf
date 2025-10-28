<?php
/**
 * Versión simplificada del formulario de contacto que SÍ envía emails
 * Basado en el test que funciona perfectamente
 */

// Configuración
$destinatario = 'maykasunshineteam@gmail.com';

// Headers para respuesta JSON
header('Content-Type: application/json');

// Función para validar y sanitizar datos
function sanitizar($dato) {
    $dato = trim($dato);
    $dato = stripslashes($dato);
    $dato = htmlspecialchars($dato);
    return $dato;
}

try {
    // Verificar método de solicitud
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Recibir y sanitizar datos del formulario
    $nombre = sanitizar($_POST['nombre'] ?? '');
    $email = sanitizar($_POST['email'] ?? '');
    $telefono = sanitizar($_POST['telefono'] ?? '');
    $motivo = sanitizar($_POST['motivo'] ?? '');
    $pregunta = sanitizar($_POST['pregunta'] ?? '');
    $ayuda = sanitizar($_POST['ayuda'] ?? '');
    $tieneCliente = isset($_POST['tieneCliente']) ? 'Sí' : 'No';
    $pinCliente = sanitizar($_POST['pinCliente'] ?? '');
    $recomendado = sanitizar($_POST['recomendado'] ?? '');

    // Validar campos obligatorios
    $errores = [];

    if (empty($nombre)) {
        $errores[] = 'El nombre es obligatorio';
    }

    if (empty($email)) {
        $errores[] = 'El email es obligatorio';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errores[] = 'El email no es válido';
    }

    if (empty($motivo)) {
        $errores[] = 'El motivo de contacto es obligatorio';
    }

    if (empty($pregunta)) {
        $errores[] = 'La pregunta es obligatoria';
    }

    if (empty($ayuda)) {
        $errores[] = 'El campo "¿Cómo te podemos ayudar?" es obligatorio';
    }

    // Si hay errores, devolverlos
    if (!empty($errores)) {
        echo json_encode([
            'success' => false,
            'message' => 'Por favor, completa todos los campos obligatorios correctamente',
            'errores' => $errores
        ]);
        exit;
    }

    // Mapear motivo a texto legible
    $motivos = [
        'informacion' => 'Información sobre productos',
        'compra' => 'Quiero comprar productos',
        'oportunidad' => 'Oportunidad de negocio',
        'soporte' => 'Soporte técnico',
        'otro' => 'Otro'
    ];

    $motivoTexto = $motivos[$motivo] ?? $motivo;

    // Crear mensaje HTML del email - FORMATO SIMPLE QUE FUNCIONA
    $asunto = '📧 NUEVO CONTACTO LIFEPLUS - ' . $nombre;

    $mensaje = "
    <html>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #1e3c72; border-radius: 10px;'>
            <div style='background: #1e3c72; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>
                <h1 style='margin: 0; font-size: 24px;'>📋 Información del Contacto</h1>
                <p style='margin: 10px 0 0 0;'>SUNSHINE TEAM - LifePlus PDF</p>
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
                <hr style='margin: 20px 0; border: 1px solid #ddd;'>
                <h3>❓ ¿Cómo podemos ayudar?</h3>
                <p style='background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3;'>" . nl2br(htmlspecialchars($ayuda)) . "</p>

                <h3>💬 Consulta principal:</h3>
                <p style='background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50;'>" . nl2br(htmlspecialchars($pregunta)) . "</p>
            </div>

            <div style='background: #1e3c72; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 0.9rem;'>
                <p>Enviado desde: lifepluspdf.peterestela.com</p>
                <p>IP: " . $_SERVER['REMOTE_ADDR'] . "</p>
            </div>
        </div>
    </body>
    </html>";

    // Headers - MISMO FORMATO QUE EL TEST QUE FUNCIONA
    $headers = "From: contacto@lifepluspdf.peterestela.com\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    // Enviar email
    $enviado = mail($destinatario, $asunto, $mensaje, $headers);

    if ($enviado) {
        echo json_encode([
            'success' => true,
            'message' => '✅ Mensaje enviado correctamente. Te contactaremos pronto.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => '❌ Error al enviar el email. Por favor, inténtalo más tarde.'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>