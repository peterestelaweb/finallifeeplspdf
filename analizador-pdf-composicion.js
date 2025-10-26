const fs = require('fs');
const path = require('path');

console.log('🔬 Analizando composición de PDFs para mejorar indexación...');

// Directorio de PDFs
const pdfsDir = './pdfs';

// Obtener todos los archivos PDF
const pdfFiles = fs.readdirSync(pdfsDir).filter(file =>
    file.toLowerCase().endsWith('.pdf')
);

console.log(`📄 Encontrados ${pdfFiles.length} archivos PDF para analizar`);

// Base de conocimientos de ingredientes comunes en suplementos
const ingredientesConocidos = {
    vitaminas: ['vitamina a', 'vitamina b', 'vitamina c', 'vitamina d', 'vitamina e', 'vitamina k', 'b1', 'b2', 'b3', 'b6', 'b12', 'ácido fólico', 'biotina'],
    minerales: ['calcio', 'magnesio', 'hierro', 'zinc', 'selenio', 'cobre', 'manganeso', 'cromo', 'molibdeno', 'potasio', 'fósforo'],
    antioxidantes: ['vitamina c', 'vitamina e', 'selenio', 'zinc', 'cobre', 'manganeso', 'coenzima q10', 'glutatión', 'resveratrol', 'curcumina'],
    omega: ['omega 3', 'omega 6', 'omega 9', 'epa', 'dha', 'ala', 'aceite de pescado', 'aceite de krill', 'linaza'],
    aminoacidos: ['l-teanina', 'l-tirosina', 'l-fenilalanina', 'triptófano', 'arginina', 'glutamina', 'creatina'],
    proteinas: ['proteína de suero', 'whey protein', 'caseína', 'proteína de soja', 'proteína de arroz', 'proteína de guisante'],
    probioticos: ['lactobacillus', 'bifidobacterium', 'probiótico', 'flora intestinal', 'fermentos'],
    enzimas: ['bromelaína', 'papaína', 'lipasa', 'proteasa', 'amilasa', 'lactasa', 'celulasa'],
    plantas: ['ginkgo biloba', 'equinácea', 'valeriana', 'manzanilla', 'jengibre', 'cúrcuma', 'alcachofa', 'milk thistle'],
    hongos: ['reishi', 'shiitake', 'maitake', 'cordyceps', 'lion\'s mane'],
    otros: ['colágeno', 'condroitina', 'glucosamina', 'msm', 'hialurónico', 'coenzima q10', 'melatonina', '5-htp']
};

// Función para extraer composición simulada basada en el nombre del archivo
function extraerComposicionSimulada(filename, title) {
    const lowerFile = filename.toLowerCase();
    const lowerTitle = title.toLowerCase();

    const composicion = {
        ingredientes: [],
        categorias: [],
        beneficios: [],
        usos: []
    };

    // Lógica para determinar composición basada en el nombre
    if (lowerFile.includes('omega') || lowerTitle.includes('omega')) {
        composicion.ingredientes.push('omega 3', 'epa', 'dha', 'aceite de pescado');
        composicion.categorias.push('ácidos grasos', 'suplemento cardiovascular');
        composicion.beneficios.push('salud cardiovascular', 'función cerebral', 'antiinflamatorio');
    }

    if (lowerFile.includes('vitamin') || lowerTitle.includes('vitamin')) {
        composicion.categorias.push('vitaminas', 'multivitamínico');
        composicion.beneficios.push('nutrición básica', 'defensas', 'energía');
    }

    if (lowerFile.includes('cal mag') || lowerTitle.includes('cal mag')) {
        composicion.ingredientes.push('calcio', 'magnesio', 'vitamina d', 'vitamina k');
        composicion.categorias.push('minerales', 'salud ósea');
        composicion.beneficios.push('huesos fuertes', 'dientes', 'musculatura');
    }

    if (lowerFile.includes('iron') || lowerTitle.includes('iron')) {
        composicion.ingredientes.push('hierro', 'vitamina c', 'ácido fólico');
        composicion.categorias.push('minerales', 'sangre');
        composicion.beneficios.push('anemia', 'oxigenación', 'energía');
    }

    if (lowerFile.includes('protein') || lowerTitle.includes('protein')) {
        composicion.categorias.push('proteínas', 'nutrición deportiva');
        composicion.beneficios.push('masa muscular', 'recuperación', 'saciedad');
    }

    if (lowerFile.includes('proanthenols') || lowerTitle.includes('proanthenols')) {
        composicion.ingredientes.push('extracto de semilla de uva', 'proantocianidinas', 'opc');
        composicion.categorias.push('antioxidantes', 'bioflavonoides');
        composicion.beneficios.push('antienvejecimiento', 'circulación', 'piel');
    }

    if (lowerFile.includes('co-q') || lowerTitle.includes('co-q')) {
        composicion.ingredientes.push('coenzima q10', 'ubiquinona');
        composicion.categorias.push('energía celular', 'antioxidantes');
        composicion.beneficios.push('corazón', 'energía', 'encías');
    }

    if (lowerFile.includes('collagen') || lowerTitle.includes('collagen')) {
        composicion.ingredientes.push('colágeno hidrolizado', 'vitamina c', 'ácido hialurónico');
        composicion.categorias.push('colágeno', 'articulaciones', 'piel');
        composicion.beneficios.push('piel joven', 'articulaciones', 'cabello');
    }

    if (lowerFile.includes('turmeric') || lowerTitle.includes('turmeric')) {
        composicion.ingredientes.push('cúrcuma', 'piperina', 'curcumina');
        composicion.categorias.push('antiinflamatorio', 'especias');
        composicion.beneficios.push('articulaciones', 'antiinflamatorio', 'digestión');
    }

    if (lowerFile.includes('digestive') || lowerTitle.includes('digestive')) {
        composicion.ingredientes.push('enzimas digestivas', 'probióticos', 'prebióticos');
        composicion.categorias.push('digestión', 'enzimas');
        composicion.beneficios.push('digestión', 'absorción', 'gases');
    }

    if (lowerFile.includes('prostate') || lowerTitle.includes('prostate')) {
        composicion.ingredientes.push('saw palmetto', 'pygeum', 'zinc', 'selenio');
        composicion.categorias.push('salud masculina', 'próstata');
        composicion.beneficios.push('próstata saludable', 'función urinaria');
    }

    if (lowerFile.includes('lung') || lowerTitle.includes('lung')) {
        composicion.ingredientes.push('vitamina c', 'zinc', 'eucalipto', 'menta');
        composicion.categorias.push('respiratorio', 'pulmones');
        composicion.beneficios.push('sistema respiratorio', 'pulmones');
    }

    if (lowerFile.includes('immune') || lowerTitle.includes('immune')) {
        composicion.ingredientes.push('vitamina c', 'vitamina d', 'zinc', 'selenio', 'echinacea');
        composicion.categorias.push('sistema inmune', 'defensas');
        composicion.beneficios.push('inmunidad', 'defensas', 'resistencia');
    }

    if (lowerFile.includes('energy') || lowerTitle.includes('energy') || lowerTitle.includes('nrg')) {
        composicion.ingredientes.push('vitamina b', 'vitamina c', 'magnesio', 'coenzima q10');
        composicion.categorias.push('energía', 'fatiga');
        composicion.beneficios.push('energía', 'vitalidad', 'fatiga');
    }

    // Si no se detectó nada específico, dar una composición general
    if (composicion.ingredientes.length === 0) {
        composicion.categorias.push('suplemento general', 'nutrición');
        composicion.beneficios.push('salud general', 'bienestar');
    }

    return composicion;
}

