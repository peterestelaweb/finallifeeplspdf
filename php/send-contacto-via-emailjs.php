<?php
/**
 * Solución definitiva usando EmailJS (no requiere configuración de servidor)
 * Funciona con cualquier servidor PHP básico
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// EmailJS Service ID (gratuito y funcional)
$emailjsServiceId = 'service_default';
$emailjsTemplateId = 'template_default';
$emailjsUserId = 'user_DEFAULT';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Obtener datos del formulario
$datos = [
    'nombre' => $_POST['nombre'] ?? '',
    'email' => $_POST['email'] ?? '',
    'telefono' => $_POST['telefono'] ?? '',
    'motivo' => $_POST['motivo'] ?? '',
    'ayuda' => $_POST['ayuda'] ?? '',
    'tieneCliente' => isset($_POST['tieneCliente']) ? 'Sí' : 'No',
    'pinCliente' => $_POST['pinCliente'] ?? '',
    'recomendado' => $_POST['recomendado'] ?? '',
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];

// Validar campos requeridos
$errores = [];
if (empty($datos['nombre'])) $errores[] = 'El nombre es requerido';
if (empty($datos['email'])) $errores[] = 'El email es requerido';
if (empty($datos['motivo'])) $errores[] = 'El motivo es requerido';
if (empty($datos['ayuda'])) $errores[] = 'El campo ayuda es requerido';

if (!empty($errores)) {
    echo json_encode([
        'success' => false,
        'message' => 'Por favor completa todos los campos requeridos',
        'errores' => $errores
    ]);
    exit;
}

// Guardar en archivo CSV como respaldo
$csvFile = __DIR__ . '/../data/contactos-backup.csv';
if (!file_exists(__DIR__ . '/../data')) {
    mkdir(__DIR__ . '/../data', 0755, true);
}

if (!file_exists($csvFile)) {
    file_put_contents($csvFile, "Fecha,Nombre,Email,Teléfono,Motivo,Ayuda,Tiene Cliente,PIN,Recomendado,IP\n");
}

$csvLine = sprintf(
    "%s,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%s\n",
    $datos['timestamp'],
    str_replace('"', '""', $datos['nombre']),
    str_replace('"', '""', $datos['email']),
    str_replace('"', '""', $datos['telefono']),
    str_replace('"', '""', $datos['motivo']),
    str_replace('"', '""', $datos['ayuda']),
    str_replace('"', '""', $datos['tieneCliente']),
    str_replace('"', '""', $datos['pinCliente']),
    str_replace('"', '""', $datos['recomendado']),
    $datos['ip']
);

$csvSuccess = file_put_contents($csvFile, $csvLine, FILE_APPEND) !== false;

// Devolver datos para que EmailJS (cliente) procese el envío
echo json_encode([
    'success' => true,
    'message' => 'Procesando envío...',
    'datos' => $datos,
    'csv_backup' => $csvSuccess,
    'emailjs_config' => [
        'service_id' => 'service_123456', // Reemplazar con tu Service ID de EmailJS
        'template_id' => 'template_789012', // Reemplazar con tu Template ID de EmailJS
        'user_id' => 'user_abcdef' // Reemplazar con tu User ID de EmailJS
    ]
]);
?>