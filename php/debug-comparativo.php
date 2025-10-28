<?php
/**
 * Debug comparativo: Test vs Formulario Real
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

try {
    // Leer si viene de formulario o es test
    $es_formulario = ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST));

    if ($es_formulario) {
        // Datos del formulario real
        $input = file_get_contents('php://input');
        $data = [];

        if (!empty($input)) {
            $json_data = json_decode($input, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
                $data = $json_data;
            }
        }
        $data = array_merge($data, $_POST);

        $nombre = htmlspecialchars(trim($data['nombre'] ?? ''));
        $email = htmlspecialchars(trim($data['email'] ?? ''));
        $telefono = htmlspecialchars(trim($data['telefono'] ?? ''));
        $motivo = htmlspecialchars(trim($data['motivo'] ?? ''));
        $ayuda = htmlspecialchars(trim($data['ayuda'] ?? ''));
        $tieneCliente = isset($data['tieneCliente']) ? 'Sí' : 'No';
        $pinCliente = htmlspecialchars(trim($data['pinCliente'] ?? ''));
        $recomendado = htmlspecialchars(trim($data['recomendado'] ?? ''));

        $tipo = 'FORMULARIO_REAL';
    } else {
        // Datos del test
        $nombre = 'MARIAM';
        $email = 'peterestela@gmail.com';
        $telefono = '+34 637 506 066';
        $motivo = 'informacion';
        $ayuda = 'asda';
        $tieneCliente = 'Sí';
        $pinCliente = '6411840';
        $recomendado = 'MARIA ANTONIA';

        $tipo = 'TEST_DATOS_EXACTOS';
    }

    // Debug comparativo
    $debug_comparativo = [
        'tipo' => $tipo,
        'metodo_http' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'no_set',
        'datos_comparados' => [
            'nombre' => ['valor' => $nombre, 'longitud' => strlen($nombre)],
            'email' => ['valor' => $email, 'longitud' => strlen($email)],
            'telefono' => ['valor' => $telefono, 'longitud' => strlen($telefono)],
            'motivo' => ['valor' => $motivo, 'longitud' => strlen($motivo)],
            'ayuda' => ['valor' => $ayuda, 'longitud' => strlen($ayuda)],
            'recomendado' => ['valor' => $recomendado, 'longitud' => strlen($recomendado)]
        ]
    ];

    // Solo enviar email si hay datos válidos
    if (!empty($nombre) && !empty($email)) {

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
        $destinatario = 'maykasunshineteam@gmail.com';
        $asunto = "[$tipo] 📧 CONTACTO LIFEPLUS - $nombre";

        $mensaje = "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; border: 2px solid #1e3c72; border-radius: 10px;'>
                <div style='background: #1e3c72; color: white; padding: 20px; text-align: center;'>
                    <h1>📋 Información del Contacto</h1>
                    <p>SUNSHINE TEAM - LifePlus PDF</p>
                    <p><strong>TIPO: $tipo</strong></p>
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
                    <p>DEBUG COMPARATIVO</p>
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

        $debug_comparativo['email_enviado'] = $enviado;
        $debug_comparativo['destinatario'] = $destinatario;
        $debug_comparativo['asunto'] = $asunto;

        if ($enviado) {
            echo json_encode([
                'success' => true,
                'message' => "✅ Email [$tipo] enviado correctamente. Revisa maykasunshineteam@gmail.com",
                'debug' => $debug_comparativo
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => "❌ Error al enviar email [$tipo]",
                'debug' => $debug_comparativo,
                'error' => error_get_last()
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No hay datos válidos para enviar email',
            'debug' => $debug_comparativo
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>