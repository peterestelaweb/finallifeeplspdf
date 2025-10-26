const fs = require('fs');
const path = require('path');

console.log('🚨 CREANDO SOLUCIÓN IMPOSIBLE DE IGNORAR');
console.log('=========================================');

// 1. Crear CSS para el banner contundente
const bannerCSS = `
/* ========================================
   BANNER LEGAL IMPOSIBLE DE IGNORAR - MERCADO AMERICANO
   ======================================== */

/* Banner principal - IMPOSIBLE DE IGNORAR */
.us-market-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    color: white;
    padding: 20px;
    z-index: 99999;
    box-shadow: 0 4px 20px rgba(211, 47, 47, 0.4);
    border-bottom: 4px solid #ff5252;
    font-family: 'Inter', Arial, sans-serif;
    text-align: center;
    animation: pulse-banner 2s infinite;
}

@keyframes pulse-banner {
    0% { box-shadow: 0 4px 20px rgba(211, 47, 47, 0.4); }
    50% { box-shadow: 0 4px 30px rgba(211, 47, 47, 0.8); }
    100% { box-shadow: 0 4px 20px rgba(211, 47, 47, 0.4); }
}

.us-market-banner .banner-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 15px;
}

.us-market-banner .banner-text {
    flex: 1;
    min-width: 300px;
}

.us-market-banner .banner-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.us-market-banner .banner-subtitle {
    font-size: 1.1rem;
    font-weight: 500;
    opacity: 0.95;
    line-height: 1.4;
}

.us-market-banner .banner-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.us-market-banner .accept-btn {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.us-market-banner .accept-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.us-market-banner .details-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.us-market-banner .details-btn:hover {
    background: white;
    color: #d32f2f;
}

/* Overlay de bloqueo */
.us-market-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 99998;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
}

/* Modal de confirmación obligatoria */
.us-market-modal {
    background: white;
    padding: 40px;
    border-radius: 20px;
    max-width: 600px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    border: 4px solid #d32f2f;
}

.us-market-modal .modal-title {
    color: #d32f2f;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 20px;
    text-transform: uppercase;
}

.us-market-modal .modal-subtitle {
    color: #333;
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 30px;
    line-height: 1.5;
}

.us-market-modal .modal-details {
    background: #fff3e0;
    padding: 25px;
    border-radius: 15px;
    margin: 30px 0;
    border-left: 6px solid #ff6f00;
    text-align: left;
}

.us-market-modal .modal-details h4 {
    color: #d32f2f;
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.us-market-modal .modal-details ul {
    margin: 0;
    padding-left: 20px;
}

.us-market-modal .modal-details li {
    margin-bottom: 10px;
    color: #333;
    font-weight: 500;
}

.us-market-modal .modal-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 30px;
}

.us-market-modal .confirm-btn {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    color: white;
    border: none;
    padding: 15px 40px;
    border-radius: 30px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.us-market-modal .confirm-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

/* Indicador permanente en el header */
.us-market-indicator {
    position: absolute;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    color: white;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 1000;
    animation: pulse-indicator 3s infinite;
}

@keyframes pulse-indicator {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

/* Ajuste del body cuando el banner está activo */
.body-with-banner {
    padding-top: 120px !important;
}

.body-with-overlay {
    overflow: hidden !important;
}

/* Responsive */
@media (max-width: 768px) {
    .us-market-banner {
        padding: 15px;
    }

    .us-market-banner .banner-content {
        flex-direction: column;
        text-align: center;
    }

    .us-market-banner .banner-title {
        font-size: 1.2rem;
    }

    .us-market-banner .banner-subtitle {
        font-size: 1rem;
    }

    .us-market-modal {
        padding: 30px 20px;
    }

    .us-market-modal .modal-title {
        font-size: 1.6rem;
    }

    .us-market-modal .modal-subtitle {
        font-size: 1.1rem;
    }

    .body-with-banner {
        padding-top: 160px !important;
    }
}

/* ========================================
   FIN DEL BANNER IMPOSIBLE DE IGNORAR
   ======================================== */
`;