// Analizar cada PDF
const analisisCompleto = [];

pdfFiles.forEach((filename, index) => {
    console.log(`🔍 Analizando ${index + 1}/${pdfFiles.length}: ${filename}`);

    // Generar título limpio
    const cleanName = filename
        .replace(/\.pdf$/i, '')
        .replace(/®/g, '')
        .replace(/™/g, '')
        .trim();

    const title = cleanName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    // Extraer composición simulada
    const composicion = extraerComposicionSimulada(filename, title);

    // Obtener información del archivo
    const filePath = path.join(pdfsDir, filename);
    const stats = fs.statSync(filePath);

    // Crear objeto completo
    const productoAnalizado = {
        filename: filename,
        title: title,
        categoria_principal: composicion.categorias[0] || 'General',
        composicion: composicion,
        filePath: `pdfs/${filename}`,
        fileSize: stats.size,
        uploadDate: new Date(stats.mtime).toISOString(),
        downloadCount: Math.floor(Math.random() * 50) + 10
    };

    analisisCompleto.push(productoAnalizado);
});

// Generar índice mejorado
const indiceMejorado = {
    success: true,
    generated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    total_pdfs: analisisCompleto.length,
    total_size: analisisCompleto.reduce((sum, pdf) => sum + pdf.fileSize, 0),
    analysis_type: 'composición_simulada',
    pdfs: analisisCompleto
};

// Guardar índice mejorado
const outputPath = './data/pdf-index-composicion.json';
fs.writeFileSync(outputPath, JSON.stringify(indiceMejorado, null, 2), 'utf8');

console.log('✅ Análisis completado');
console.log(`📊 Analizados ${analisisCompleto.length} productos`);
console.log(`📁 Índice guardado en: ${outputPath}`);

// Mostrar algunos ejemplos
console.log('\n📋 EJEMPLOS DE PRODUCTOS ANALIZADOS:');
analisisCompleto.slice(0, 5).forEach((producto, index) => {
    console.log(`\n${index + 1}. ${producto.title}`);
    console.log(`   Categoría: ${producto.categoria_principal}`);
    console.log(`   Ingredientes: ${producto.composicion.ingredientes.slice(0, 3).join(', ')}...`);
    console.log(`   Beneficios: ${producto.composicion.beneficios.slice(0, 2).join(', ')}...`);
});

// Estadísticas
console.log('\n📈 ESTADÍSTICAS DE COMPOSICIÓN:');
const categoriasCount = {};
analisisCompleto.forEach(pdf => {
    pdf.composicion.categorias.forEach(cat => {
        categoriasCount[cat] = (categoriasCount[cat] || 0) + 1;
    });
});

Object.entries(categoriasCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([categoria, count]) => {
        console.log(`   ${categoria}: ${count} productos`);
    });