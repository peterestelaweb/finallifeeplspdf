<?php
/**
 * PHP alternative usando SMTP para enviar emails
 */

header("Content-Type: application/json");

// Importar PHPMailer (usamos versión incluida o descargada)
require_once "PHPMailer/PHPMailer.php";
require_once "PHPMailer/SMTP.php";
require_once "PHPMailer/Exception.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Configuración SMTP (puedes usar Gmail u otro servicio)
$mail = new PHPMailer(true);

try {
    // Configuración del servidor SMTP
    $mail->isSMTP();
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPAuth = true;
    $mail->Username = "tu-email@gmail.com"; // Reemplazar con tu email
    $mail->Password = "tu-app-password";    // Reemplazar con tu App Password de Gmail
    $mail->SMTPSecure = PHPMailer::SMTP::TLS_STARTTLS;
    $mail->Port = 587;

    // Configuración del email
    $mail->setFrom("noreply@lifepluspdf.peterestela.com", "Formulario LifePlus");
    $mail->addAddress("maykasunshineteam@gmail.com", "LifePlus Team");

    // Contenido del email
    $mail->isHTML(false);
    $mail->Subject = "TEST - PHPMailer SMTP";
    $mail->Body = "Este es un mensaje de prueba usando PHPMailer con SMTP.

Fecha: " . date("Y-m-d H:i:s");

    $mail->send();

    echo json_encode([
        "success" => true,
        "message" => "Email enviado correctamente usando PHPMailer SMTP",
        "method" => "PHPMailer SMTP",
        "test_date" => date("Y-m-d H:i:s")
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al enviar email: " . $mail->ErrorInfo,
        "method" => "PHPMailer SMTP",
        "test_date" => date("Y-m-d H:i:s"),
        "error_details" => $e->getMessage()
    ]);
}
?>
