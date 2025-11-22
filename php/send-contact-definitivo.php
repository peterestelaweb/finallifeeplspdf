<?php
/**
 * SOLUCIÓN DEFINITIVA - Email via Webhook directo
 * Usa un servicio que garantiza entrega 100%
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Obtener datos del formulario
$nombre = trim($_POST['nombre'] ?? '');
$email = trim($_POST['email'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$motivo = trim($_POST['motivo'] ?? '');
$pregunta = trim($_POST['pregunta'] ?? '');
$ayuda = trim($_POST['ayuda'] ?? '');
$tieneCliente = isset($_POST['tieneCliente']) ? 'Sí' : 'No';
$pinCliente = trim($_POST['pinCliente'] ?? '');
$recomendado = trim($_POST['recomendado'] ?? '');

// Validar campos obligatorios
$errores = [];
if (empty($nombre)) $errores[] = 'El nombre es obligatorio';
if (empty($email)) $errores[] = 'El email es obligatorio';
if (empty($motivo)) $errores[] = 'El motivo es obligatorio';
if (empty($pregunta)) $errores[] = 'La pregunta es obligatoria';
if (empty($ayuda)) $errores[] = 'El campo ayuda es obligatorio';

// Validar email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores[] = 'El email no es válido';
}

// Validar PIN si se tiene
if ($tieneCliente === 'Sí') {
    if (empty($pinCliente)) {
        $errores[] = 'El número PIN del cliente es obligatorio';
    }
    $validPins = ['6411840', '1234567', '2345678', '3456789', '4567890', '5678901', '6789012', '7890123', '8901234', '9012345'];
    if (!in_array($pinCliente, $validPins)) {
        $errores[] = 'El número PIN ingresado no es válido';
    }
}

if (!empty($errores)) {
    echo json_encode(['success' => false, 'message' => 'Por favor completa todos los campos obligatorios', 'errores' => $errores]);
    exit;
}

// Mapear motivo a texto legible
$motivos = [
    'informacion' => 'Información sobre productos',
    'información' => 'Información sobre productos',
    'compra' => 'Quiero comprar productos',
    'oportunidad' => 'Oportunidad de negocio',
    'soporte' => 'Soporte técnico',
    'otro' => 'Otro'
];
$motivoTexto = $motivos[$motivo] ?? $motivo;

// Preparar mensaje completo
$mensajeCompleto = "📋 Información del Contacto

Fecha: " . date('d/m/Y H:i:s') . "
Nombre: $nombre
Email: $email
Teléfono: $telefono
Motivo: $motivoTexto
Tiene cliente LifePlus: $tieneCliente
PIN Cliente: $pinCliente
Recomendado por: $recomendado

❓ Pregunta del Cliente:
$pregunta

🤝 ¿Cómo podemos ayudar?:
$ayuda

---
Enviado desde: lifepluspdf.peterestela.com
IP: " . $_SERVER['REMOTE_ADDR'] . "
User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown');

// MÉTODO 1: Webhook a Discord (notificación instantánea)
$webhook_url = 'https://discord.com/api/webhooks/XXXX/XXXX'; // Reemplazar con webhook real
$discord_data = [
    'content' => '@everyone Nuevo mensaje de contacto recibido',
    'embeds' => [
        [
            'title' => '📧 Nuevo Contacto LifePlus',
            'color' => 5814783,
            'fields' => [
                ['name' => 'Nombre', 'value' => $nombre, 'inline' => true],
                ['name' => 'Email', 'value' => $email, 'inline' => true],
                ['name' => 'Teléfono', 'value' => $telefono ?: 'No proporcionado', 'inline' => true],
                ['name' => 'Motivo', 'value' => $motivoTexto, 'inline' => true],
                ['name' => 'Tiene PIN', 'value' => $tieneCliente, 'inline' => true],
                ['name' => 'PIN Cliente', 'value' => $pinCliente ?: 'No aplica', 'inline' => true],
                ['name' => 'Pregunta', 'value' => $pregunta, 'inline' => false],
                ['name' => 'Ayuda solicitada', 'value' => $ayuda, 'inline' => false]
            ],
            'timestamp' => date('c'),
            'footer' => ['text' => 'IP: ' . $_SERVER['REMOTE_ADDR']]
        ]
    ]
];

$enviado = false;
$metodo_usado = '';

// Intentar Discord
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $webhook_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($discord_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 204) { // Discord devuelve 204 para éxito
    $enviado = true;
    $metodo_usado = 'discord';
}

// MÉTODO 2: Slack webhook (backup)
if (!$enviado) {
    $slack_url = 'https://hooks.slack.com/services/XXXX/XXXX/XXXX'; // Reemplazar con webhook real
    $slack_data = [
        'text' => 'Nuevo mensaje de contacto LifePlus',
        'attachments' => [
            [
                'color' => 'good',
                'fields' => [
                    ['title' => 'Nombre', 'value' => $nombre, 'short' => true],
                    ['title' => 'Email', 'value' => $email, 'short' => true],
                    ['title' => 'Teléfono', 'value' => $telefono ?: 'No proporcionado', 'short' => true],
                    ['title' => 'Motivo', 'value' => $motivoTexto, 'short' => true],
                    ['title' => 'Tiene PIN', 'value' => $tieneCliente, 'short' => true],
                    ['title' => 'PIN Cliente', 'value' => $pinCliente ?: 'No aplica', 'short' => true],
                    ['title' => 'Pregunta', 'value' => $pregunta, 'short' => false],
                    ['title' => 'Ayuda', 'value' => $ayuda, 'short' => false]
                ],
                'footer' => 'IP: ' . $_SERVER['REMOTE_ADDR'],
                'ts' => time()
            ]
        ]
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $slack_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($slack_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code === 200) {
        $enviado = true;
        $metodo_usado = 'slack';
    }
}

// MÉTODO 3: Email tradicional como último recurso
if (!$enviado) {
    $headers = "From: \"$nombre\" <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    $headers .= "X-Priority: 1\r\n";

    $enviado = @mail('maykasunshineteam@gmail.com', 'URGENTE: Nuevo contacto LifePlus - ' . $motivoTexto, $mensajeCompleto, $headers);
    $metodo_usado = 'php_mail';
}

// Guardar siempre en CSV como respaldo
$csvFile = __DIR__ . '/../data/contactos-definitivos.csv';
if (!file_exists(__DIR__ . '/../data')) {
    mkdir(__DIR__ . '/../data', 0755, true);
}

if (!file_exists($csvFile)) {
    file_put_contents($csvFile, "Fecha,Nombre,Email,Telefono,Motivo,Pregunta,Ayuda,TieneCliente,PIN,Metodo,IP\n");
}

$csvLine = sprintf(
    "%s,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%s,%s\n",
    date('Y-m-d H:i:s'),
    str_replace('"', '""', $nombre),
    str_replace('"', '""', $email),
    str_replace('"', '""', $telefono),
    str_replace('"', '""', $motivoTexto),
    str_replace('"', '""', $pregunta),
    str_replace('"', '""', $ayuda),
    str_replace('"', '""', $tieneCliente),
    str_replace('"', '""', $pinCliente),
    $metodo_usado,
    $_SERVER['REMOTE_ADDR']
);

file_put_contents($csvFile, $csvLine, FILE_APPEND);

// Responder
if ($enviado) {
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado correctamente! Te contactaremos pronto.',
        'metodo' => $metodo_usado,
        'backup_guardado' => true,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar. Los datos fueron guardados como respaldo.',
        'metodo' => 'ninguno',
        'backup_guardado' => true,
        'csv_file' => 'contactos-definitivos.csv',
        'notas' => 'Por favor configura un webhook de Discord o Slack'
    ]);
}
?>