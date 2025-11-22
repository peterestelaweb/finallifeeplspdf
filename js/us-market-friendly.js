
// ========================================
// SOLUCIÓN AMIGABLE: INFORMATIVA PERO NO OBLIGATORIA - MERCADO AMERICANO
// ========================================

console.log('🎯 INICIANDO SISTEMA INFORMATIVO AMIGABLE DE MERCADO AMERICANO');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Configurando aviso informativo amigable...');

    // Verificar si el usuario ya ha cerrado el banner
    const bannerClosed = localStorage.getItem('usMarketBannerClosed');
    const firstVisit = localStorage.getItem('usMarketFirstVisit');

    if (!firstVisit) {
        // Es la primera visita del usuario
        localStorage.setItem('usMarketFirstVisit', new Date().toISOString());
        // NO mostrar banner automáticamente - solo botón flotante discreto
        // showFriendlyBanner();
        // showHeaderIndicator();
        showFloatButton();
    } else {
        // El usuario ya ha visitado antes - solo botón flotante discreto
        // showHeaderIndicator();
        showFloatButton();
        // NO mostrar banner automáticamente ni siquiera en visitas subsiguuentes
        // if (!bannerClosed) {
        //     showFriendlyBanner();
        // }
    }

    // Añadir aviso compacto sobre el footer
    addCompactNotice();
});

// Función para añadir aviso compacto sobre el footer
function addCompactNotice() {
    const footer = document.querySelector('footer');
    if (footer) {
        const notice = document.createElement('div');
        notice.className = 'us-market-compact-notice';
        notice.innerHTML = `
            <div class="notice-content">
                <div class="notice-text">
                    <i class="fas fa-info-circle"></i>
                    <span>INFORMACIÓN IMPORTANTE SOBRE LA INFORMACIÓN OFRECIDA EN ESTA WEB</span>
                </div>
                <button class="notice-toggle" onclick="toggleNoticeInfo()">
                    <i class="fas fa-chevron-down" id="noticeIcon"></i>
                </button>
            </div>
            <div class="notice-details" id="noticeDetails">
                <div class="notice-details-content">
                    <h4><i class="fas fa-globe-americas"></i> Información de Mercado Americano</h4>

                    <div class="info-section">
                        <h5><i class="fas fa-server"></i> Servidores y Alojamiento</h5>
                        <ul>
                            <li><strong>Ubicación:</strong> Servidores ubicados en Estados Unidos</li>
                            <li><strong>Jurisdicción:</strong> Sujeto a leyes federales y estatales de EE.UU.</li>
                            <li><strong>Seguridad:</strong> Cumplimiento con estándares estadounidenses</li>
                        </ul>
                    </div>

                    <div class="info-section">
                        <h5><i class="fas fa-target"></i> Mercado Objetivo</h5>
                        <ul>
                            <li><strong>Enfoque:</strong> Productos diseñados para mercado estadounidense</li>
                            <li><strong>Regulación:</strong> Cumplimiento con normativas de la FDA</li>
                            <li><strong>Distribución:</strong> Orientado a clientes en Estados Unidos</li>
                        </ul>
                    </div>

                    <div class="info-section">
                        <h5><i class="fas fa-file-pdf"></i> Material Disponible</h5>
                        <ul>
                            <li><strong>PDFs:</strong> Todos los documentos están en formato PDF</li>
                            <li><strong>Contenido:</strong> Formulaciones y especificaciones de productos</li>
                            <li><strong>Idioma:</strong> Disponible en español para mercado hispano de EE.UU.</li>
                        </ul>
                    </div>

                    <div class="notice-highlight">
                        <p><strong>Nota importante:</strong> Todo el material está destinado exclusivamente al mercado estadounidense y cumple con las regulaciones de la FDA.</p>
                    </div>
                </div>
            </div>
        `;

        footer.parentNode.insertBefore(notice, footer);
        console.log('📋 Aviso compacto añadido sobre el footer');
    }
}

