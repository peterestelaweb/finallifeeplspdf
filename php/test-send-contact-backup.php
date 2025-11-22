<?php
/**
 * Script para probar el envío del formulario de contacto con respaldo
 */

// Configuración
$destinatario = 'maykasunshineteam@gmail.com';
$asunto = 'Nuevo mensaje de contacto - Buscador LifePlus Formulaciones PDF';
$logFile = __DIR__ . '/../data/contactos.log';

// Headers para respuesta JSON
header('Content-Type: application/json');

// Crear directorio data si no existe
if (!file_exists(__DIR__ . '/../data')) {
    mkdir(__DIR__ . '/../data', 0755, true);
}

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

// Función para guardar en log
function guardarEnLog($datos, $logFile) {
    $logEntry = date('Y-m-d H:i:s') . " - " . json_encode($datos, JSON_UNESCAPED_UNICODE) . "\n";
    return file_put_contents($logFile, $logEntry, FILE_APPEND);
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

    // Preparar datos para guardar
    $datosContacto = [
        'nombre' => $nombre,
        'email' => $email,
        'telefono' => $telefono,
        'motivo' => $motivo,
        'pregunta' => $pregunta,
        'tieneCliente' => $tieneCliente,
        'pinCliente' => $pinCliente,
        'recomendado' => $recomendado,
        'ayuda' => $ayuda,
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido'
    ];

    // Guardar en archivo de log
    if (guardarEnLog($datosContacto, $logFile)) {
        $logGuardado = true;
    } else {
        $logGuardado = false;
    }

    // Intentar enviar email
    $emailEnviado = false;
    if (function_exists('mail')) {
        // Mapear motivo a texto legible
        $motivos = [
            'informacion' => 'Información sobre productos',
            'compra' => 'Quiero comprar productos',
            'oportunidad' => 'Oportunidad de negocio',
            'soporte' => 'Soporte técnico',
            'otro' => 'Otro'
        ];

        $motivoTexto = $motivos[$motivo] ?? $motivo;

        // Crear mensaje simple del email
        $mensajeTexto = "
Nuevo mensaje de contacto - Buscador LifePlus Formulaciones PDF

Datos del Contacto:
Nombre: $nombre
Email: $email
Teléfono: $telefono
Motivo: $motivoTexto
Tiene cliente LifePlus: $tieneCliente
" . ($tieneCliente === 'Sí' ? "PIN del cliente: $pinCliente\nRecomendado por: $recomendado" : "") . "

Pregunta del Cliente:
$pregunta

¿Cómo podemos ayudar?:
$ayuda

---
Enviado desde: lifepluspdf.peterestela.com
IP: {$_SERVER['REMOTE_ADDR']}
Fecha: " . date('d/m/Y H:i:s');

        $headers = "From: noreply@lifepluspdf.peterestela.com\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        $emailEnviado = mail($destinatario, $asunto, $mensajeTexto, $headers);
    }

    // Respuesta final
    if ($emailEnviado) {
        echo json_encode([
            'success' => true,
            'message' => 'Mensaje enviado correctamente. Te contactaremos pronto.',
            'metodo' => 'email',
            'debug' => [
                'log_guardado' => $logGuardado,
                'email_enviado' => $emailEnviado,
                'datos_recibidos' => $datosContacto
            ]
        ]);
    } elseif ($logGuardado) {
        echo json_encode([
            'success' => true,
            'message' => 'Mensaje guardado correctamente. Te contactaremos pronto. (El email no pudo enviarse pero los datos fueron guardados)',
            'metodo' => 'backup',
            'debug' => [
                'log_guardado' => $logGuardado,
                'email_enviado' => $emailEnviado,
                'datos_recibidos' => $datosContacto
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar el mensaje. Por favor, inténtalo más tarde o contacta directamente a maykasunshineteam@gmail.com',
            'debug' => [
                'log_guardado' => $logGuardado,
                'email_enviado' => $emailEnviado,
                'error' => 'No se pudo guardar en log ni enviar email'
            ]
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'debug' => [
            'exception' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]
    ]);
}
?>