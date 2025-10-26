// ========================================
// SOLUCIÓN MEJORADA PARA OVERLAY LEGAL - SIN BLUR BLOQUEANTE
// ========================================

console.log('🛡️ INICIANDO SISTEMA DE AVISO LEGAL MEJORADO');

document.addEventListener('DOMContentLoaded', function() {
    console.log('⚖️ Configurando aviso legal mejorado...');

    // Verificar si el usuario ya ha aceptado
    const hasAccepted = localStorage.getItem('usMarketAccepted');

    if (!hasAccepted) {
        console.log('👤 Usuario no ha aceptado, mostrando aviso legal mejorado...');
        showImprovedLegalNotice();
    } else {
        console.log('✅ Usuario ya ha aceptado el aviso legal');
        showPermanentIndicator();
    }
});

// Función para mostrar el aviso legal mejorado (SIN BLUR BLOQUEANTE)
function showImprovedLegalNotice() {
    // Crear banner superior en lugar de overlay
    const banner = document.createElement('div');
    banner.className = 'legal-notice-banner';
    banner.innerHTML = `
        <div class="banner-content">
            <div class="banner-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="banner-text">
                <div class="banner-title">AVISO LEGAL IMPORTANTE</div>
                <div class="banner-subtitle">
                    Este sitio contiene información destinada exclusivamente para el mercado americano.
                    Todos los productos cumplen con la regulación FDA y están alojados en servidores de EE.UU.
                </div>
            </div>
            <div class="banner-actions">
                <button class="banner-btn details-btn" onclick="showLegalDetails()">
                    <i class="fas fa-info-circle"></i>
                    Ver Detalles
                </button>
                <button class="banner-btn accept-btn" onclick="acceptLegalNotice()">
                    <i class="fas fa-check"></i>
                    Acepto y Entiendo
                </button>
            </div>
        </div>
    `;

    // Insertar al principio del body
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.classList.add('body-with-legal-banner');

    console.log('📢 Aviso legal mejorado mostrado - SIN efecto blur bloqueante');
}

// Función para mostrar detalles legales
function showLegalDetails() {
    const modal = document.createElement('div');
    modal.className = 'legal-details-modal';
    modal.innerHTML = `
        <div class="legal-modal-content">
            <div class="legal-modal-header">
                <h3>Información Legal y Mercados</h3>
                <span class="legal-modal-close" onclick="this.closest('.legal-details-modal').remove()">&times;</span>
            </div>
            <div class="legal-modal-body">
                <div class="legal-notice">
                    <h4><i class="fas fa-globe-americas"></i> Información para Mercado Estadounidense</h4>
                    <p><strong>Aviso importante:</strong> Las fichas técnicas y formulaciones mostradas en este sitio están alojadas en servidores ubicados en Estados Unidos y están destinadas específicamente para el mercado estadounidense.</p>

                    <div class="legal-points">
                        <div class="legal-point">
                            <i class="fas fa-server"></i>
                            <div>
                                <strong>Alojamiento:</strong> La información está hospedada en servidores de Estados Unidos, cumpliendo con la legislación aplicable en ese país.
                            </div>
                        </div>
                        <div class="legal-point">
                            <i class="fas fa-target"></i>
                            <div>
                                <strong>Mercado objetivo:</strong> Estas formulaciones están diseñadas y reguladas para su comercialización y consumo en el mercado estadounidense.
                            </div>
                        </div>
                        <div class="legal-point">
                            <i class="fas fa-balance-scale"></i>
                            <div>
                                <strong>Regulación:</strong> Los productos cumplen con las normativas de la FDA (Food and Drug Administration) y otras agencias regulatorias estadounidenses.
                            </div>
                        </div>
                        <div class="legal-point">
                            <i class="fas fa-exclamation-triangle"></i>
                            <div>
                                <strong>Responsabilidad:</strong> La información proporcionada es para referencia del mercado estadounidense. La disponibilidad y regulaciones pueden variar en otros países.
                            </div>
                        </div>
                    </div>

                    <div class="legal-disclaimer-text">
                        <p><em>Este sitio actúa como un buscador de información técnica y no comercializa directamente los productos. Para información específica sobre disponibilidad en tu región, contacta con los distribuidores autorizados de LifePlus.</em></p>
                    </div>
                </div>
            </div>
            <div class="legal-modal-footer">
                <button class="legal-modal-btn" onclick="this.closest('.legal-details-modal').remove()">Entendido</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Función para aceptar el aviso legal
function acceptLegalNotice() {
    console.log('✅ Usuario ha aceptado el aviso legal');

    // Guardar aceptación
    localStorage.setItem('usMarketAccepted', 'true');
    localStorage.setItem('usMarketAcceptedDate', new Date().toISOString());

    // Eliminar banner
    const banner = document.querySelector('.legal-notice-banner');
    if (banner) {
        banner.style.transform = 'translateY(-100%)';
        banner.style.transition = 'transform 0.5s ease-out';

        setTimeout(() => {
            banner.remove();
            document.body.classList.remove('body-with-legal-banner');
        }, 500);
    }

    // Mostrar indicador permanente
    showPermanentIndicator();

    console.log('🎉 Aviso legal aceptado - sitio completamente funcional');
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

// ========================================
// FIN DEL SISTEMA DE AVISO LEGAL MEJORADO
// ========================================