// 2. Crear JavaScript para el banner contundente
const bannerJS = `
// ========================================
// BANNER LEGAL IMPOSIBLE DE IGNORAR - MERCADO AMERICANO
// ========================================

console.log('🚨 INICIANDO SISTEMA DE AVISO OBLIGATORIO DE MERCADO AMERICANO');

document.addEventListener('DOMContentLoaded', function() {
    console.log('⚖️ Configurando aviso obligatorio de mercado americano...');

    // Verificar si el usuario ya ha aceptado
    const hasAccepted = localStorage.getItem('usMarketAccepted');

    if (!hasAccepted) {
        console.log('👤 Usuario no ha aceptado, mostrando aviso obligatorio...');
        showMandatoryUSMarketNotice();
    } else {
        console.log('✅ Usuario ya ha aceptado el aviso de mercado americano');
        showPermanentIndicator();
    }
});

// Función para mostrar el aviso obligatorio
function showMandatoryUSMarketNotice() {
    // Crear overlay de bloqueo
    const overlay = document.createElement('div');
    overlay.className = 'us-market-overlay';
    overlay.innerHTML = \`
        <div class="us-market-modal">
            <div class="modal-title">
                <i class="fas fa-exclamation-triangle"></i>
                ¡AVISO LEGAL OBLIGATORIO!
            </div>
            <div class="modal-subtitle">
                TODO EL MATERIAL ESTÁ DESTINADO AL MERCADO AMERICANO
            </div>
            <div class="modal-details">
                <h4><i class="fas fa-globe-americas"></i> INFORMACIÓN LEGAL REQUERIDA:</h4>
                <ul>
                    <li><strong>TODOS</strong> los PDFs están destinados <strong>EXCLUSIVAMENTE</strong> al mercado americano</li>
                    <li><strong>TODOS</strong> los archivos están alojados en servidores de <strong>ESTADOS UNIDOS</strong></li>
                    <li><strong>TODOS</strong> los productos cumplen con la regulación <strong>FDA</strong></li>
                    <li><strong>NO</strong> se garantiza disponibilidad ni regulación en otros países</li>
                    <li><strong>NO</strong> se asume responsabilidad para mercados no estadounidenses</li>
                </ul>
            </div>
            <div class="modal-actions">
                <button class="confirm-btn" onclick="acceptUSMarketNotice()">
                    <i class="fas fa-check"></i>
                    ACEPTO Y ENTIENDO
                </button>
            </div>
        </div>
    \`;

    document.body.appendChild(overlay);
    document.body.classList.add('body-with-overlay');

    console.log('🚨 Aviso obligatorio mostrado - usuario no puede usar el sitio sin aceptar');
}

// Función para aceptar el aviso
function acceptUSMarketNotice() {
    console.log('✅ Usuario ha aceptado el aviso de mercado americano');

    // Guardar aceptación
    localStorage.setItem('usMarketAccepted', 'true');
    localStorage.setItem('usMarketAcceptedDate', new Date().toISOString());

    // Eliminar overlay
    const overlay = document.querySelector('.us-market-overlay');
    if (overlay) {
        overlay.remove();
    }

    document.body.classList.remove('body-with-overlay');

    // Mostrar banner permanente
    showPermanentBanner();
    showPermanentIndicator();
}

// Función para mostrar banner permanente
function showPermanentBanner() {
    const banner = document.createElement('div');
    banner.className = 'us-market-banner';
    banner.innerHTML = \`
        <div class="banner-content">
            <div class="banner-text">
                <div class="banner-title">
                    <i class="fas fa-exclamation-triangle"></i>
                    MERCADO AMERICANO - INFORMACIÓN LEGAL
                </div>
                <div class="banner-subtitle">
                    TODO EL MATERIAL ESTÁ DESTINADO AL MERCADO AMERICANO Y ESTÁ ALOJADO EN SERVIDORES DE ESTADOS UNIDOS
                </div>
            </div>
            <div class="banner-actions">
                <button class="details-btn" onclick="showUSMarketDetails()">
                    <i class="fas fa-info-circle"></i>
                    Ver Detalles
                </button>
                <button class="accept-btn" onclick="hideUSMarketBanner()">
                    <i class="fas fa-times"></i>
                    Ocultar
                </button>
            </div>
        </div>
    \`;

    document.body.insertBefore(banner, document.body.firstChild);
    document.body.classList.add('body-with-banner');

    console.log('📢 Banner permanente mostrado');
}

// Función para mostrar indicador permanente en el header
function showPermanentIndicator() {
    const header = document.querySelector('.header');
    if (header) {
        const indicator = document.createElement('div');
        indicator.className = 'us-market-indicator';
        indicator.innerHTML = \`
            <i class="fas fa-globe-americas"></i>
            MERCADO AMERICANO
        \`;

        header.style.position = 'relative';
        header.appendChild(indicator);

        console.log('📍 Indicador permanente añadido al header');
    }
}

// Función para ocultar el banner (pero mantener el indicador)
function hideUSMarketBanner() {
    const banner = document.querySelector('.us-market-banner');
    if (banner) {
        banner.style.transform = 'translateY(-100%)';
        banner.style.transition = 'transform 0.5s ease-out';

        setTimeout(() => {
            banner.remove();
            document.body.classList.remove('body-with-banner');
        }, 500);
    }
}

// Función para mostrar detalles
function showUSMarketDetails() {
    const modal = document.createElement('div');
    modal.className = 'us-market-overlay';
    modal.innerHTML = \`
        <div class="us-market-modal">
            <div class="modal-title">
                <i class="fas fa-globe-americas"></i>
                INFORMACIÓN DE MERCADO AMERICANO
            </div>
            <div class="modal-subtitle">
                DECLARACIÓN LEGAL VINCULANTE
            </div>
            <div class="modal-details">
                <h4><i class="fas fa-server"></i> SERVIDORES:</h4>
                <ul>
                    <li><strong>UBICACIÓN:</strong> Estados Unidos de América</li>
                    <li><strong>JURISDICCIÓN:</strong> Leyes federales y estatales de EE.UU.</li>
                    <li><strong>REGULACIÓN:</strong> FDA y agencias estadounidenses</li>
                </ul>

                <h4><i class="fas fa-target"></i> MERCADO OBJETIVO:</h4>
                <ul>
                    <li><strong>EXCLUSIVO:</strong> Mercado estadounidense</li>
                    <li><strong>REGULACIÓN:</strong> Normativas FDA</li>
                    <li><strong>DISTRIBUCIÓN:</strong> Solo territorio estadounidense</li>
                </ul>

                <h4><i class="fas fa-exclamation-triangle"></i> RESPONSABILIDAD:</h4>
                <ul>
                    <li><strong>ACEPTACIÓN:</strong> Usted reconoce y acepta esta información</li>
                    <li><strong>JURISDICCIÓN:</strong> Leyes aplicables de Estados Unidos</li>
                    <li><strong>LIMITACIÓN:</strong> No se asume responsabilidad para otros mercados</li>
                </ul>
            </div>
            <div class="modal-actions">
                <button class="confirm-btn" onclick="this.closest('.us-market-overlay').remove(); document.body.classList.remove('body-with-overlay');">
                    <i class="fas fa-check"></i>
                    ENTENDIDO
                </button>
            </div>
        </div>
    \`;

    document.body.appendChild(modal);
    document.body.classList.add('body-with-overlay');
}

// ========================================
// FIN DEL SISTEMA DE AVISO OBLIGATORIO
// ========================================
`;