// Función para toggle del aviso
function toggleNoticeInfo() {
    const details = document.getElementById('noticeDetails');
    const icon = document.getElementById('noticeIcon');

    if (details.style.display === 'block') {
        details.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
    } else {
        details.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
    }
}

// Función para mostrar banner amigable
function showFriendlyBanner() {
    const banner = document.createElement('div');
    banner.className = 'us-market-friendly-banner';
    banner.innerHTML = `
        <div class="banner-content">
            <div class="banner-text">
                <div class="banner-icon">
                    <i class="fas fa-globe-americas"></i>
                </div>
                <div class="banner-info">
                    <div class="banner-title">
                        <i class="fas fa-info-circle"></i>
                        Información Importante
                    </div>
                    <div class="banner-subtitle">
                        Todo el material está destinado al mercado americano y está alojado en servidores de Estados Unidos
                    </div>
                </div>
            </div>
            <div class="banner-actions">
                <button class="info-btn" onclick="showUSMarketInfo()">
                    <i class="fas fa-external-link-alt"></i>
                    Más Información
                </button>
                <button class="close-btn" onclick="closeFriendlyBanner()">
                    <i class="fas fa-times"></i>
                    Entendido
                </button>
            </div>
        </div>
    `;

    document.body.insertBefore(banner, document.body.firstChild);
    document.body.classList.add('body-with-friendly-banner');

    console.log('📋 Banner informativo amigable mostrado');
}

// Función para mostrar indicador en el header
function showHeaderIndicator() {
    const header = document.querySelector('.header');
    if (header) {
        const indicator = document.createElement('div');
        indicator.className = 'us-market-header-indicator';
        indicator.innerHTML = `
            <i class="fas fa-globe-americas"></i>
            Mercado Americano
        `;
        indicator.onclick = showUSMarketInfo;

        header.style.position = 'relative';
        header.appendChild(indicator);

        console.log('📍 Indicador añadido al header');
    }
}

// Función para mostrar botón flotante
function showFloatButton() {
    const floatBtn = document.createElement('button');
    floatBtn.className = 'us-market-float-btn';
    floatBtn.innerHTML = `
        <i class="fas fa-globe-americas"></i>
    `;
    floatBtn.onclick = showUSMarketInfo;
    floatBtn.title = 'Información Mercado Americano';

    document.body.appendChild(floatBtn);

    console.log('🔘 Botón flotante añadido');
}

// Función para cerrar el banner amigable
function closeFriendlyBanner() {
    const banner = document.querySelector('.us-market-friendly-banner');
    if (banner) {
        banner.style.transform = 'translateY(-100%)';
        banner.style.opacity = '0';

        setTimeout(() => {
            banner.remove();
            document.body.classList.remove('body-with-friendly-banner');
        }, 300);

        // Guardar que el usuario ha cerrado el banner
        localStorage.setItem('usMarketBannerClosed', 'true');
        localStorage.setItem('usMarketBannerClosedDate', new Date().toISOString());

        console.log('📋 Banner cerrado por el usuario');
    }
}

// Función para mostrar modal informativo
function showUSMarketInfo() {
    // Verificar si el modal ya existe
    let modal = document.querySelector('.us-market-info-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'us-market-info-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">
                        <i class="fas fa-globe-americas"></i>
                        Información de Mercado Americano
                    </div>
                    <div class="modal-subtitle">
                        Información importante sobre productos y servicios para EE.UU.
                    </div>
                </div>
                <div class="modal-body">
                    <div class="modal-section">
                        <h4><i class="fas fa-server"></i> Servidores y Alojamiento</h4>
                        <ul>
                            <li><strong>Ubicación:</strong> Servidores ubicados en Estados Unidos</li>
                            <li><strong>Jurisdicción:</strong> Sujeto a leyes federales y estatales de EE.UU.</li>
                            <li><strong>Seguridad:</strong> Cumplimiento con estándares estadounidenses</li>
                        </ul>
                    </div>

                    <div class="modal-section">
                        <h4><i class="fas fa-target"></i> Mercado Objetivo</h4>
                        <ul>
                            <li><strong>Enfoque:</strong> Productos diseñados para mercado estadounidense</li>
                            <li><strong>Regulación:</strong> Cumplimiento con normativas de la FDA</li>
                            <li><strong>Distribución:</strong> Orientado a clientes en Estados Unidos</li>
                        </ul>
                    </div>

                    <div class="modal-actions">
                        <button class="modal-btn primary-btn" onclick="closeUSMarketInfo()">
                            <i class="fas fa-check"></i>
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeUSMarketInfo();
            }
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeUSMarketInfo();
            }
        });
    }

    // Mostrar modal
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    console.log('📋 Modal informativo mostrado');
}

