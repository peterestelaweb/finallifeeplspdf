<?php
/**
 * Script para enviar datos del formulario de contacto a Google Sheets API
 * Opción 2: Google Sheets API (más potente)
 */

header('Content-Type: application/json');

// Configuración de Google Sheets API
// NECESITAS CONFIGURAR ESTO EN GOOGLE CLOUD CONSOLE:
$config = [
    'spreadsheet_id' => 'TU_SPREADSHEET_ID_AQUI',
    'sheet_name' => 'Contactos',
    'service_account_json' => __DIR__ . '/../google-service-account.json'
];

// Función para sanitizar datos
function sanitizar($dato) {
    $dato = trim($dato);
    $dato = stripslashes($dato);
    $dato = htmlspecialchars($dato);
    return $dato;
}

// Función para enviar a Google Sheets API
function enviarAGoogleSheetsAPI($datos, $config) {
    // Verificar si existe el archivo de credenciales
    if (!file_exists($config['service_account_json'])) {
        return false;
    }

    // Cargar credenciales
    $credentials = json_decode(file_get_contents($config['service_account_json']), true);
    if (!$credentials) {
        return false;
    }

    // Preparar datos para Google Sheets
    $values = [
        [
            $datos['timestamp'],
            $datos['nombre'],
            $datos['email'],
            $datos['telefono'],
            $datos['motivo'],
            $datos['pregunta'],
            $datos['tieneCliente'],
            $datos['pinCliente'],
            $datos['recomendado'],
            $datos['ayuda'],
            $datos['ip']
        ]
    ];

    $body = new Google_Service_Sheets_ValueRange([
        'values' => $values
    ]);

    $range = "{$config['sheet_name']}!A:K"; // Columnas A a K

    // Usar Google Client Library (requiere instalación)
    // Esta es la implementación básica, necesitarás instalar:
    // composer require google/apiclient:^2.0

    // Por ahora, usamos un respaldo local
    return false;
}

try {
    // Verificar método de solicitud
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Recibir y sanitizar datos
    $datos = [
        'nombre' => sanitizar($_POST['nombre'] ?? ''),
        'email' => sanitizar($_POST['email'] ?? ''),
        'telefono' => sanitizar($_POST['telefono'] ?? ''),
        'motivo' => sanitizar($_POST['motivo'] ?? ''),
        'pregunta' => sanitizar($_POST['pregunta'] ?? ''),
        'tieneCliente' => isset($_POST['tieneCliente']) ? 'Sí' : 'No',
        'pinCliente' => sanitizar($_POST['pinCliente'] ?? ''),
        'recomendado' => sanitizar($_POST['recomendado'] ?? ''),
        'ayuda' => sanitizar($_POST['ayuda'] ?? ''),
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR']
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

    // Intentar enviar a Google Sheets API
    $googleSheetsSuccess = false;
    if ($config['spreadsheet_id'] !== 'TU_SPREADSHEET_ID_AQUI') {
        $googleSheetsSuccess = enviarAGoogleSheetsAPI($datos, $config);
    }

    // Crear archivo CSV para importación manual a Google Sheets
    $csvFile = __DIR__ . '/../data/contactos.csv';
    $csvHeader = "Fecha,Nombre,Email,Teléfono,Motivo,Pregunta,Tiene Cliente,PIN,Recomendado,Ayuda,IP\n";

    if (!file_exists(__DIR__ . '/../data')) {
        mkdir(__DIR__ . '/../data', 0755, true);
    }

    // Si no existe el archivo, escribir el header
    if (!file_exists($csvFile)) {
        file_put_contents($csvFile, $csvHeader);
    }

    // Escribir datos en CSV
    $csvLine = sprintf(
        "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
        $datos['timestamp'],
        '"' . str_replace('"', '""', $datos['nombre']) . '"',
        '"' . str_replace('"', '""', $datos['email']) . '"',
        '"' . str_replace('"', '""', $datos['telefono']) . '"',
        '"' . str_replace('"', '""', $datos['motivo']) . '"',
        '"' . str_replace('"', '""', $datos['pregunta']) . '"',
        '"' . str_replace('"', '""', $datos['tieneCliente']) . '"',
        '"' . str_replace('"', '""', $datos['pinCliente']) . '"',
        '"' . str_replace('"', '""', $datos['recomendado']) . '"',
        '"' . str_replace('"', '""', $datos['ayuda']) . '"',
        $datos['ip']
    );

    $csvSuccess = file_put_contents($csvFile, $csvLine, FILE_APPEND) !== false;

    // Respuesta
    if ($googleSheetsSuccess) {
        echo json_encode([
            'success' => true,
            'message' => '¡Mensaje enviado con éxito a Google Sheets! Te contactaremos pronto.',
            'metodo' => 'google_sheets_api',
            'debug' => [
                'google_sheets' => $googleSheetsSuccess,
                'csv_backup' => $csvSuccess
            ]
        ]);
    } elseif ($csvSuccess) {
        echo json_encode([
            'success' => true,
            'message' => 'Mensaje guardado en CSV. Puedes importarlo a Google Sheets manualmente.',
            'metodo' => 'csv_backup',
            'debug' => [
                'google_sheets' => $googleSheetsSuccess,
                'csv_backup' => $csvSuccess,
                'nota' => 'El archivo CSV está en /data/contactos.csv'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar el mensaje. Por favor, intenta más tarde.',
            'debug' => [
                'google_sheets' => $googleSheetsSuccess,
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