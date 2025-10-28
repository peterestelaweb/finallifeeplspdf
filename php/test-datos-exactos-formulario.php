<?php
/**
 * Test con los DATOS EXACTOS que envió tu formulario
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuración
$destinatario = 'maykasunshineteam@gmail.com';

header('Content-Type: application/json');

try {
    // DATOS EXACTOS de tu formulario
    $nombre = 'MARIAM';
    $email = 'peterestela@gmail.com';
    $telefono = '+34 637 506 066';
    $motivo = 'informacion';
    $ayuda = 'asda';
    $tieneCliente = 'Sí';
    $pinCliente = '6411840';
    $recomendado = 'MARIA ANTONIA';

    // Mapear motivo
    $motivos = [
        'informacion' => 'Información sobre productos',
        'compra' => 'Quiero comprar productos',
        'oportunidad' => 'Oportunidad de negocio',
        'soporte' => 'Soporte técnico',
        'otro' => 'Otro'
    ];
    $motivoTexto = $motivos[$motivo] ?? $motivo;

    // Asunto EXACTO como el formulario
    $asunto = '📧 CONTACTO LIFEPLUS - MARIAM';

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
                <p>TEST CON DATOS EXACTOS DEL FORMULARIO</p>
            </div>
        </div>
    </body>
    </html>";

    // Headers EXACTOS
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
        'datos_usados' => [
            'nombre' => $nombre,
            'email' => $email,
            'telefono' => $telefono,
            'motivo' => $motivo,
            'ayuda' => $ayuda,
            'recomendado' => $recomendado
        ]
    ];

    // Enviar email
    $enviado = mail($destinatario, $asunto, $mensaje, $headers);

    if ($enviado) {
        echo json_encode([
            'success' => true,
            'message' => '✅ TEST DATOS EXACTOS enviado. Revisa maykasunshineteam@gmail.com',
            'debug_info' => $debug_info
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => '❌ Error al enviar TEST DATOS EXACTOS',
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