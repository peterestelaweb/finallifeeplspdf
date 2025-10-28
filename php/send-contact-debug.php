<?php
/**
 * Versión DEBUG del formulario con logging detallado
 */

header('Content-Type: application/json');

// Enable error reporting para debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log file para debugging
$logFile = __DIR__ . '/../data/debug-email.log';
if (!file_exists(__DIR__ . '/../data')) {
    mkdir(__DIR__ . '/../data', 0755, true);
}

function logDebug($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);
    echo $logEntry . "\n"; // Also output for immediate feedback
}

logDebug("=== INICIO PETICIÓN FORMULARIO ===");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logDebug("ERROR: Método no permitido: " . $_SERVER['REQUEST_METHOD']);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

logDebug("Método: POST");

// Obtener y registrar todos los datos
$datos_recibidos = [];
foreach ($_POST as $key => $value) {
    $datos_recibidos[$key] = $value;
    logDebug("POST[$key] = $value");
}

$nombre = $_POST['nombre'] ?? '';
$email = $_POST['email'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$motivo = $_POST['motivo'] ?? '';
$ayuda = $_POST['ayuda'] ?? '';
$tienePin = $_POST['tienePin'] ?? 'No';
$pinCliente = $_POST['pinCliente'] ?? '';

logDebug("Nombre: $nombre");
logDebug("Email: $email");
logDebug("Motivo: $motivo");
logDebug("Ayuda: $ayuda");
logDebug("Tiene PIN: $tienePin");
logDebug("PIN Cliente: $pinCliente");

// Validar campos requeridos
if (empty($nombre) || empty($email) || empty($motivo) || empty($ayuda)) {
    $error_msg = 'Por favor completa todos los campos obligatorios';
    logDebug("ERROR: $error_msg");
    echo json_encode(['success' => false, 'message' => $error_msg]);
    exit;
}

// Validar email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $error_msg = 'Por favor ingresa un email válido';
    logDebug("ERROR: Email inválido: $email");
    echo json_encode(['success' => false, 'message' => $error_msg]);
    exit;
}

// Validar PIN si se tiene
if ($tienePin === 'Sí' && empty($pinCliente)) {
    $error_msg = 'Si tienes PIN, debes ingresarlo';
    logDebug("ERROR: Tiene PIN pero no ingresó número");
    echo json_encode(['success' => false, 'message' => $error_msg]);
    exit;
}

// Validar PIN de 7 dígitos
if (!empty($pinCliente)) {
    $validPins = ['6411840', '1234567', '2345678', '3456789', '4567890', '5678901', '6789012', '7890123', '8901234', '9012345'];
    if (!in_array($pinCliente, $validPins)) {
        $error_msg = 'El número PIN ingresado no es válido. Por favor verifica tu número de cliente LifePlus';
        logDebug("ERROR: PIN inválido: $pinCliente");
        echo json_encode(['success' => false, 'message' => $error_msg]);
        exit;
    }
    logDebug("PIN válido: $pinCliente");
}

// Preparar email
$destinatario = 'maykasunshineteam@gmail.com';
$asunto = 'Nuevo mensaje de contacto - Buscador LifePlus Formulaciones PDF [DEBUG]';

// Crear mensaje del email
$mensaje = "📋 Información del Contacto [DEBUG]

Fecha: " . date('d/m/Y H:i:s') . "
Nombre: $nombre
Email: $email
Teléfono: $telefono
Motivo: $motivo
Tiene cliente: $tienePin
PIN Cliente: $pinCliente

❓ ¿Cómo podemos ayudar?

$ayuda

---
Enviado desde: lifepluspdf.peterestela.com [DEBUG]
IP: " . $_SERVER['REMOTE_ADDR'] . "
User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown');

logDebug("Destinatario: $destinatario");
logDebug("Asunto: $asunto");
logDebug("Mensaje preparado, longitud: " . strlen($mensaje));

// Headers exactamente como en el test que funciona
$headers = "From: noreply@lifepluspdf.peterestela.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

logDebug("Headers: $headers");

// Verificar función mail()
if (!function_exists('mail')) {
    logDebug("ERROR: Función mail() no existe");
    echo json_encode(['success' => false, 'message' => 'Función mail() no disponible']);
    exit;
}

logDebug("Función mail() disponible, intentando enviar...");

// Enviar email
$emailEnviado = @mail($destinatario, $asunto, $mensaje, $headers);

if ($emailEnviado) {
    logDebug("✅ Email enviado exitosamente");
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado correctamente! [DEBUG]',
        'email_sent' => true,
        'debug_info' => [
            'destinatario' => $destinatario,
            'asunto' => $asunto,
            'longitud_mensaje' => strlen($mensaje),
            'headers' => $headers
        ]
    ]);
} else {
    logDebug("❌ Error al enviar email");
    $error = error_get_last();
    if ($error) {
        logDebug("Error PHP: " . $error['message']);
    }
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar el mensaje [DEBUG]',
        'email_sent' => false,
        'debug_info' => [
            'destinatario' => $destinatario,
            'asunto' => $asunto,
            'longitud_mensaje' => strlen($mensaje),
            'php_error' => $error ? $error['message'] : 'Unknown'
        ]
    ]);
}

logDebug("=== FIN PETICIÓN ===");
?>