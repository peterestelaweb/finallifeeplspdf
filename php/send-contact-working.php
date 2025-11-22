<?php
/**
 * PHP simple que usa el método mail() que SÍ funciona
 * Basado en el test que funcionó: send-email-external.php
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Obtener datos del formulario
$nombre = $_POST['nombre'] ?? '';
$email = $_POST['email'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$motivo = $_POST['motivo'] ?? '';
$ayuda = $_POST['ayuda'] ?? '';
$tienePin = $_POST['tienePin'] ?? 'No';
$pinCliente = $_POST['pinCliente'] ?? '';

// Validar campos requeridos
if (empty($nombre) || empty($email) || empty($motivo) || empty($ayuda)) {
    echo json_encode(['success' => false, 'message' => 'Por favor completa todos los campos obligatorios']);
    exit;
}

// Validar email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Por favor ingresa un email válido']);
    exit;
}

// Validar PIN si se tiene
if ($tienePin === 'Sí' && empty($pinCliente)) {
    echo json_encode(['success' => false, 'message' => 'Si tienes PIN, debes ingresarlo']);
    exit;
}

// Validar PIN de 7 dígitos
if (!empty($pinCliente)) {
    $validPins = ['6411840', '1234567', '2345678', '3456789', '4567890', '5678901', '6789012', '7890123', '8901234', '9012345'];
    if (!in_array($pinCliente, $validPins)) {
        echo json_encode(['success' => false, 'message' => 'El número PIN ingresado no es válido. Por favor verifica tu número de cliente LifePlus']);
        exit;
    }
}

// Preparar email exactamente como funciona
$destinatario = 'maykasunshineteam@gmail.com';
$asunto = 'Nuevo mensaje de contacto - Buscador LifePlus Formulaciones PDF';

// Crear mensaje del email con el formato que recibiste ayer
$mensaje = "📋 Información del Contacto

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
Enviado desde: lifepluspdf.peterestela.com
IP: " . $_SERVER['REMOTE_ADDR'];

// Headers exactamente como en el test que funciona
$headers = "From: noreply@lifepluspdf.peterestela.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Enviar email usando el método que SÍ funciona
$emailEnviado = @mail($destinatario, $asunto, $mensaje, $headers);

if ($emailEnviado) {
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado correctamente! Te contactaremos pronto.',
        'email_sent' => true
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar el mensaje. Por favor intenta más tarde.',
        'email_sent' => false
    ]);
}
?>