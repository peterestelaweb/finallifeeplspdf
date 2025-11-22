<?php
/**
 * Test con datos EXACTOS del formulario para encontrar el problema
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

try {
    // Datos EXACTOS como los enviaría el formulario
    $nombre = 'TEST FORMULARIO REAL';
    $email = 'test@ejemplo.com';
    $telefono = '600000000';
    $motivo = 'oportunidad';
    $pregunta = 'Esta es una pregunta de prueba del formulario real';
    $ayuda = 'Esta es la sección de cómo podemos ayudar';
    $tieneCliente = 'No';
    $pinCliente = '';
    $recomendado = 'Test de diagnóstico';

    // Destinatario y asunto
    $destinatario = 'maykasunshineteam@gmail.com';
    $asunto = '🧪 TEST FORMULARIO REAL - ' . date('d/m/Y H:i:s');

    // Mensaje HTML EXACTAMENTE como lo construye el formulario
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
                <p><strong>Email:</strong> $email</p>
                <p><strong>Teléfono:</strong> $telefono</p>
                <p><strong>Motivo:</strong> Oportunidad de negocio</p>
                <p><strong>Tiene cliente:</strong> $tieneCliente</p>
                <p><strong>Recomendado por:</strong> $recomendado</p>

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

    // Headers EXACTAMENTE igual que el test que funcionó
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
        'php_version' => phpversion(),
        'server' => $_SERVER['HTTP_HOST']
    ];

    // Enviar email
    $enviado = mail($destinatario, $asunto, $mensaje, $headers);

    if ($enviado) {
        echo json_encode([
            'success' => true,
            'message' => '✅ TEST FORMULARIO REAL enviado correctamente. Revisa maykasunshineteam@gmail.com',
            'debug_info' => $debug_info
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => '❌ Error al enviar TEST FORMULARIO REAL',
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