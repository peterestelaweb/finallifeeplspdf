<?php
// Script de diagnóstico simple para probar PHP mail()
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

try {
    $destinatario = 'maykasunshineteam@gmail.com';
    $asunto = '🧪 TEST DIAGNÓSTICO - ' . date('d/m/Y H:i:s');

    $mensaje = "
    <html>
    <body style='font-family: Arial, sans-serif;'>
        <h2>🧪 TEST DE DIAGNÓSTICO PHP MAIL()</h2>
        <p><strong>Fecha:</strong> " . date('d/m/Y H:i:s') . "</p>
        <p><strong>Servidor:</strong> " . $_SERVER['HTTP_HOST'] . "</p>
        <p><strong>PHP Version:</strong> " . phpversion() . "</p>
        <p><strong>IP:</strong> " . $_SERVER['REMOTE_ADDR'] . "</p>
        <hr>
        <p>Este es un test de diagnóstico para verificar que PHP mail() funciona.</p>
    </body>
    </html>";

    $headers = "From: test@lifepluspdf.peterestela.com\r\n";
    $headers .= "Reply-To: test@lifepluspdf.peterestela.com\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    $enviado = mail($destinatario, $asunto, $mensaje, $headers);

    if ($enviado) {
        echo json_encode([
            'success' => true,
            'message' => '✅ Email enviado correctamente. Revisa maykasunshineteam@gmail.com',
            'php_version' => phpversion(),
            'mail_function' => 'Available and working'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => '❌ Error al enviar email con PHP mail()',
            'php_version' => phpversion(),
            'mail_function' => 'Available but failed',
            'error' => error_get_last()
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>