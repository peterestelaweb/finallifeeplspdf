<?php
/**
 * Script para procesar el formulario de contacto y enviar emails
 *
 * Este script recibe los datos del formulario de contacto,
 * valida los campos y envía un email al equipo SUNSHINE TEAM
 */

// Configuración
$destinatario = 'maykasunshineteam@gmail.com';
$asunto = 'Nuevo mensaje de contacto - Buscador LifePlus Formulaciones PDF';

// Headers para respuesta JSON
header('Content-Type: application/json');

// Función para validar y sanitizar datos
function sanitizar($dato) {
    $dato = trim($dato);
    $dato = stripslashes($dato);
    $dato = htmlspecialchars($dato);
    return $dato;
}

// Función para validar email
function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Función para enviar email
function enviarEmail($destinatario, $asunto, $mensaje, $remitente) {
    $headers = "From: $remitente\r\n";
    $headers .= "Reply-To: $remitente\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    return mail($destinatario, $asunto, $mensaje, $headers);
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
    $tieneCliente = isset($_POST['tieneCliente']) ? 'Sí' : 'No';
    $pinCliente = sanitizar($_POST['pinCliente'] ?? '');
    $recomendado = sanitizar($_POST['recomendado'] ?? '');
    $ayuda = sanitizar($_POST['ayuda'] ?? '');

    // Validar campos obligatorios
    $errores = [];

    if (empty($nombre)) {
        $errores[] = 'El nombre es obligatorio';
    }

    if (empty($email)) {
        $errores[] = 'El email es obligatorio';
    } elseif (!validarEmail($email)) {
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

    // Validar campos adicionales si es cliente
    if ($tieneCliente === 'Sí') {
        if (empty($pinCliente)) {
            $errores[] = 'El número PIN del cliente es obligatorio';
        }
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

    // Crear mensaje HTML del email
    $mensajeHTML = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <title>Nuevo mensaje de contacto</title>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                <h1 style='margin: 0; font-size: 24px;'>📧 Nuevo Mensaje de Contacto</h1>
                <p style='margin: 10px 0 0 0; opacity: 0.9;'>Buscador LifePlus Formulaciones PDF</p>
            </div>

            <div style='background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-radius: 0 0 10px 10px;'>
                <h2 style='color: #1e3c72; margin-top: 0;'>📋 Datos del Contacto</h2>

                <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                    <tr style='background: #e9ecef;'>
                        <td style='padding: 10px; font-weight: bold; width: 40%;'>Campo:</td>
                        <td style='padding: 10px; font-weight: bold;'>Información:</td>
                    </tr>
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'><strong>Nombre:</strong></td>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'>$nombre</td>
                    </tr>
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'><strong>Email:</strong></td>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'>$email</td>
                    </tr>";

    if (!empty($telefono)) {
        $mensajeHTML .= "
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'><strong>Teléfono:</strong></td>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'>$telefono</td>
                    </tr>";
    }

    $mensajeHTML .= "
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'><strong>Motivo de contacto:</strong></td>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'>$motivoTexto</td>
                    </tr>
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'><strong>Tiene cliente LifePlus:</strong></td>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'>$tieneCliente</td>
                    </tr>";

    if ($tieneCliente === 'Sí' && !empty($pinCliente)) {
        $mensajeHTML .= "
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'><strong>Número PIN del cliente:</strong></td>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'>$pinCliente</td>
                    </tr>";
    }

    if ($tieneCliente === 'Sí' && !empty($recomendado)) {
        $mensajeHTML .= "
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'><strong>Quién lo recomendó:</strong></td>
                        <td style='padding: 10px; border-bottom: 1px solid #dee2e6;'>$recomendado</td>
                    </tr>";
    }

    $mensajeHTML .= "
                </table>

                <h3 style='color: #1e3c72;'>❓ Pregunta del Cliente:</h3>
                <div style='background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50; margin: 15px 0;'>
                    " . nl2br(htmlspecialchars($pregunta)) . "
                </div>

                <h3 style='color: #1e3c72;'>🤝 ¿Cómo podemos ayudar?:</h3>
                <div style='background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3; margin: 15px 0;'>
                    " . nl2br(htmlspecialchars($ayuda)) . "
                </div>

                <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 0.9rem;'>
                    <p>Este mensaje fue enviado desde el formulario de contacto del Buscador LifePlus Formulaciones PDF</p>
                    <p>Fecha y hora: " . date('d/m/Y H:i:s') . "</p>
                    <p>Dirección IP: " . $_SERVER['REMOTE_ADDR'] . "</p>
                </div>
            </div>
        </div>
    </body>
    </html>";

    // Enviar email
    $remitenteEmail = "noreply@lifepluspdf.peterestela.com";
    $remitenteNombre = "Formulario de Contacto - LifePlus PDF";
    $remitente = "$remitenteNombre <$remitenteEmail>";

    if (enviarEmail($destinatario, $asunto, $mensajeHTML, $remitente)) {
        // También enviar confirmación al usuario (opcional)
        $confirmacionHTML = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Confirmación de contacto</title>
        </head>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <div style='background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>
                    <h1 style='margin: 0; font-size: 24px;'>✅ Mensaje Recibido</h1>
                    <p style='margin: 10px 0 0 0; opacity: 0.9;'>SUNSHINE TEAM</p>
                </div>

                <div style='background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-radius: 0 0 10px 10px;'>
                    <h2 style='color: #4CAF50; margin-top: 0;'>Hola $nombre,</h2>
                    <p>Hemos recibido tu mensaje correctamente. Nuestro equipo SUNSHINE TEAM te contactará lo antes posible.</p>

                    <div style='background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50; margin: 15px 0;'>
                        <h3 style='margin-top: 0; color: #4CAF50;'>📋 Resumen de tu mensaje:</h3>
                        <p><strong>Motivo:</strong> $motivoTexto</p>
                        <p><strong>Email:</strong> $email</p>
                        " . (!empty($telefono) ? "<p><strong>Teléfono:</strong> $telefono</p>" : "") . "
                    </div>

                    <p>Si tienes alguna urgencia, no dudes en contactarnos directamente respondiendo a este email.</p>

                    <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 0.9rem;'>
                        <p>Atentamente,<br><strong>SUNSHINE TEAM</strong><br>Buscador LifePlus Formulaciones PDF</p>
                        <p>📧 maykasunshineteam@gmail.com</p>
                    </div>
                </div>
            </div>
        </body>
        </html>";

        // Enviar confirmación al usuario
        enviarEmail($email, "Hemos recibido tu mensaje - SUNSHINE TEAM", $confirmacionHTML, $remitente);

        echo json_encode([
            'success' => true,
            'message' => 'Mensaje enviado correctamente. Te contactaremos pronto.'
        ]);
    } else {
        throw new Exception('Error al enviar el email');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>