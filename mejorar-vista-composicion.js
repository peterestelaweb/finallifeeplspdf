const fs = require('fs');

console.log('🔧 Mejorando la vista para mostrar composición en la web...');

// Leer el archivo search.js actual
const searchJsPath = './js/search.js';
let searchJsContent = fs.readFileSync(searchJsPath, 'utf8');

console.log('📄 Modificando search.js para mostrar composición...');

// Buscar la función que renderiza las tarjetas de resultados
const renderResultsMatch = searchJsContent.match(/renderResults\(\)\s*{[\s\S]*?(?=\n    [a-zA-Z]|\n\}|$)/);

if (renderResultsMatch) {
    console.log('✅ Encontrada función renderResults');

    // Crear una nueva función de renderizado mejorada
    const nuevaFuncionRender = `renderResults() {
        this.resultsContainer.innerHTML = '';

        if (this.filteredPDFs.length === 0) {
            this.resultsContainer.innerHTML = \`
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron fichas técnicas</h3>
                    <p>Intenta con otros términos de búsqueda</p>
                </div>
            \`;
            return;
        }

        // Mostrar número de resultados
        this.resultCount.textContent = this.filteredPDFs.length;

        // Renderizar cada PDF como una tarjeta mejorada
        this.filteredPDFs.forEach(pdf => {
            const card = this.createEnhancedCard(pdf);
            this.resultsContainer.appendChild(card);
        });

        // Adjuntar event listeners
        this.attachCardEventListeners();
    }

    createEnhancedCard(pdf) {
        const card = document.createElement('div');
        card.className = 'result-item enhanced';

        // Formatear tamaño de archivo
        const fileSizeMB = (pdf.fileSize / (1024 * 1024)).toFixed(1);
        const uploadDate = new Date(pdf.uploadDate).toLocaleDateString('es-ES');

        // Crear badges para categorías
        const categoryBadges = pdf.categories && pdf.categories.length > 0
            ? pdf.categories.slice(0, 3).map(cat => \`<span class="category-badge">\${cat}</span>\`).join('')
            : '<span class="category-badge">General</span>';

        // Crear lista de ingredientes
        const ingredientsList = pdf.ingredients && pdf.ingredients.length > 0
            ? pdf.ingredients.slice(0, 5).map(ing => \`<li>\${ing}</li>\`).join('')
            : '<li>Información no disponible</li>';

        // Crear lista de beneficios
        const benefitsList = pdf.benefits && pdf.benefits.length > 0
            ? pdf.benefits.slice(0, 4).map(ben => \`<li>\${ben}</li>\`).join('')
            : '<li>Consultar ficha técnica</li>';

        card.innerHTML = \`
            <div class="enhanced-result-card">
                <div class="card-header">
                    <div class="card-title-section">
                        <h3 class="result-title">\${pdf.title}</h3>
                        <div class="category-badges">\${categoryBadges}</div>
                    </div>
                    <div class="card-category">
                        <span class="category-tag">\${pdf.category || 'General'}</span>
                    </div>
                </div>

                <div class="card-description">
                    <p>\${pdf.description || 'Ficha técnica del producto'}</p>
                </div>

                <div class="card-composition">
                    <div class="composition-section">
                        <h4 class="composition-title">
                            <i class="fas fa-pills"></i>
                            Ingredientes Principales
                        </h4>
                        <ul class="ingredients-list">
                            \${ingredientsList}
                        </ul>
                    </div>

                    <div class="composition-section">
                        <h4 class="composition-title">
                            <i class="fas fa-heart"></i>
                            Beneficios
                        </h4>
                        <ul class="benefits-list">
                            \${benefitsList}
                        </ul>
                    </div>
                </div>

                <div class="card-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>\${uploadDate}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-weight-hanging"></i>
                        <span>\${fileSizeMB} MB</span>
                    </div>
                    \${pdf.downloadCount ? \`
                        <div class="meta-item">
                            <i class="fas fa-download"></i>
                            <span>\${pdf.downloadCount} descargas</span>
                        </div>
                    \` : ''}
                </div>

                <div class="pdf-actions">
                    <button class="download-btn" data-filename="\${pdf.filename}" data-url="\${pdf.filePath}">
                        <i class="fas fa-download"></i>
                        Descargar PDF
                    </button>
                    <button class="view-btn" data-filename="\${pdf.filename}" data-url="\${pdf.filePath}" title="Ver PDF">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                </div>
            </div>
        \`;

        return card;
    }`;

    // Reemplazar la función renderResults en el archivo
    const regex = /renderResults\(\)\s*{[\s\S]*?(?=\n    [a-zA-Z]|\n\}|$)/;
    searchJsContent = searchJsContent.replace(regex, nuevaFuncionRender);

    console.log('✅ Función renderResults mejorada');
} else {
    console.log('❌ No se encontró la función renderResults');
}

