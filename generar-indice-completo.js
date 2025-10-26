const fs = require('fs');
const path = require('path');

console.log('🚀 Generando índice completo con composición detallada...');

// Cargar el análisis de composición previo
const analisisPath = './data/pdf-index-composicion.json';
const analisisData = JSON.parse(fs.readFileSync(analisisPath, 'utf8'));

console.log(`📊 Procesando ${analisisData.pdfs.length} productos analizados...`);

// Función para mejorar la detección de composición basada en el nombre
function getComposicionDetallada(filename, title) {
    const lowerFile = filename.toLowerCase();
    const lowerTitle = title.toLowerCase();

    const composicion = {
        ingredientes: [],
        categorias: [],
        beneficios: [],
        usos: [],
        keywords: []
    };

    // Análisis específico por producto
    if (lowerFile.includes('omegold') || lowerTitle.includes('omegold')) {
        composicion.ingredientes = ['omega 3', 'epa', 'dha', 'aceite de pescado', 'ácidos grasos esenciales'];
        composicion.categorias = ['omega', 'ácidos grasos', 'suplemento cardiovascular'];
        composicion.beneficios = ['salud cardiovascular', 'función cerebral', 'antiinflamatorio', 'colesterol', 'triglicéridos'];
        composicion.usos = ['corazón', 'cerebro', 'articulaciones', 'vista', 'piel'];
        composicion.keywords = ['omega 3', 'aceite de pescado', 'epa', 'dha', 'omegold', 'cardiovascular', 'cerebral'];
    }

    // OMEGA 3 MANGO
    else if (lowerFile.includes('mango omega')) {
        composicion.ingredientes = ['omega 3', 'epa', 'dha', 'aceite de pescado', 'mango', 'vitamina e'];
        composicion.categorias = ['omega', 'ácidos grasos', 'suplemento cardiovascular'];
        composicion.beneficios = ['salud cardiovascular', 'función cerebral', 'sabor tropical'];
        composicion.usos = ['corazón', 'cerebro', 'niños', 'personas que no tragan pastillas'];
        composicion.keywords = ['omega 3', 'mango', 'aceite de pescado', 'epa', 'dha', 'sabor'];
    }

    // EPA PLUS
    else if (lowerFile.includes('epa plus') || lowerFile.includes('epa plus')) {
        composicion.ingredientes = ['omega 3', 'epa', 'aceite de pescado', 'vitamina e'];
        composicion.categorias = ['omega', 'ácidos grasos', 'suplemento cardiovascular'];
        composicion.beneficios = ['salud cardiovascular', 'antiinflamatorio', 'circulación'];
        composicion.usos = ['corazón', 'circulación', 'articulaciones'];
        composicion.keywords = ['epa', 'omega 3', 'aceite de pescado', 'cardiovascular'];
    }

    // VITAMINAS
    else if (lowerFile.includes('daily biobasics') || lowerTitle.includes('daily biobasics')) {
        composicion.ingredientes = ['vitamina a', 'vitamina c', 'vitamina d', 'vitamina e', 'vitamina k', 'complejo b', 'calcio', 'magnesio', 'zinc', 'selenio'];
        composicion.categorias = ['multivitamínico', 'vitaminas', 'minerales', 'nutrición básica'];
        composicion.beneficios = ['nutrición completa', 'energía', 'defensas', 'huesos', 'piel'];
        composicion.usos = ['nutrición diaria', 'prevención', 'energía', 'defensas'];
        composicion.keywords = ['multivitamínico', 'vitaminas', 'minerales', 'nutrición', 'energía', 'defensas'];
    }

    // COENZIMA Q10
    else if (lowerFile.includes('co-q') || lowerTitle.includes('co-q')) {
        composicion.ingredientes = ['coenzima q10', 'ubiquinona', 'vitamina e'];
        composicion.categorias = ['energía celular', 'antioxidantes', 'corazón'];
        composicion.beneficios = ['energía celular', 'salud cardiovascular', 'antioxidante', 'encías'];
        composicion.usos = ['corazón', 'energía', 'encías', 'antienvejecimiento'];
        composicion.keywords = ['coenzima q10', 'ubiquinona', 'energía', 'corazón', 'antioxidante'];
    }

    // PROANTHENOLS (Extracto de semilla de uva)
    else if (lowerFile.includes('proanthenols') || lowerTitle.includes('proanthenols')) {
        composicion.ingredientes = ['extracto de semilla de uva', 'proantocianidinas', 'opc', 'bioflavonoides'];
        composicion.categorias = ['antioxidantes', 'bioflavonoides', 'antienvejecimiento'];
        composicion.beneficios = ['antioxidante potente', 'circulación', 'piel joven', 'visión', 'antienvejecimiento'];
        composicion.usos = ['antienvejecimiento', 'piel', 'circulación', 'visión', 'venas'];
        composicion.keywords = ['proanthenols', 'semilla de uva', 'antioxidante', 'opc', 'bioflavonoides'];
    }

    // CAL MAG PLUS
    else if (lowerFile.includes('cal mag') || lowerTitle.includes('cal mag')) {
        composicion.ingredientes = ['calcio', 'magnesio', 'vitamina d', 'vitamina k', 'zinc', 'cobre', 'manganeso'];
        composicion.categorias = ['minerales', 'salud ósea', 'huesos'];
        composicion.beneficios = ['huesos fuertes', 'dientes', 'musculatura', 'nervios', 'sueño'];
        composicion.usos = ['osteoporosis', 'huesos', 'dientes', 'calambres', 'estrés'];
        composicion.keywords = ['calcio', 'magnesio', 'vitamina d', 'huesos', 'osteoporosis', 'dientes'];
    }

    // HIERRO
    else if (lowerFile.includes('iron') || lowerTitle.includes('iron')) {
        composicion.ingredientes = ['hierro', 'vitamina c', 'ácido fólico', 'vitamina b12'];
        composicion.categorias = ['minerales', 'sangre', 'anemia'];
        composicion.beneficios = ['anemia', 'oxigenación', 'energía', 'cansancio'];
        composicion.usos = ['anemia ferropénica', 'fatiga', 'deporte', 'mujeres'];
        composicion.keywords = ['hierro', 'anemia', 'fatiga', 'oxigenación', 'energía'];
    }

    // VITAMINA C
    else if (lowerFile.includes('vitamin c') || lowerTitle.includes('vitamin c')) {
        composicion.ingredientes = ['vitamina c', 'bioflavonoides', 'rosa mosqueta', 'ácido ascórbico'];
        composicion.categorias = ['vitaminas', 'antioxidantes', 'defensas'];
        composicion.beneficios = ['defensas', 'antioxidante', 'colágeno', 'piel', 'cansancio'];
        composicion.usos = ['resfriados', 'defensas', 'piel', 'heridas', 'cansancio'];
        composicion.keywords = ['vitamina c', 'antioxidante', 'defensas', 'colágeno', 'cansancio'];
    }

    // VITAMINAS D Y K
    else if (lowerFile.includes('vitamins d k') || lowerTitle.includes('vitamins d k')) {
        composicion.ingredientes = ['vitamina d3', 'vitamina k2', 'calcio'];
        composicion.categorias = ['vitaminas', 'huesos', 'inmunidad'];
        composicion.beneficios = ['huesos fuertes', 'defensas', 'calcificación', 'corazón'];
        composicion.usos = ['huesos', 'osteoporosis', 'defensas', 'corazón'];
        composicion.keywords = ['vitamina d', 'vitamina k', 'huesos', 'osteoporosis', 'defensas'];
    }

    // COLÁGENO
    else if (lowerFile.includes('collagen') || lowerTitle.includes('collagen')) {
        composicion.ingredientes = ['colágeno hidrolizado', 'vitamina c', 'ácido hialurónico', 'biotina'];
        composicion.categorias = ['colágeno', 'piel', 'articulaciones', 'belleza'];
        composicion.beneficios = ['piel joven', 'articulaciones', 'cabello', 'uñas', 'arrugas'];
        composicion.usos = ['arrugas', 'articulaciones', 'cabello', 'uñas', 'flacidez'];
        composicion.keywords = ['colágeno', 'piel', 'arrugas', 'articulaciones', 'cabello'];
    }

    // TRIPLE PROTEIN
    else if (lowerFile.includes('triple protein') || lowerTitle.includes('triple protein')) {
        composicion.ingredientes = ['proteína de suero', 'proteína de soja', 'proteína de leche', 'aminoácidos', 'vitaminas'];
        composicion.categorias = ['proteínas', 'nutrición deportiva', 'deporte'];
        composicion.beneficios = ['masa muscular', 'recuperación', 'saciedad', 'energía'];
        composicion.usos = ['deporte', 'músculo', 'recuperación', 'dieta', 'saciedad'];
        composicion.keywords = ['proteína', 'deporte', 'músculo', 'recuperación', 'energía'];
    }

    // DNA IMMUNE
    else if (lowerFile.includes('dna immune') || lowerTitle.includes('dna immune')) {
        composicion.ingredientes = ['vitamina c', 'vitamina e', 'zinc', 'selenio', 'extractos vegetales'];
        composicion.categorias = ['sistema inmune', 'defensas', 'antioxidantes'];
        composicion.beneficios = ['inmunidad', 'defensas', 'antioxidante', 'adn'];
        composicion.usos = ['defensas bajas', 'infecciones', 'estrés oxidativo'];
        composicion.keywords = ['inmunidad', 'defensas', 'sistema inmune', 'antioxidante'];
    }

    // LUNG FORMULA
    else if (lowerFile.includes('lung') || lowerTitle.includes('lung')) {
        composicion.ingredientes = ['vitamina c', 'vitamina a', 'zinc', 'eucalipto', 'menta', 'extractos herbales'];
        composicion.categorias = ['respiratorio', 'pulmones', 'bronquios'];
        composicion.beneficios = ['sistema respiratorio', 'pulmones sanos', 'bronquios'];
        composicion.usos = ['pulmones', 'bronquios', 'resfriados', 'tos'];
        composicion.keywords = ['pulmones', 'respiratorio', 'bronquios', 'tos', 'resfriados'];
    }

    // PARACLEANSE
    else if (lowerFile.includes('paracleanse') || lowerTitle.includes('paracleanse')) {
        composicion.ingredientes = ['extractos antiparasitarios', 'ajo', 'nogal', 'genciana', 'clavo'];
        composicion.categorias = ['desintoxicación', 'parásitos', 'limpieza'];
        composicion.beneficios = ['limpieza parasitaria', 'sistema digestivo', 'desintoxicación'];
        composicion.usos = ['parásitos', 'limpieza intestinal', 'desintoxicación'];
        composicion.keywords = ['parásitos', 'limpieza', 'desintoxicación', 'intestinal'];
    }

    // PROSTATE FORMULA
    else if (lowerFile.includes('prostate') || lowerTitle.includes('prostate')) {
        composicion.ingredientes = ['saw palmetto', 'pygeum', 'zinc', 'selenio', 'beta-sitosterol'];
        composicion.categorias = ['salud masculina', 'próstata', 'hombres'];
        composicion.beneficios = ['próstata saludable', 'función urinaria', 'hombres mayores'];
        composicion.usos = ['próstata', 'orinar', 'hombres', 'nocturia'];
        composicion.keywords = ['próstata', 'hombres', 'orinar', 'salud masculina'];
    }

    // REAL NRG (Energía)
    else if (lowerFile.includes('real nrg') || lowerTitle.includes('real nrg')) {
        composicion.ingredientes = ['vitamina b', 'vitamina c', 'magnesio', 'potasio', 'guaraná', 'ginseng'];
        composicion.categorias = ['energía', 'fatiga', 'vitalidad'];
        composicion.beneficios = ['energía natural', 'vitalidad', 'fatiga', 'rendimiento'];
        composicion.usos = ['fatiga', 'energía', 'rendimiento', 'estrés'];
        composicion.keywords = ['energía', 'fatiga', 'vitalidad', 'rendimiento', 'estrés'];
    }

    // FUSIONS RED (Antioxidantes)
    else if (lowerFile.includes('fusions red') || lowerTitle.includes('fusions red')) {
        composicion.ingredientes = ['frutas rojas', 'arándanos', 'frambuesas', 'granada', 'vitamina c'];
        composicion.categorias = ['antioxidantes', 'frutas', 'superfoods'];
        composicion.beneficios = ['antioxidante', 'juventud', 'vitalidad', 'piel'];
        composicion.usos = ['antioxidante', 'piel joven', 'vitalidad', 'antiaging'];
        composicion.keywords = ['antioxidante', 'frutas rojas', 'arándanos', 'superfoods'];
    }

    // BE FOCUSED (Concentración)
    else if (lowerFile.includes('be focused') || lowerTitle.includes('be focused')) {
        composicion.ingredientes = ['l-teanina', 'vitamina b', 'vitamina c', 'magnesio', 'extractos herbales'];
        composicion.categorias = ['concentración', 'cerebro', 'cognición'];
        composicion.beneficios = ['concentración', 'memoria', 'enfoque', 'rendimiento mental'];
        composicion.usos = ['estudio', 'trabajo', 'concentración', 'memoria'];
        composicion.keywords = ['concentración', 'memoria', 'cerebro', 'enfoque', 'cognición'];
    }

    // BE RECHARGED (Energía)
    else if (lowerFile.includes('be recharged') || lowerTitle.includes('be recharged')) {
        composicion.ingredientes = ['vitamina b', 'vitamina c', 'magnesio', 'potasio', 'cafeína natural'];
        composicion.categorias = ['energía', 'rendimiento', 'vitalidad'];
        composicion.beneficios = ['energía rápida', 'rendimiento', 'vitalidad', 'hidratación'];
        composicion.usos = ['deporte', 'energía', 'rendimiento', 'hidratación'];
        composicion.keywords = ['energía', 'rendimiento', 'deporte', 'hidratación', 'vitalidad'];
    }

    // BIO LIGHT (Control de peso)
    else if (lowerFile.includes('bio light') || lowerTitle.includes('bio light')) {
        composicion.ingredientes = ['fibra', 'proteína', 'vitaminas', 'minerales', 'extractos quemagrasa'];
        composicion.categorias = ['control de peso', 'nutrición', 'dieta'];
        composicion.beneficios = ['control de peso', 'nutrición balanceada', 'saciedad'];
        composicion.usos = ['dieta', 'control de peso', 'nutrición', 'saciedad'];
        composicion.keywords = ['peso', 'dieta', 'nutrición', 'saciedad', 'control'];
    }

    // Si no se detectó nada específico, dar una composición general
    if (composicion.ingredientes.length === 0) {
        composicion.categorias.push('suplemento general', 'nutrición');
        composicion.beneficios.push('salud general', 'bienestar', 'nutrición');
        composicion.keywords.push('suplemento', 'salud', 'bienestar', 'nutrición');
    }

    return composicion;
}

