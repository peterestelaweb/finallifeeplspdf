/**
 * FIX PARA EL BUSCADOR - Crea la función performSearch que falta
 * Este archivo debe cargarse después de search.js
 */

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Aplicando fix para buscador...');

    // Crear la función performSearch que falta
    window.performSearch = function(query) {
        console.log('🎯 Usando performSearch para:', query);

        // Usar el motor de búsqueda universal si está disponible
        if (window.universalSearchEngine && window.universalSearchEngine.data) {
            const results = window.universalSearchEngine.search(query, {
                fuzzy: true,
                limit: 100
            });

            console.log('✅ Resultados de búsqueda universal:', results.length);
            return results;
        }

        // Usar el motor local si está disponible
        if (window.localSearchEngine && window.localSearchEngine.data) {
            const results = window.localSearchEngine.search(query, {
                fuzzy: true,
                limit: 100
            });

            console.log('✅ Resultados de búsqueda local:', results.length);
            return results;
        }

        // Si no hay motor de búsqueda, devolver array vacío
        console.warn('⚠️ No se encontró motor de búsqueda');
        return [];
    };

    // También crear funciones auxiliares que puedan faltar
    window.updateSearchResults = function(results, query) {
        console.log('🔄 Actualizando resultados de búsqueda:', results.length, 'para:', query);

        const resultsContainer = document.getElementById('resultsContainer');
        const resultCount = document.getElementById('resultCount');
        const noResults = document.getElementById('noResults');

        if (!resultsContainer) return;

        // Limpiar resultados anteriores
        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            // Mostrar "no results"
            if (resultCount) resultCount.textContent = '0 documentos encontrados';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        // Ocultar "no results"
        if (noResults) noResults.style.display = 'none';

        // Actualizar contador
        if (resultCount) resultCount.textContent = `${results.length} documentos encontrados`;

        // Renderizar resultados
        results.forEach((pdf, index) => {
            const resultElement = createPDFResult(pdf, index);
            resultsContainer.appendChild(resultElement);
        });

        console.log('✅ Resultados renderizados:', results.length);
    };

    // Función para crear elementos de resultado
    function createPDFResult(pdf, index) {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 4px solid #007cba;
            transition: all 0.3s ease;
        `;

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h3 style="color: #333; margin-bottom: 10px; font-size: 18px;">
                        📄 ${pdf.title || pdf.filename}
                    </h3>
                    <p style="color: #666; margin-bottom: 10px; line-height: 1.5;">
                        ${pdf.description || 'Documento PDF'}
                    </p>
                    <div style="font-size: 14px; color: #888;">
                        <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">
                            📁 ${pdf.category || 'General'}
                        </span>
                        <span style="background: #e7f3ff; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">
                            📊 ${formatFileSize(pdf.fileSize)}
                        </span>
                        <span style="background: #f0fff0; padding: 4px 8px; border-radius: 4px;">
                            📅 ${formatDate(pdf.uploadDate)}
                        </span>
                    </div>
                </div>
                <div style="margin-left: 20px;">
                    <a href="${pdf.filePath}" download style="
                        background: #28a745;
                        color: white;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        display: inline-block;
                        transition: background 0.3s;
                    " onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">
                        ⬇️ Descargar PDF
                    </a>
                </div>
            </div>
        `;

        // Efecto hover
        div.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
        });

        div.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });

        return div;
    }

    // Funciones auxiliares
    function formatFileSize(bytes) {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDate(dateString) {
        if (!dateString) return 'Fecha desconocida';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Forzar búsqueda si ya hay texto en el campo
    setTimeout(function() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim()) {
            console.log('🔄 Forzando búsqueda inicial para:', searchInput.value);
            // Simular el evento de búsqueda
            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
        }
    }, 1000);

    console.log('✅ Fix para buscador aplicado correctamente');
});

// También hacer la función disponible globalmente inmediatamente
if (!window.performSearch) {
    window.performSearch = function(query) {
        console.log('🎯 performSearch inmediato para:', query);

        if (window.universalSearchEngine && window.universalSearchEngine.data) {
            return window.universalSearchEngine.search(query, { fuzzy: true, limit: 100 });
        }

        if (window.localSearchEngine && window.localSearchEngine.data) {
            return window.localSearchEngine.search(query, { fuzzy: true, limit: 100 });
        }

        return [];
    };
}