// Agregar estilos CSS para la nueva vista mejorada
console.log('🎨 Agregando estilos CSS mejorados...');

const cssMejorado = `
/* Estilos para tarjetas de resultados mejoradas */
.enhanced-result-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
}

.enhanced-result-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.card-title-section h3 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
    font-size: 1.25rem;
    font-weight: 600;
}

.category-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
}

.category-badge {
    background: #e0e7ff;
    color: #3730a3;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
}

.category-tag {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
}

.card-description {
    margin-bottom: 1.5rem;
}

.card-description p {
    color: #6b7280;
    line-height: 1.5;
    margin: 0;
}

.card-composition {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
}

.composition-section h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.75rem 0;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 600;
}

.composition-section i {
    color: #6366f1;
}

.ingredients-list,
.benefits-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.ingredients-list li,
.benefits-list li {
    padding: 0.25rem 0;
    color: #4b5563;
    font-size: 0.875rem;
    position: relative;
    padding-left: 1rem;
}

.ingredients-list li:before,
.benefits-list li:before {
    content: "•";
    color: #6366f1;
    position: absolute;
    left: 0;
    font-weight: bold;
}

.card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #6b7280;
    font-size: 0.875rem;
}

.meta-item i {
    color: #9ca3af;
}

.pdf-actions {
    display: flex;
    gap: 0.75rem;
}

.download-btn,
.view-btn {
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
}

.download-btn {
    background: #6366f1;
    color: white;
}

.download-btn:hover {
    background: #4f46e5;
}

.view-btn {
    background: #f3f4f6;
    color: #374151;
}

.view-btn:hover {
    background: #e5e7eb;
}

/* Responsive para las tarjetas mejoradas */
@media (max-width: 768px) {
    .card-composition {
        grid-template-columns: 1fr;
    }

    .card-header {
        flex-direction: column;
        gap: 0.75rem;
    }

    .card-meta {
        flex-direction: column;
        align-items: flex-start;
    }

    .pdf-actions {
        flex-direction: column;
    }
}
`;

// Agregar los estilos al archivo CSS principal
const cssPath = './css/styles.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('enhanced-result-card')) {
    cssContent += '\n\n/* Estilos para resultados mejorados - Generado automáticamente */\n' + cssMejorado;
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log('✅ Estilos mejorados agregados a styles.css');
} else {
    console.log('ℹ️  Los estilos mejorados ya existen en styles.css');
}

// Guardar el archivo search.js modificado
fs.writeFileSync(searchJsPath, searchJsContent, 'utf8');
console.log('✅ search.js actualizado con vista mejorada');

console.log('\n🎉 VISTA MEJORADA COMPLETADA');
console.log('Ahora la web mostrará:');
console.log('✅ Ingredientes principales de cada producto');
console.log('✅ Beneficios para la salud');
console.log('✅ Categorías con badges');
console.log('✅ Diseño más atractivo y funcional');

console.log('\n📁 ARCHIVOS MODIFICADOS:');
console.log('✅ js/search.js - Función renderizado mejorada');
console.log('✅ css/styles.css - Estilos para nueva vista');