// Función para cerrar modal informativo
function closeUSMarketInfo() {
    const modal = document.querySelector('.us-market-info-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Función para reconocer la información
function acknowledgeUSMarketInfo() {
    // Guardar reconocimiento (sin obligación)
    localStorage.setItem('usMarketAcknowledged', 'true');
    localStorage.setItem('usMarketAcknowledgedDate', new Date().toISOString());

    console.log('✅ Usuario ha reconocido la información');
    closeUSMarketInfo();
}

// Función para mejorar el pie de página
function enhanceFooter() {
    const footer = document.querySelector('footer');
    if (footer) {
        // Insertar sección de mercado americano antes del footer existente
        const usMarketFooter = document.createElement('div');
        usMarketFooter.className = 'footer-us-market';
        usMarketFooter.innerHTML = `
            <div class="footer-content">
                <div class="footer-title">
                    <i class="fas fa-globe-americas"></i>
                    Información de Mercado Americano
                </div>
                <div class="footer-subtitle">
                    Todo nuestro material está destinado al mercado de Estados Unidos
                </div>

                <div class="footer-highlight">
                    <p><i class="fas fa-exclamation-triangle"></i> <strong>IMPORTANTE:</strong> Todo el contenido, PDFs y productos están diseñados exclusivamente para el mercado estadounidense y cumplen con las regulaciones de la FDA.</p>
                </div>

                <div class="footer-details">
                    <h4><i class="fas fa-server"></i> Servidores y Alojamiento</h4>
                    <ul>
                        <li><strong>Ubicación:</strong> Estados Unidos de América</li>
                        <li><strong>Jurisdicción:</strong> Leyes federales y estatales de EE.UU.</li>
                        <li><strong>Regulación:</strong> Cumplimiento con estándares estadounidenses</li>
                        <li><strong>Seguridad:</strong> Protección de datos según regulaciones de EE.UU.</li>
                    </ul>

                    <h4><i class="fas fa-target"></i> Mercado y Productos</h4>
                    <ul>
                        <li><strong>Destino:</strong> Mercado exclusivo estadounidense</li>
                        <li><strong>Regulación:</strong> Normativas FDA y agencias de EE.UU.</li>
                        <li><strong>Distribución:</strong> Territorio de Estados Unidos</li>
                        <li><strong>Soporte:</strong> Horarios adaptados al mercado americano</li>
                    </ul>

                    <h4><i class="fas fa-balance-scale"></i> Información Legal</h4>
                    <ul>
                        <li><strong>Jurisdicción:</strong> Leyes aplicables de Estados Unidos</li>
                        <li><strong>Responsabilidad:</strong> Cumplimiento con regulaciones estadounidenses</li>
                        <li><strong>Garantías:</strong> Según leyes de protección al consumidor de EE.UU.</li>
                        <li><strong>Disputas:</strong> Resueltas en tribunales de Estados Unidos</li>
                    </ul>
                </div>

                <div class="footer-highlight">
                    <p><i class="fas fa-info-circle"></i> <strong>Nota:</strong> Al utilizar este sitio, usted reconoce que entiende y acepta que todo el material está destinado al mercado americano.</p>
                </div>
            </div>
        `;

        footer.parentNode.insertBefore(usMarketFooter, footer);

        console.log('📋 Pie de página mejorado con información de mercado americano');
    }
}

// ========================================
// FIN DEL SISTEMA INFORMATIVO AMIGABLE
// ========================================