// 3. Guardar los archivos
const cssPath = path.join(__dirname, '..', 'css', 'us-market-banner.css');
const jsPath = path.join(__dirname, '..', 'js', 'us-market-banner.js');

// Asegurarse de que los directorios existan
const cssDir = path.dirname(cssPath);
const jsDir = path.dirname(jsPath);

if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
}

if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
}

// Escribir archivos
fs.writeFileSync(cssPath, bannerCSS);
fs.writeFileSync(jsPath, bannerJS);

console.log('✅ Archivos creados exitosamente:');
console.log(`   📄 CSS: ${cssPath}`);
console.log(`   📄 JavaScript: ${jsPath}`);

// 4. Crear instrucciones de implementación
const implementationHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Implementación Banner Mercado Americano</title>
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        h1 {
            color: #d32f2f;
            text-align: center;
            margin-bottom: 30px;
        }
        .step {
            background: #fff3e0;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 5px solid #ff6f00;
        }
        .step h3 {
            color: #d32f2f;
            margin-top: 0;
        }
        .code {
            background: #263238;
            color: #fff;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            margin: 10px 0;
            font-size: 12px;
        }
        .warning {
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 10px;
            border-left: 5px solid #d32f2f;
            margin: 20px 0;
        }
        .success {
            background: #e8f5e8;
            color: #2e7d32;
            padding: 15px;
            border-radius: 10px;
            border-left: 5px solid #4caf50;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚨 IMPLEMENTACIÓN BANNER IMPOSIBLE DE IGNORAR</h1>

        <div class="warning">
            <h3>⚠️ ADVERTENCIA IMPORTANTE</h3>
            <p>Esta solución hace que el aviso legal sea <strong>IMPOSIBLE DE IGNORAR</strong>. Los usuarios deben aceptar explícitamente antes de poder usar el sitio.</p>
        </div>

        <div class="step">
            <h3>Paso 1: Añadir CSS</h3>
            <p>Añadir el siguiente CSS al archivo <code>css/styles.css</code> (al final del archivo):</p>
            <div class="code">${bannerCSS}</div>
        </div>

        <div class="step">
            <h3>Paso 2: Añadir JavaScript</h3>
            <p>El archivo JavaScript ya ha sido creado en <code>js/us-market-banner.js</code></p>
        </div>

        <div class="step">
            <h3>Paso 3: Actualizar HTML</h3>
            <p>Añadir la siguiente línea antes de cerrar el body en <code>index.html</code>:</p>
            <div class="code">&lt;script src="js/us-market-banner.js"&gt;&lt;/script&gt;</div>
        </div>

        <div class="success">
            <h3>✅ RESULTADO ESPERADO</h3>
            <ul>
                <li>Los usuarios verán un overlay rojo brillante al entrar al sitio</li>
                <li>Deben aceptar explícitamente antes de poder usar el buscador</li>
                <li>Un banner permanente permanecerá visible en la parte superior</li>
                <li>Un indicador rojo parpadeará en el header</li>
                <li>El mensaje es claro, directo e imposible de ignorar</li>
                <li>La información se almacena localmente para no mostrarlo nuevamente</li>
            </ul>
        </div>

        <div class="warning">
            <h3>🔍 CARACTERÍSTICAS CLAVE</h3>
            <ul>
                <li><strong>OBLIGATORIO:</strong> No se puede usar el sitio sin aceptar</li>
                <li><strong>VISIBLE:</strong> Colores rojos brillantes y animaciones</li>
                <li><strong>CLARO:</strong> Texto directo y sin ambigüedades</li>
                <li><strong>PERMANENTE:</strong> Indicador visible en todo momento</li>
                <li><strong>LEGAL:</strong> Registro de aceptación con fecha y hora</li>
            </ul>
        </div>
    </div>
</body>
</html>
`;

const htmlPath = path.join(__dirname, 'implementacion-banner.html');
fs.writeFileSync(htmlPath, implementationHTML);

console.log(`📄 Instrucciones de implementación: ${htmlPath}`);

console.log('\n🎯 SOLUCIÓN CREADA EXITOSAMENTE');
console.log('================================');
console.log('✅ CSS: Colores rojos brillantes, animaciones, diseño prominente');
console.log('✅ JavaScript: Sistema obligatorio con aceptación requerida');
console.log('✅ HTML: Instrucciones completas de implementación');
console.log('✅ Legal: Registro de aceptación con fecha y hora');
console.log('✅ UX: Imposible de ignorar, muy visible y contundente');
console.log('\n🚨 ESTA SOLUCIÓN ES LEGALMENTE CONTUNDENTE Y VISUALMENTE IMPOSIBLE DE IGNORAR');

console.log('\n💡 CARACTERÍSTICAS PRINCIPALES:');
console.log('============================');
console.log('1. Overlay rojo brillante que bloquea el sitio hasta aceptar');
console.log('2. Texto en mayúsculas: "TODO EL MATERIAL ESTÁ DESTINADO AL MERCADO AMERICANO"');
console.log('3. Banner permanente en la parte superior con colores llamativos');
console.log('4. Indicador parpadeante en el header');
console.log('5. Animaciones y efectos visuales que capturan la atención');
console.log('6. Registro legal de aceptación con fecha y hora');
console.log('7. Diseño responsive para todos los dispositivos');