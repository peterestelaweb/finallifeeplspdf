<?php
/**
 * Test con el email EXACTO que enviaría el formulario pero con datos de prueba
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuración
$destinatario = 'maykasunshineteam@gmail.com';

header('Content-Type: application/json');

try {
    // Datos exactos como los enviaría el formulario
    $nombre = 'TEST FORMULARIO COMPLETO';
    $email = 'test@ejemplo.com';
    $telefono = '600000000';
    $motivo = 'oportunidad';
    $ayuda = 'Esta es la sección de cómo podemos ayudar con datos reales del formulario';
    $tieneCliente = 'No';
    $pinCliente = '';
    $recomendado = 'Test completo del formulario';

    // Mapear motivo
    $motivos = [
        'informacion' => 'Información sobre productos',
        'compra' => 'Quiero comprar productos',
        'oportunidad' => 'Oportunidad de negocio',
        'soporte' => 'Soporte técnico',
        'otro' => 'Otro'
    ];
    $motivoTexto = $motivos[$motivo] ?? $motivo;

    // Crear email EXACTAMENTE igual que el formulario
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

    // Headers EXACTOS igual que el test que funcionó
    $headers = "From: contacto@lifepluspdf.peterestela.com\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    // Debug info
    $debug_info = [
        'destinatario' => $destinatario,
        'asunto' => $asunto,
        'headers' => $headers,
        'mensaje_length' => strlen($mensaje),
        'tiene_cliente' => $tieneCliente,
        'recomendado_no_vacio' => !empty($recomendado),
        'ayuda_length' => strlen($ayuda)
    ];

    // Enviar email
    $enviado = mail($destinatario, $asunto, $mensaje, $headers);

    if ($enviado) {
        echo json_encode([
            'success' => true,
            'message' => '✅ TEST FORMULARIO COMPLETO enviado correctamente. Revisa maykasunshineteam@gmail.com',
            'debug_info' => $debug_info
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => '❌ Error al enviar TEST FORMULARIO COMPLETO',
            'debug_info' => $debug_info,
            'error' => error_get_last()
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>