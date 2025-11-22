<?php
/**
 * Script para probar el envío de emails
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🧪 Prueba de Envío de Email</h1>";

// Verificar si la función mail() está disponible
if (!function_exists('mail')) {
    echo "<p style='color: red;'>❌ La función mail() no está disponible en este servidor</p>";
    echo "<p>Posibles soluciones:</p>";
    echo "<ul>";
    echo "<li>Contacta con tu proveedor de hosting para habilitar la función mail()</li>";
    echo "<li>Configura SMTP externo ( Gmail, Outlook, etc.)</li>";
    echo "<li>Usa una librería como PHPMailer</li>";
    echo "</ul>";
    exit;
}

echo "<p>✅ La función mail() está disponible</p>";

// Probar envío simple
$to = 'maykasunshineteam@gmail.com';
$subject = 'Prueba de email desde LifePlus PDF';
$message = 'Este es un mensaje de prueba para verificar que el envío de emails funciona correctamente.';
$headers = 'From: noreply@lifepluspdf.peterestela.com' . "\r\n" .
           'Reply-To: noreply@lifepluspdf.peterestela.com' . "\r\n" .
           'X-Mailer: PHP/' . phpversion();

echo "<p>📤 Enviando email de prueba a: $to</p>";

if (mail($to, $subject, $message, $headers)) {
    echo "<p style='color: green;'>✅ Email enviado correctamente</p>";
    echo "<p>Revisa tu bandeja de entrada (y carpeta de spam) en maykasunshineteam@gmail.com</p>";
} else {
    echo "<p style='color: red;'>❌ Error al enviar email</p>";
    echo "<p>Posibles causas:</p>";
    echo "<ul>";
    echo "<li>El servidor requiere autenticación SMTP</li>";
    echo "<li>El hosting ha bloqueado la función mail()</li>";
    echo "<li>Problemas de configuración del servidor</li>";
    echo "<li>Filtros anti-spam bloqueando el envío</li>";
    echo "</ul>";

    // Mostrar información del servidor
    echo "<h3>Información del servidor:</h3>";
    echo "<p>PHP Version: " . phpversion() . "</p>";
    echo "<p>Server: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";

    if (ini_get('sendmail_path')) {
        echo "<p>Sendmail path: " . ini_get('sendmail_path') . "</p>";
    }

    if (ini_get('SMTP')) {
        echo "<p>SMTP: " . ini_get('SMTP') . "</p>";
        echo "<p>smtp_port: " . ini_get('smtp_port') . "</p>";
    }
}

echo "<p><a href='/'>Volver al inicio</a></p>";
?>