// Procesar cada producto con mejor análisis
const productosMejorados = analisisData.pdfs.map(pdf => {
    console.log(`🔧 Mejorando: ${pdf.title}`);

    const composicionDetallada = getComposicionDetallada(pdf.filename, pdf.title);

    // Generar descripción enriquecida
    const descripcion = `Ficha técnica de ${pdf.title}. ${composicionDetallada.beneficios.join(', ')}. Ingredientes principales: ${composicionDetallada.ingredientes.slice(0, 3).join(', ')}.`;

    return {
        filename: pdf.filename,
        title: pdf.title,
        description: descripcion,
        category: composicionDetallada.categorias[0] || 'General',
        categories: composicionDetallada.categorias,
        ingredients: composicionDetallada.ingredientes,
        benefits: composicionDetallada.beneficios,
        uses: composicionDetallada.usos,
        keywords: composicionDetallada.keywords,
        filePath: pdf.filePath,
        fileSize: pdf.fileSize,
        uploadDate: pdf.uploadDate,
        downloadCount: pdf.downloadCount
    };
});

// Generar índice final mejorado
const indiceFinal = {
    success: true,
    generated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    version: '2.0-composicion-detallada',
    total_pdfs: productosMejorados.length,
    total_size: productosMejorados.reduce((sum, pdf) => sum + pdf.fileSize, 0),
    features: [
        'Búsqueda por ingredientes activos',
        'Búsqueda por beneficios',
        'Búsqueda por usos específicos',
        'Búsqueda por categorías',
        'Palabras clave optimizadas'
    ],
    pdfs: productosMejorados
};

