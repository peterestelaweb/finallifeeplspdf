<?php
/**
 * DIAGNÓSTICO COMPLETO DEL SISTEMA DE EMAILS
 * Vamos a encontrar exactamente qué está fallando
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== DIAGNÓSTICO COMPLETO EMAIL ===\n\n";

// 1. Verificar configuración básica del servidor
echo "📋 INFORMACIÓN DEL SERVIDOR:\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Sistema Operativo: " . PHP_OS . "\n";
echo "Servidor Web: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "\n";
echo "IP del Servidor: " . ($_SERVER['SERVER_ADDR'] ?? 'Unknown') . "\n";
echo "Fecha/Hora: " . date('Y-m-d H:i:s') . "\n\n";

// 2. Verificar función mail()
echo "🔧 FUNCIÓN MAIL():\n";
if (function_exists('mail')) {
    echo "✅ Función mail() está disponible\n";

    // Test básico de mail()
    $test_to = 'maykasunshineteam@gmail.com';
    $test_subject = 'TEST DIAGNÓSTICO - ' . date('H:i:s');
    $test_message = "Este es un mensaje de prueba diagnóstico.\n\nFecha: " . date('Y-m-d H:i:s') . "\nServidor: " . $_SERVER['HTTP_HOST'] ?? 'Unknown';
    $test_headers = "From: test@lifepluspdf.peterestela.com\r\n";
    $test_headers .= "Reply-To: test@example.com\r\n";
    $test_headers .= "X-Mailer: PHP/" . phpversion();

    echo "📤 Enviando test mail a $test_to...\n";

    // Forzar output de errores
    $old_error_reporting = error_reporting(E_ALL);
    ini_set('display_errors', 1);

    $result = @mail($test_to, $test_subject, $test_message, $test_headers);

    if ($result) {
        echo "✅ Test mail enviado exitosamente\n";
    } else {
        echo "❌ Test mail FALLÓ\n";
        $error = error_get_last();
        if ($error) {
            echo "Error PHP: " . $error['message'] . "\n";
        }
    }

    error_reporting($old_error_reporting);

} else {
    echo "❌ Función mail() NO está disponible\n";
}

echo "\n";

// 3. Verificar configuración de email
echo "⚙️  CONFIGURACIÓN EMAIL:\n";
echo "sendmail_path: " . ini_get('sendmail_path') . "\n";
echo "sendmail_from: " . ini_get('sendmail_from') . "\n";
echo "SMTP: " . ini_get('SMTP') . "\n";
echo "smtp_port: " . ini_get('smtp_port') . "\n";
echo "mail.add_x_header: " . ini_get('mail.add_x_header') . "\n";
echo "mail.log: " . ini_get('mail.log') . "\n\n";

// 4. Verificar permisos y rutas
echo "📁 PERMISOS Y RUTAS:\n";
echo "Directorio actual: " . __DIR__ . "\n";
echo "Directorio padre: " . dirname(__DIR__) . "\n";
echo "Permisos directorio actual: " . substr(sprintf('%o', fileperms(__DIR__)), -4) . "\n";

// Verificar si podemos escribir archivos
$test_file = __DIR__ . '/test-write-' . time() . '.txt';
if (file_put_contents($test_file, 'test')) {
    echo "✅ Tenemos permisos de escritura\n";
    unlink($test_file);
} else {
    echo "❌ No tenemos permisos de escritura\n";
}

echo "\n";

// 5. Verificar si el formulario ha sido llamado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "📬 DATOS RECIBIDOS DEL FORMULARIO:\n";
    echo "Método: " . $_SERVER['REQUEST_METHOD'] . "\n";
    echo "Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'Unknown') . "\n";

    echo "\nVariables POST recibidas:\n";
    foreach ($_POST as $key => $value) {
        echo "  $key: $value\n";
    }

    echo "\nIntentando enviar email con datos del formulario...\n";

    // Usar los datos del formulario
    $nombre = $_POST['nombre'] ?? 'Test desde diagnóstico';
    $email = $_POST['email'] ?? 'test@example.com';
    $motivo = $_POST['motivo'] ?? 'Diagnóstico';
    $ayuda = $_POST['ayuda'] ?? 'Mensaje de prueba desde diagnóstico';

    $destinatario = 'maykasunshineteam@gmail.com';
    $asunto = 'FORMULARIO REAL - ' . date('H:i:s') . " - $nombre";

    $mensaje = "📋 Información del Contacto (DIAGNÓSTICO REAL)

Fecha: " . date('d/m/Y H:i:s') . "
Nombre: $nombre
Email: $email
Motivo: $motivo

Ayuda: $ayuda

---
Enviado desde DIAGNÓSTICO
IP: " . $_SERVER['REMOTE_ADDR'] . "
Servidor: " . ($_SERVER['HTTP_HOST'] ?? 'Unknown');

    $headers = "From: \"$nombre\" <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    $headers .= "X-Priority: 1\r\n"; // Alta prioridad

    echo "Destinatario: $destinatario\n";
    echo "Asunto: $asunto\n";
    echo "Longitud mensaje: " . strlen($mensaje) . " bytes\n";
    echo "Headers: $headers\n\n";

    // Intentar enviar
    $resultado = @mail($destinatario, $asunto, $mensaje, $headers);

    if ($resultado) {
        echo "✅ EMAIL DEL FORMULARIO ENVIADO EXITOSAMENTE\n";
        echo "Revisa inmediatamente maykasunshineteam@gmail.com\n";
    } else {
        echo "❌ EMAIL DEL FORMULARIO FALLÓ\n";
        $error = error_get_last();
        if ($error) {
            echo "Error: " . $error['message'] . "\n";
        }
    }

} else {
    echo "📬 ESTADO FORMULARIO:\n";
    echo "Método: " . $_SERVER['REQUEST_METHOD'] . " (esperando POST)\n";
    echo "Para probar el formulario completo, haz POST a este archivo\n";
    echo "o abre: test-form-diagnostico.html\n";
}

echo "\n";

// 6. Sugerencias y soluciones
echo "💡 SOLUCIONES POSIBLES:\n";
echo "1. Si mail() funciona pero no llegan emails:\n";
echo "   - Revisa carpeta SPAM de maykasunshineteam@gmail.com\n";
echo "   - El servidor puede estar en lista negra\n";
echo "   - Prueba con otro destinatario\n\n";

echo "2. Si mail() no funciona:\n";
echo "   - El servidor no tiene configurado sendmail\n";
echo "   - Necesita configuración SMTP\n";
echo "   - Usa servicio externo (SendGrid, Mailgun)\n\n";

echo "3. Verificar logs del servidor:\n";
echo "   - /var/log/mail.log\n";
echo "   - /var/log/maillog\n";
echo "   - Logs del hosting\n\n";

echo "=== FIN DEL DIAGNÓSTICO ===\n";
?>