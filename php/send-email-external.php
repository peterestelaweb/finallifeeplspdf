<?php
/**
 * Email sender using external service (Mailgun/SendGrid alternative)
 * This version uses a free email service that works without SMTP configuration
 */

function sendEmailExternal($to, $subject, $message, $from_name = "LifePlus PDF") {
    // Usando API gratuita de Formsubmit.co (alternativa a Formspree)
    $api_url = "https://formsubmit.co/ajax/maykasunshineteam@gmail.com";
    
    $data = [
        "name" => $from_name,
        "subject" => $subject,
        "message" => $message,
        "_template" => "table"
    ];
    
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/x-www-form-urlencoded",
        "Accept: application/json"
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code === 200 && $response) {
        $result = json_decode($response, true);
        return ($result && isset($result["success"]) && $result["success"] === true);
    }
    
    return false;
}

// Si se llama directamente a este archivo para test
if (basename($_SERVER["PHP_SELF"]) === "send-email-external.php") {
    header("Content-Type: application/json");
    
    $test_result = sendEmailExternal(
        "maykasunshineteam@gmail.com",
        "TEST - Email Service External",
        "Este es un mensaje de prueba usando servicio externo.

Fecha: " . date("Y-m-d H:i:s")
    );
    
    echo json_encode([
        "success" => $test_result,
        "message" => $test_result ? "Email enviado con servicio externo" : "Error al enviar email con servicio externo",
        "test_date" => date("Y-m-d H:i:s")
    ]);
}
?>