// Guardar índice final
const finalPath = './data/pdf-index.json';
fs.writeFileSync(finalPath, JSON.stringify(indiceFinal, null, 2), 'utf8');

console.log('✅ Índice mejorado generado exitosamente');
console.log(`📊 Procesados ${productosMejorados.length} productos`);
console.log(`📁 Guardado en: ${finalPath}`);

// Mostrar estadísticas mejoradas
console.log('\n📈 ESTADÍSTICAS MEJORADAS:');
const categoriasCount = {};
const ingredientesCount = {};
const beneficiosCount = {};

productosMejorados.forEach(pdf => {
    // Contar categorías
    if (pdf.categories) {
        pdf.categories.forEach(cat => {
            categoriasCount[cat] = (categoriasCount[cat] || 0) + 1;
        });
    }

    // Contar ingredientes
    if (pdf.ingredients) {
        pdf.ingredients.forEach(ing => {
            ingredientesCount[ing] = (ingredientesCount[ing] || 0) + 1;
        });
    }

    // Contar beneficios
    if (pdf.benefits) {
        pdf.benefits.forEach(ben => {
            beneficiosCount[ben] = (beneficiosCount[ben] || 0) + 1;
        });
    }
});

console.log('\n🏷️ CATEGORÍAS PRINCIPALES:');
Object.entries(categoriasCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([categoria, count]) => {
        console.log(`   ${categoria}: ${count} productos`);
    });

