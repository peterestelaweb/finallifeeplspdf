
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
    overlay.innerHTML = `
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
    `;

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
    banner.innerHTML = `
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
    `;

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
        indicator.innerHTML = `
            <i class="fas fa-globe-americas"></i>
            MERCADO AMERICANO
        `;

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
    modal.innerHTML = `
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
    `;

    document.body.appendChild(modal);
    document.body.classList.add('body-with-overlay');
}

// ========================================
// FIN DEL SISTEMA DE AVISO OBLIGATORIO
// ========================================
