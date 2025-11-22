<?php
/**
 * Envío directo de email usando PHP mail() - SIN Google Scripts
 * Solo usa la función mail() de PHP que ya funciona
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Obtener datos
$nombre = $_POST['nombre'] ?? '';
$email = $_POST['email'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$motivo = $_POST['motivo'] ?? '';
$ayuda = $_POST['ayuda'] ?? '';
$tienePin = $_POST['tienePin'] ?? 'No';
$pinCliente = $_POST['pinCliente'] ?? '';

// Validar
if (empty($nombre) || empty($email) || empty($motivo) || empty($ayuda)) {
    echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios']);
    exit;
}

// Destinatario
$destinatario = 'maykasunshineteam@gmail.com';
$asunto = 'Nuevo contacto LifePlus - ' . $nombre;

// Mensaje con formato que recibiste ayer
$mensaje = "
📋 Información del Contacto

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
";

// Headers
$headers = "From: contacto@lifepluspdf.peterestela.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Enviar email
$enviado = mail($destinatario, $asunto, $mensaje, $headers);

if ($enviado) {
    echo json_encode([
        'success' => true,
        'message' => '¡Email enviado correctamente! Te contactaremos pronto.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar email. Inténtalo de nuevo.'
    ]);
}
?>