// Script para mostrar el mensaje mejorado de "no results" temporalmente
console.log('🎨 Mostrando mensaje mejorado de no resultados...');

// Función para mostrar el mensaje mejorado
function showEnhancedNoResults() {
    const noResultsElement = document.getElementById('noResults');
    const resultsContainer = document.getElementById('resultsContainer');
    const searchSection = document.querySelector('.search-section');

    if (noResultsElement && resultsContainer) {
        // Ocultar contenedor de resultados
        resultsContainer.style.display = 'none';

        // Mostrar mensaje mejorado
        noResultsElement.style.display = 'block';

        console.log('✅ Mensaje mejorado mostrado con nuevo diseño atractivo');

        // Hacer scroll suave hacia el mensaje
        setTimeout(() => {
            noResultsElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300);

        // Añadir interactividad a los tags de sugerencia
        const suggestionTags = document.querySelectorAll('.suggestion-tag');
        suggestionTags.forEach(tag => {
            tag.addEventListener('click', function() {
                const searchTerm = this.textContent.trim();
                console.log(`🏷️ Tag clickeado: "${searchTerm}"`);

                // Simular búsqueda del tag
                const searchInput = document.querySelector('#searchInput');
                if (searchInput) {
                    searchInput.value = searchTerm;
                    searchInput.focus();

                    // Animación del tag clickeado
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 200);
                }
            });
        });

        // Log de características del nuevo diseño
        console.log('🎯 Características del nuevo mensaje:');
        console.log('  ✨ Icono animado con brújula flotante');
        console.log('  🌈 Gradientes modernos púrpura-azul');
        console.log('  💫 Efecto shimmer en el fondo');
        console.log('  🏷️ Tags interactivos con emojis');
        console.log('  💡 Tip de búsqueda útil');
        console.log('  📱 Diseño responsive');
    } else {
        console.error('❌ No se encontraron elementos del mensaje');
    }
}

// Función para ocultar el mensaje
function hideEnhancedNoResults() {
    const noResultsElement = document.getElementById('noResults');
    const resultsContainer = document.getElementById('resultsContainer');

    if (noResultsElement && resultsContainer) {
        noResultsElement.style.display = 'none';
        resultsContainer.style.display = 'grid';
        console.log('🔙 Mensaje mejorado oculto');
    }
}

// Mostrar automáticamente al cargar la página (para demostración)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        showEnhancedNoResults();
        console.log('🎯 Mensaje mejorado visible por 10 segundos para demostración');

        // Ocultar después de 10 segundos (opcional)
        setTimeout(() => {
            console.log('⏰ El mensaje mejorado permanecerá visible para que puedas verlo');
            // hideEnhancedNoResults(); // Descomentar si quieres ocultarlo automáticamente
        }, 10000);
    }, 2000);
});

// Hacer funciones disponibles globalmente
window.showEnhancedNoResults = showEnhancedNoResults;
window.hideEnhancedNoResults = hideEnhancedNoResults;

console.log('🎨 Script de mensaje mejorado cargado. Usa showEnhancedNoResults() para mostrarlo manualmente');