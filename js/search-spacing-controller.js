/**
 * Search Spacing Controller - Dynamic spacing adjustment for search results
 * Prevents overlap by dynamically adjusting margins based on content height
 */

class SearchSpacingController {
    constructor() {
        this.searchSection = document.querySelector('.search-section');
        this.resultsSection = document.querySelector('.results-section');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultsGrid = document.querySelector('.results-grid');

        this.spacingConfig = {
            minSpacing: 5,
            maxSpacing: 30,
            defaultSpacing: 20,
            manyResultsThreshold: 5,
            mobileThreshold: 768
        };

        this.init();
    }

    init() {
        console.log('🔧 Inicializando Search Spacing Controller...');

        // Observar cambios en el contenedor de resultados
        this.observeResultsChanges();

        // Ajustar espaciado inicial
        this.adjustSpacing();

        // Ajustar en cambios de tamaño de ventana
        window.addEventListener('resize', () => {
            this.debounce(() => this.adjustSpacing(), 250);
        });

        // Ajustar después de que carguen las imágenes
        if (this.resultsContainer) {
            this.resultsContainer.addEventListener('load', () => {
                this.adjustSpacing();
            }, true);
        }

        console.log('✅ Search Spacing Controller inicializado');
    }

    observeResultsChanges() {
        if (!this.resultsContainer) return;

        // Crear MutationObserver para detectar cambios en los resultados
        const observer = new MutationObserver((mutations) => {
            let shouldAdjust = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' &&
                    (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                    shouldAdjust = true;
                }
            });

            if (shouldAdjust) {
                // Pequeño retraso para que el DOM se actualice completamente
                setTimeout(() => this.adjustSpacing(), 50);
            }
        });

        // Configurar el observer
        observer.observe(this.resultsContainer, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });

        this.observer = observer;
    }

    adjustSpacing() {
        if (!this.searchSection || !this.resultsSection) return;

        // Determinar estado actual de los resultados
        const resultState = this.analyzeResults();

        // Calcular espaciado adecuado
        const spacing = this.calculateOptimalSpacing(resultState);

        // Aplicar espaciado
        this.applySpacing(spacing, resultState);

        // Actualizar clases de estado
        this.updateStateClasses(resultState);

        console.log('🎯 Espaciado ajustado:', { spacing, resultState });
    }

    analyzeResults() {
        const resultCards = this.resultsContainer?.querySelectorAll('.result-item, .enhanced-result-card, .no-results');
        const hasResults = resultCards && resultCards.length > 0;
        const hasManyResults = resultCards && resultCards.length > this.spacingConfig.manyResultsThreshold;
        const hasNoResults = this.resultsContainer?.querySelector('.no-results');
        const isLoading = document.getElementById('loadingIndicator')?.style.display !== 'none';

        // Calcular altura del contenido
        const contentHeight = this.calculateContentHeight();

        // Detectar si es móvil
        const isMobile = window.innerWidth <= this.spacingConfig.mobileThreshold;

        return {
            hasResults,
            hasManyResults,
            hasNoResults,
            isLoading,
            resultCount: resultCards?.length || 0,
            contentHeight,
            isMobile,
            needsMoreSpace: contentHeight > 300 && hasResults
        };
    }

    calculateContentHeight() {
        if (!this.resultsContainer) return 0;

        // Calcular altura real del contenido
        const children = this.resultsContainer.children;
        let totalHeight = 0;

        for (let child of children) {
            if (child.style.display !== 'none') {
                totalHeight += child.offsetHeight;
            }
        }

        return totalHeight;
    }

    calculateOptimalSpacing(resultState) {
        let spacing = this.spacingConfig.defaultSpacing;

        // Ajustar basado en el estado
        if (resultState.isLoading) {
            spacing = this.spacingConfig.minSpacing;
        } else if (resultState.hasNoResults) {
            spacing = this.spacingConfig.minSpacing + 5;
        } else if (resultState.hasManyResults || resultState.needsMoreSpace) {
            spacing = this.spacingConfig.maxSpacing;
        } else if (resultState.hasResults) {
            spacing = this.spacingConfig.defaultSpacing;
        }

        // Ajustar para móvil
        if (resultState.isMobile) {
            spacing = Math.max(this.spacingConfig.minSpacing, spacing * 0.7);
        }

        return spacing;
    }

    applySpacing(spacing, resultState) {
        if (!this.searchSection || !this.resultsSection) return;

        // Aplicar espaciado dinámico
        this.resultsSection.style.marginTop = `${spacing}px`;
        this.resultsSection.style.paddingTop = `${Math.max(15, spacing - 5)}px`;

        // Asegurar que el search section no tenga márgenes negativos
        this.searchSection.style.marginBottom = '0';
        this.searchSection.style.paddingBottom = `${Math.max(15, spacing * 0.8)}px`;

        // Prevenir solapamiento específico
        if (resultState.hasResults && resultState.contentHeight > 200) {
            this.ensureNoOverlap();
        }
    }

    ensureNoOverlap() {
        if (!this.searchSection || !this.resultsSection) return;

        const searchRect = this.searchSection.getBoundingClientRect();
        const resultsRect = this.resultsSection.getBoundingClientRect();

        // Calcular separación real
        const actualGap = resultsRect.top - searchRect.bottom;

        // Si hay solapamiento o muy poca separación
        if (actualGap < 5) {
            const additionalSpacing = 5 - actualGap;
            this.resultsSection.style.marginTop = `${additionalSpacing}px`;
            console.log('🔧 Corregido solapamiento:', additionalSpacing, 'px adicionales');
        }
    }

    updateStateClasses(resultState) {
        if (!this.resultsSection) return;

        // Remover todas las clases de estado
        this.resultsSection.classList.remove('has-results', 'has-many-results', 'has-no-results', 'is-loading');

        // Agregar clases apropiadas
        if (resultState.isLoading) {
            this.resultsSection.classList.add('is-loading');
        } else if (resultState.hasNoResults) {
            this.resultsSection.classList.add('has-no-results');
        } else if (resultState.hasManyResults) {
            this.resultsSection.classList.add('has-many-results');
        } else if (resultState.hasResults) {
            this.resultsSection.classList.add('has-results');
        }
    }

    // Método público para forzar reajuste
    forceAdjustment() {
        console.log('🔄 Forzando reajuste de espaciado...');
        this.adjustSpacing();
    }

    // Método para obtener estado actual
    getCurrentState() {
        return this.analyzeResults();
    }

    // Utilidad para debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Destruir el controller
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        window.removeEventListener('resize', this.adjustSpacing);
    }
}

// Inicializar automáticamente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco a que carguen otros scripts
    setTimeout(() => {
        window.searchSpacingController = new SearchSpacingController();

        // Hacerlo disponible globalmente para debugging
        window.debugSpacing = () => {
            const controller = window.searchSpacingController;
            if (controller) {
                console.log('Estado actual:', controller.getCurrentState());
                controller.forceAdjustment();
            }
        };

        console.log('🎯 Search Spacing Controller disponible globalmente como window.searchSpacingController');
        console.log('💡 Usa window.debugSpacing() para debugging');
    }, 1000);
});

// También inicializar si ya cargó el DOM
if (document.readyState === 'loading') {
    // DOM está cargando, esperar evento
} else {
    // DOM ya cargado, inicializar ahora
    setTimeout(() => {
        if (!window.searchSpacingController) {
            window.searchSpacingController = new SearchSpacingController();
        }
    }, 500);
}