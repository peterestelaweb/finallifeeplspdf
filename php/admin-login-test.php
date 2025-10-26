<?php
/**
 * Versión de prueba simplificada para solucionar problema de login
 */

session_start();

// Configuración
$password = 'LifePlus2025@Admin';

// Procesar login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($_POST['password'] === $password) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['login_time'] = time();

        // Redirigir al panel principal
        header('Location: admin-indexer.php');
        exit;
    } else {
        $error = 'Contraseña incorrecta';
    }
}

// Si ya está logueado, redirigir
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: admin-indexer.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Admin - Login</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #333; margin: 0; font-size: 24px; }
        .logo p { color: #666; margin: 5px 0 0 0; font-size: 14px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
        input[type="password"] { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 16px; transition: border-color 0.3s; box-sizing: border-box; }
        input[type="password"]:focus { outline: none; border-color: #667eea; }
        .btn { width: 100%; background: #667eea; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; transition: background 0.3s; box-sizing: border-box; }
        .btn:hover { background: #5a6fd8; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #f5c6cb; }
        .debug { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px; font-size: 12px; color: #666; }
        .security-notice { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #28a745; }
        .security-notice h4 { color: #28a745; margin: 0 0 5px 0; font-size: 14px; }
        .security-notice p { color: #666; margin: 0; font-size: 12px; line-height: 1.4; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>🔐 Panel Admin</h1>
            <p>Sistema de Indexación de PDFs</p>
        </div>

        <?php if (isset($error)): ?>
            <div class="error">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <label for="password">Contraseña de Administrador:</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn">Acceder</button>
        </form>

        <div class="security-notice">
            <h4>🛡️ Zona Segura</h4>
            <p>Esta área está restringida al administrador. Versión de prueba simplificada.</p>
        </div>

        <div class="debug">
            <strong>Información de depuración:</strong><br>
            • Método: <?php echo $_SERVER['REQUEST_METHOD']; ?><br>
            • Tiempo: <?php echo date('Y-m-d H:i:s'); ?><br>
            • Sesión: <?php echo session_id(); ?><br>
            • IP: <?php echo $_SERVER['REMOTE_ADDR']; ?>
        </div>
    </div>
</body>
</html>