console.log('\n🧪 INGREDIENTES MÁS COMUNES:');
Object.entries(ingredientesCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([ingrediente, count]) => {
        console.log(`   ${ingrediente}: ${count} productos`);
    });

console.log('\n💪 BENEFICIOS MÁS FRECUENTES:');
Object.entries(beneficiosCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([beneficio, count]) => {
        console.log(`   ${beneficio}: ${count} productos`);
    });

// Ejemplos de búsquedas que ahora funcionarán
console.log('\n🎯 EJEMPLOS DE BÚSQUEDAS QUE AHORA FUNCIONARÁN:');
console.log('✅ "omega 3" → Encontrará OMEGOLD, EPA PLUS, MANGO OMEGA');
console.log('✅ "colágeno" → Encontrará productos de colágeno');
console.log('✅ "vitamina c" → Encontrará todos los productos con vitamina C');
console.log('✅ "energía" → Encontrará REAL NRG, BE RECHARGED');
console.log('✅ "concentración" → Encontrará BE FOCUSED');
console.log('✅ "próstata" → Encontrará PROSTATE FORMULA');
console.log('✅ "antioxidante" → Encontrará PROANTHENOLS, FUSIONS RED');
console.log('✅ "huesos" → Encontrará CAL MAG PLUS, VITAMINAS D K');
console.log('✅ "defensas" → Encontrará DNA IMMUNE, vitamina C');

console.log('\n🚀 ¡EL ÍNDICE AHORA ESTÁ OPTIMIZADO PARA BÚSQUEDAS POR INGREDIENTES Y BENEFICIOS!');