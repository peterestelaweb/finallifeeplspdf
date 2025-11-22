<?php
/**
 * Script para enviar datos directamente a Google Sheets via Webhook
 * Método más simple y directo
 */

header('Content-Type: application/json');

// Configuración del Webhook (Puedes usar n8n, Google Apps Script, etc.)
$webhookUrl = 'https://script.google.com/macros/s/AKfycbxknuOqnyzNBlmaE2fv29sXY7mnVPDwD0P3nb4kC-A5XXiDX6E8QbU1go_Ly8Pz44W4Gg/exec'; // URL de Google Apps Script

// Función para sanitizar datos
function sanitizar($dato) {
    $dato = trim($dato);
    $dato = stripslashes($dato);
    $dato = htmlspecialchars($dato);
    return $dato;
}

// Función para enviar a Webhook con manejo de redireccionamientos
function enviarAWebhook($datos, $webhookUrl) {
    if ($webhookUrl === 'TU_WEBHOOK_URL_AQUI') {
        return false; // No configurado
    }

    // Usar el MISMO formato que el curl funcional (el que sí funciona)
    $payloadData = [
        'token' => 'd5a8f3e2-4c7b-49a0-9f1e-7c2d5b8a6f04',
        'name' => $datos['nombre'],
        'email' => $datos['email'],
        'phone' => $datos['telefono'],
        'message' => $datos['pregunta'] . "\n\nMotivo: " . $datos['motivo'] . "\nAyuda: " . $datos['ayuda'],
        'source' => 'lifepluspdf.peterestela.com'
    ];

    // Si tiene cliente, añadir información adicional
    if ($datos['tieneCliente'] === 'Sí' && !empty($datos['pinCliente'])) {
        $payloadData['message'] .= "\nPIN Cliente: " . $datos['pinCliente'];
    }

    if (!empty($datos['recomendado'])) {
        $payloadData['message'] .= "\nRecomendado por: " . $datos['recomendado'];
    }

    // Usar formato URL-encoded (el que funciona con el curl)
    $payload = http_build_query($payloadData);

    // Usar cURL con la misma configuración que el curl funcional
    if (function_exists('curl_init')) {
        $ch = curl_init($webhookUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $curl_response = curl_exec($ch);
        $curl_error = curl_error($ch);
        $curl_info = curl_getinfo($ch);
        curl_close($ch);

        if ($curl_error) {
            error_log("cURL Error: " . $curl_error);
            error_log("cURL Info: " . print_r($curl_info, true));
            return false;
        } else {
            error_log("cURL Success: " . $curl_response);
            error_log("cURL Info: " . print_r($curl_info, true));

            // Verificar si la respuesta es exitosa (como en el curl funcional)
            $responseData = json_decode($curl_response, true);
            return ($responseData && isset($responseData['ok']) && $responseData['ok'] === true);
        }
    }

    // Si cURL falla, intentar con file_get_contents
    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n" .
                        "User-Agent: LifePlus-PDF-Contact-Form/1.0\r\n",
            'method' => 'POST',
            'content' => $payload,
            'ignore_errors' => true,
            'follow_location' => 1,
            'max_redirects' => 5,
            'timeout' => 30
        ]
    ];

    $context = stream_context_create($options);
    $response = @file_get_contents($webhookUrl, false, $context);

    if ($response !== false) {
        error_log("file_get_contents Success: " . $response);
        return true;
    }

    error_log("file_get_contents failed: " . error_get_last()['message']);
    return false;
}

  
try {
    // Verificar método de solicitud
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Recibir y sanitizar datos
    $datos = [
        'timestamp' => date('Y-m-d H:i:s'),
        'nombre' => sanitizar($_POST['nombre'] ?? ''),
        'email' => sanitizar($_POST['email'] ?? ''),
        'telefono' => sanitizar($_POST['telefono'] ?? ''),
        'motivo' => sanitizar($_POST['motivo'] ?? ''),
        'pregunta' => sanitizar($_POST['pregunta'] ?? ''),
        'tieneCliente' => isset($_POST['tieneCliente']) ? 'Sí' : 'No',
        'pinCliente' => sanitizar($_POST['pinCliente'] ?? ''),
        'recomendado' => sanitizar($_POST['recomendado'] ?? ''),
        'ayuda' => sanitizar($_POST['ayuda'] ?? ''),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido'
    ];

    // Validar campos obligatorios
    $errores = [];
    if (empty($datos['nombre'])) $errores[] = 'El nombre es obligatorio';
    if (empty($datos['email'])) $errores[] = 'El email es obligatorio';
    if (empty($datos['motivo'])) $errores[] = 'El motivo es obligatorio';
    if (empty($datos['pregunta'])) $errores[] = 'La pregunta es obligatoria';
    if (empty($datos['ayuda'])) $errores[] = 'El campo ayuda es obligatorio';

    if (!empty($errores)) {
        echo json_encode([
            'success' => false,
            'message' => 'Por favor, completa todos los campos obligatorios',
            'errores' => $errores
        ]);
        exit;
    }

    // Intentar enviar al webhook
    $webhookSuccess = enviarAWebhook($datos, $webhookUrl);

    // Guardar en archivo CSV como respaldo
    $csvFile = __DIR__ . '/../data/contactos-direct.csv';
    $csvHeader = "Fecha,Nombre,Email,Teléfono,Motivo,Pregunta,Tiene Cliente,PIN,Recomendado,Ayuda,IP\n";

    if (!file_exists(__DIR__ . '/../data')) {
        mkdir(__DIR__ . '/../data', 0755, true);
    }

    if (!file_exists($csvFile)) {
        file_put_contents($csvFile, $csvHeader);
    }

    $csvLine = sprintf(
        "%s,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%s\n",
        $datos['timestamp'],
        str_replace('"', '""', $datos['nombre']),
        str_replace('"', '""', $datos['email']),
        str_replace('"', '""', $datos['telefono']),
        str_replace('"', '""', $datos['motivo']),
        str_replace('"', '""', $datos['pregunta']),
        str_replace('"', '""', $datos['tieneCliente']),
        str_replace('"', '""', $datos['pinCliente']),
        str_replace('"', '""', $datos['recomendado']),
        str_replace('"', '""', $datos['ayuda']),
        $datos['ip']
    );

    $csvSuccess = file_put_contents($csvFile, $csvLine, FILE_APPEND) !== false;

    // Intentar enviar email también
    $emailEnviado = false;
    $destinatario = 'maykasunshineteam@gmail.com';
    $asunto = 'Nuevo mensaje de contacto - Buscador LifePlus Formulaciones PDF';

    if (function_exists('mail')) {
        // Mapear motivo a texto legible
        $motivos = [
            'informacion' => 'Información sobre productos',
            'compra' => 'Quiero comprar productos',
            'oportunidad' => 'Oportunidad de negocio',
            'soporte' => 'Soporte técnico',
            'otro' => 'Otro'
        ];

        $motivoTexto = $motivos[$datos['motivo']] ?? $datos['motivo'];

        // Crear mensaje del email
        $mensajeTexto = "
Nuevo mensaje de contacto - Buscador LifePlus Formulaciones PDF

Datos del Contacto:
Nombre: {$datos['nombre']}
Email: {$datos['email']}
Teléfono: {$datos['telefono']}
Motivo: {$motivoTexto}
Tiene cliente LifePlus: {$datos['tieneCliente']}
" . ($datos['tieneCliente'] === 'Sí' ? "PIN del cliente: {$datos['pinCliente']}\nRecomendado por: {$datos['recomendado']}" : "") . "

Pregunta del Cliente:
{$datos['pregunta']}

¿Cómo podemos ayudar?:
{$datos['ayuda']}

---
Enviado desde: lifepluspdf.peterestela.com
IP: {$datos['ip']}
Fecha: " . date('d/m/Y H:i:s');

        $headers = "From: noreply@lifepluspdf.peterestela.com\r\n";
        $headers .= "Reply-To: {$datos['email']}\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        $emailEnviado = @mail($destinatario, $asunto, $mensajeTexto, $headers);
    }

    // Respuesta
    if ($webhookSuccess && $emailEnviado) {
        echo json_encode([
            'success' => true,
            'message' => '¡Mensaje enviado con éxito a Google Sheets y email! Te contactaremos pronto.',
            'metodo' => 'webhook_directo_y_email',
            'debug' => [
                'webhook' => $webhookSuccess,
                'email' => $emailEnviado,
                'csv_backup' => $csvSuccess
            ]
        ]);
    } elseif ($webhookSuccess) {
        echo json_encode([
            'success' => true,
            'message' => '¡Mensaje enviado con éxito a Google Sheets! Te contactaremos pronto.',
            'metodo' => 'webhook_directo',
            'debug' => [
                'webhook' => $webhookSuccess,
                'email' => $emailEnviado,
                'csv_backup' => $csvSuccess
            ]
        ]);
    } elseif ($csvSuccess && $emailEnviado) {
        echo json_encode([
            'success' => true,
            'message' => 'Mensaje enviado por email y guardado en CSV. Te contactaremos pronto.',
            'metodo' => 'email_y_csv',
            'debug' => [
                'webhook' => $webhookSuccess,
                'email' => $emailEnviado,
                'csv_backup' => $csvSuccess
            ]
        ]);
    } elseif ($csvSuccess) {
        echo json_encode([
            'success' => true,
            'message' => 'Mensaje guardado en CSV. Puedes importarlo a Google Sheets manualmente.',
            'metodo' => 'csv_backup',
            'debug' => [
                'webhook' => $webhookSuccess,
                'email' => $emailEnviado,
                'csv_backup' => $csvSuccess,
                'nota' => 'Configura el webhook_url para integración directa con Google Sheets'
            ]
        ]);
    } elseif ($emailEnviado) {
        echo json_encode([
            'success' => true,
            'message' => '¡Mensaje enviado por email! Te contactaremos pronto.',
            'metodo' => 'email',
            'debug' => [
                'webhook' => $webhookSuccess,
                'email' => $emailEnviado,
                'csv_backup' => $csvSuccess
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar el mensaje. Por favor, intenta más tarde.',
            'debug' => [
                'webhook' => $webhookSuccess,
                'email' => $emailEnviado,
                'csv_backup' => $csvSuccess
            ]
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>