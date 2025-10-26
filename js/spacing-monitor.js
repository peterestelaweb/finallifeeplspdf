// =====================================================
// SPACING MONITOR - ASEGURAR ESPACIADO CERO
// =====================================================

class SpacingMonitor {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        // Esperar a que la página cargue completamente
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.fixSpacing());
        } else {
            this.fixSpacing();
        }

        // Monitorear cambios en el DOM
        this.observeChanges();

        // Monitorear resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            setTimeout(() => this.fixSpacing(), 100);
        });

        // Monitorear cambios en el contenedor de resultados
        this.observeResults();
    }

    fixSpacing() {
        const searchSection = document.querySelector('.search-section');
        const resultsSection = document.querySelector('.results-section');
        const searchContainer = document.querySelector('.search-container');
        const resultsContainer = document.querySelector('.results-container');

        if (!searchSection || !resultsSection) return;

        // Medir espaciado actual
        const searchRect = searchSection.getBoundingClientRect();
        const resultsRect = resultsSection.getBoundingClientRect();
        const currentGap = resultsRect.top - searchRect.bottom;

        console.log(`Espaciado actual: ${currentGap}px`);

        // Forzar espaciado cero
        this.forceZeroSpacing(searchSection, resultsSection, searchContainer, resultsContainer);

        // Ajustar para móvil
        if (this.isMobile) {
            this.adjustForMobile();
        }
    }

    forceZeroSpacing(searchSection, resultsSection, searchContainer, resultsContainer) {
        // Eliminar todos los márgenes
        searchSection.style.marginBottom = '0px';
        searchSection.style.paddingBottom = '0px';

        resultsSection.style.marginTop = '0px';
        resultsSection.style.paddingTop = '0px';

        if (searchContainer) {
            searchContainer.style.marginBottom = '0px';
            searchContainer.style.paddingBottom = this.isMobile ? '10px' : '15px';
        }

        if (resultsContainer) {
            resultsContainer.style.marginTop = '0px';
            resultsContainer.style.paddingTop = this.isMobile ? '10px' : '15px';
        }

        // Forzar que los bloques estén conectados
        const searchRect = searchSection.getBoundingClientRect();
        const resultsRect = resultsSection.getBoundingClientRect();
        const gap = resultsRect.top - searchRect.bottom;

        if (gap > 0) {
            resultsSection.style.transform = `translateY(-${gap}px)`;
        }
    }

    adjustForMobile() {
        const searchSection = document.querySelector('.search-section');
        const resultsSection = document.querySelector('.results-section');

        if (searchSection) {
            searchSection.style.minHeight = 'auto';
        }

        if (resultsSection) {
            resultsSection.style.minHeight = 'auto';
        }

        // Reducir padding en móvil
        const searchContainer = document.querySelector('.search-container');
        const resultsContainer = document.querySelector('.results-container');

        if (searchContainer) {
            searchContainer.style.padding = '10px';
        }

        if (resultsContainer) {
            resultsContainer.style.padding = '10px';
        }
    }

    observeChanges() {
        // Crear un MutationObserver para detectar cambios en el DOM
        const observer = new MutationObserver((mutations) => {
            let shouldFix = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            if (node.classList.contains('result-card') ||
                                node.classList.contains('no-results') ||
                                node.querySelector('.result-card') ||
                                node.querySelector('.no-results')) {
                                shouldFix = true;
                            }
                        }
                    });
                }
            });

            if (shouldFix) {
                setTimeout(() => this.fixSpacing(), 50);
            }
        });

        // Observar el contenedor de resultados
        const resultsContainer = document.querySelector('.results-container');
        if (resultsContainer) {
            observer.observe(resultsContainer, {
                childList: true,
                subtree: true
            });
        }
    }

    observeResults() {
        // Monitorear cuando aparecen resultados
        const resultsContainer = document.querySelector('#resultsContainer');
        if (resultsContainer) {
            const observer = new MutationObserver(() => {
                setTimeout(() => this.fixSpacing(), 100);
            });
            observer.observe(resultsContainer, {
                childList: true,
                subtree: true
            });
        }

        // Monitorear el mensaje de "no results"
        const noResults = document.querySelector('#noResults');
        if (noResults) {
            const observer = new MutationObserver(() => {
                setTimeout(() => this.fixSpacing(), 100);
            });
            observer.observe(noResults, {
                attributes: true,
                attributeFilter: ['style']
            });
        }
    }

    // Método público para forzar el ajuste manualmente
    forceFix() {
        this.fixSpacing();
    }

    // Obtener mediciones actuales
    getMeasurements() {
        const searchSection = document.querySelector('.search-section');
        const resultsSection = document.querySelector('.results-section');

        if (!searchSection || !resultsSection) return null;

        const searchRect = searchSection.getBoundingClientRect();
        const resultsRect = resultsSection.getBoundingClientRect();

        return {
            searchBottom: searchRect.bottom,
            resultsTop: resultsRect.top,
            gap: resultsRect.top - searchRect.bottom,
            isMobile: this.isMobile
        };
    }
}

// Inicializar el monitor
window.addEventListener('DOMContentLoaded', () => {
    window.spacingMonitor = new SpacingMonitor();

    // Hacer disponible globalmente para debugging
    window.measureSpacing = () => {
        const measurements = window.spacingMonitor.getMeasurements();
        console.log('Mediciones actuales:', measurements);
        return measurements;
    };

    window.fixSpacing = () => {
        window.spacingMonitor.forceFix();
    };
});

// También inicializar si ya cargó
if (document.readyState !== 'loading') {
    window.spacingMonitor = new SpacingMonitor();
}

// Exportar para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpacingMonitor;
}