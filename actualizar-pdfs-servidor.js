const fs = require('fs');
const path = require('path');

console.log('🔧 ACTUALIZADOR AUTOMÁTICO PARA SERVIDOR');
console.log('========================================\n');

// Función para escanear carpeta PDFs y encontrar archivos nuevos
function escanearPDFsExistentes() {
    const pdfsDir = './pdfs';
    try {
        const archivos = fs.readdirSync(pdfsDir);
        const pdfFiles = archivos.filter(archivo => archivo.endsWith('.pdf'));
        console.log(`📄 Encontrados ${pdfFiles.length} archivos PDF en la carpeta`);
        return pdfFiles;
    } catch (error) {
        console.log('❌ Error al leer carpeta pdfs/:', error.message);
        return [];
    }
}

// Función para cargar el índice actual
function cargarIndiceActual() {
    try {
        const data = fs.readFileSync('./data/pdf-index.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('❌ No se encontró data/pdf-index.json');
        console.log('💡 Primero ejecuta: node inicializar-indice.js');
        return null;
    }
}

// Función para generar datos básicos de un PDF
function generarDatosPDF(filename) {
    const nombreBase = path.parse(filename).name;
    const titulo = nombreBase
        .replace(/®/g, '')
        .replace(/™/g, '')
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Generar tamaño estimado
    const filePath = `./pdfs/${filename}`;
    let fileSize = 0;
    try {
        const stats = fs.statSync(filePath);
        fileSize = stats.size;
    } catch (error) {
        console.log(`⚠️  No se pudo leer tamaño de ${filename}, usando estimado`);
        fileSize = Math.floor(Math.random() * 500000) + 100000;
    }

    return {
        filename: filename,
        title: titulo,
        description: `Ficha técnica de ${titulo}`,
        filePath: `pdfs/${filename}`,
        fileSize: fileSize,
        uploadDate: new Date().toISOString(),
        category: "General",
        categories: ["General"],
        ingredients: [],
        benefits: [],
        keywords: [titulo.toLowerCase()],
        downloadCount: 0
    };
}

// Función para analizar el nombre del PDF y sugerir contenido
function analizarYGenerarContenido(pdfData) {
    const nombre = pdfData.title.toLowerCase();
    const ingredientes = [];
    const beneficios = [];
    const categorias = [];
    const keywords = [...pdfData.keywords];

    // Análisis por patrones en el nombre
    const patronesIngredientes = {
        'omega': ['omega 3', 'omega 6', 'omega 9', 'epa', 'dha', 'aceite de pescado', 'ácidos grasos esenciales'],
        'vitamin': ['vitaminas', 'multivitamínico'],
        'vit c': ['vitamina c', 'ácido ascórbico'],
        'vit d': ['vitamina d', 'colecalciferol'],
        'calcio': ['calcio', 'mineral óseo'],
        'hierro': ['hierro', 'mineral'],
        'zinc': ['zinc', 'mineral'],
        'magnesio': ['magnesio', 'mineral'],
        'colagen': ['colágeno', 'proteína', 'tejido conectivo'],
        'proteina': ['proteína', 'aminoácidos', 'bcaas'],
        'coenzima': ['coenzima q10', 'antioxidante'],
        'probiotico': ['probióticos', 'bifidobacterias', 'lactobacillus'],
        'enzima': ['enzimas digestivas', 'bromelaina', 'papaina'],
        'antioxidante': ['antioxidantes', 'polifenoles', 'vitamina e', 'selenio'],
        'ginkgo': ['ginkgo biloba', 'circulación', 'memoria'],
        'ginseng': ['ginseng', 'energía', 'vitalidad'],
        'echinacea': ['echinacea', 'sistema inmunitario', 'defensas'],
        'te verde': ['té verde', 'antioxidantes', 'catequinas'],
        'curcuma': ['cúrcuma', 'curcumina', 'antiinflamatorio'],
        'resveratrol': ['resveratrol', 'antienvejecimiento', 'antioxidante'],
        'ashwagandha': ['ashwagandha', 'adaptógeno', 'estrés', 'relajación'],
        'maca': ['maca', 'energía', 'vitalidad', 'libido'],
        'espirulina': ['espirulina', 'alga', 'proteína', 'clorofila'],
        'chlorella': ['chlorella', 'alga', 'desintoxicación', 'clorofila']
    };

    const patronesBeneficios = {
        'inmune': ['sistema inmunitario', 'defensas', 'resistencia a infecciones'],
        'energia': ['energía', 'vitalidad', 'combatir fatiga', 'rendimiento físico'],
        'articular': ['articulaciones', 'movilidad', 'flexibilidad', 'cartílago'],
        'cardio': ['corazón', 'cardiovascular', 'circulación', 'presión arterial'],
        'cerebral': ['cerebro', 'cognición', 'memoria', 'concentración', 'función mental'],
        'digestivo': ['digestión', 'intestinal', 'microbiota', 'tránsito intestinal'],
        'piel': ['piel', 'cabello', 'uñas', 'colágeno', 'elastina'],
        'hueso': ['huesos', 'densidad ósea', 'esqueleto', 'osteoporosis'],
        'muscular': ['músculos', 'recuperación', 'rendimiento deportivo', 'masa muscular'],
        'estrés': ['estrés', 'relajación', 'ansiedad', 'bienestar emocional', 'sueño'],
        'antienvejecimiento': ['antienvejecimiento', 'longevidad', 'juventud', 'celulas'],
        'detox': ['desintoxicación', 'limpieza', 'hígado', 'riñones'],
        'sueño': ['sueño', 'descanso', 'insomnio', 'calidad del sueño'],
        'libido': ['libido', 'función sexual', 'fertilidad', 'hormonas'],
        'peso': ['peso', 'metabolismo', 'grasa', 'quema calorías'],
        'vista': ['vista', 'ojos', 'retina', 'visión'],
        'oido': ['oido', 'audición', 'oído interno']
    };

    // Buscar coincidencias
    Object.entries(patronesIngredientes).forEach(([patron, ings]) => {
        if (nombre.includes(patron)) {
            ingredientes.push(...ings);
            keywords.push(...ings);
        }
    });

    Object.entries(patronesBeneficios).forEach(([patron, benefs]) => {
        if (nombre.includes(patron)) {
            beneficios.push(...benefs);
            keywords.push(...benefs);
        }
    });

    // Eliminar duplicados
    pdfData.ingredients = [...new Set(ingredientes)];
    pdfData.benefits = [...new Set(beneficios)];
    pdfData.keywords = [...new Set(keywords)];

    // Asignar categorías basadas en ingredientes
    if (pdfData.ingredients.some(ing => ing.includes('omega') || ing.includes('aceite'))) {
        categorias.push('ácidos grasos');
    }
    if (pdfData.ingredients.some(ing => ing.includes('vitamin'))) {
        categorias.push('vitaminas');
    }
    if (pdfData.ingredients.some(ing => ing.includes('calcio') || ing.includes('hierro') || ing.includes('zinc'))) {
        categorias.push('minerales');
    }
    if (pdfData.ingredients.some(ing => ing.includes('probiotico') || ing.includes('bacteria'))) {
        categorias.push('probióticos');
    }
    if (pdfData.ingredients.some(ing => ing.includes('enzima'))) {
        categorias.push('enzimas');
    }
    if (pdfData.ingredients.some(ing => ing.includes('colagen') || ing.includes('proteína'))) {
        categorias.push('proteínas');
    }
    if (pdfData.ingredients.some(ing => ing.includes('antioxidante'))) {
        categorias.push('antioxidantes');
    }

    pdfData.categories = categorias.length > 0 ? categorias : ["General"];
    pdfData.category = pdfData.categories[0];

    return pdfData;
}

// Función principal para actualizar PDFs
function actualizarPDFs() {
    console.log('🔍 Buscando PDFs nuevos en la carpeta...\n');

    // Escanear archivos existentes
    const pdfsExistentes = escanearPDFsExistentes();

    // Cargar índice actual
    const indiceActual = cargarIndiceActual();
    if (!indiceActual) {
        console.log('❌ No se pudo cargar el índice actual');
        console.log('💡 Asegúrate de que data/pdf-index.json exista en el servidor');
        return;
    }

    console.log(`📊 Índice actual contiene ${indiceActual.pdfs.length} productos\n`);

    // Crear conjunto de archivos ya indexados
    const archivosIndexados = new Set(indiceActual.pdfs.map(pdf => pdf.filename));

    // Encontrar PDFs nuevos
    const pdfsNuevos = pdfsExistentes.filter(pdf => !archivosIndexados.has(pdf));

    if (pdfsNuevos.length === 0) {
        console.log('✅ No hay PDFs nuevos para añadir');
        console.log('📁 La carpeta pdfs/ está actualizada');
        return;
    }

    console.log('🆕 PDFs nuevos encontrados:');
    pdfsNuevos.forEach((pdf, index) => {
        console.log(`   ${index + 1}. ${pdf}`);
    });
    console.log('');

    // Procesar cada PDF nuevo
    const nuevosPDFsDatos = pdfsNuevos.map(filename => {
        console.log(`📄 Procesando: ${filename}`);
        let pdfData = generarDatosPDF(filename);
        pdfData = analizarYGenerarContenido(pdfData);

        console.log(`   📝 Título: ${pdfData.title}`);
        console.log(`   🧪 Ingredientes: ${pdfData.ingredients.length}`);
        console.log(`   ❤️  Beneficios: ${pdfData.benefits.length}`);
        console.log(`   🏷️  Categorías: ${pdfData.categories.join(', ')}`);
        console.log('');

        return pdfData;
    });

    // Añadir al índice
    indiceActual.pdfs.push(...nuevosPDFsDatos);
    indiceActual.total_pdfs = indiceActual.pdfs.length;
    indiceActual.lastUpdate = new Date().toISOString();
    indiceActual.version = `${indiceActual.version.split('-')[0]}-${Date.now()}`;

    // Hacer backup del archivo anterior
    const backupPath = `./data/pdf-index-backup-${Date.now()}.json`;
    try {
        fs.copyFileSync('./data/pdf-index.json', backupPath);
        console.log(`💾 Backup creado en: ${backupPath}`);
    } catch (error) {
        console.log('⚠️  No se pudo crear backup:', error.message);
    }

    // Guardar el nuevo índice
    fs.writeFileSync('./data/pdf-index.json', JSON.stringify(indiceActual, null, 2));

    console.log('✅ Índice actualizado con éxito!');
    console.log(`📊 Total de productos: ${indiceActual.total_pdfs}`);
    console.log(`🆕 Productos añadidos: ${nuevosPDFsDatos.length}`);

    // Mostrar resumen de productos añadidos
    console.log('\n📋 RESUMEN DE PRODUCTOS AÑADIDOS:');
    nuevosPDFsDatos.forEach((pdf, index) => {
        console.log(`${index + 1}. ${pdf.title}`);
        console.log(`   Ingredientes: ${pdf.ingredients.slice(0, 3).join(', ')}${pdf.ingredients.length > 3 ? '...' : ''}`);
        console.log(`   Beneficios: ${pdf.benefits.slice(0, 2).join(', ')}${pdf.benefits.length > 2 ? '...' : ''}`);
        console.log('');
    });

    console.log('🔍 Pruebas recomendadas:');
    nuevosPDFsDatos.forEach(pdf => {
        if (pdf.keywords.length > 0) {
            console.log(`   • Buscar: "${pdf.keywords[0]}"`);
        }
    });

    console.log('\n✨ ¡ACTUALIZACIÓN COMPLETADA!');
    console.log('🚀 Los nuevos productos ya están disponibles en la búsqueda\n');

    // Generar instrucciones para el usuario
    console.log('📝 PRÓXIMOS PASOS:');
    console.log('1. Refresca tu sitio web');
    console.log('2. Prueba las búsquedas sugeridas arriba');
    console.log('3. Los nuevos productos deberían aparecer en los resultados\n');
}

// Función para inicializar un nuevo índice si no existe
function inicializarIndice() {
    console.log('🔧 Creando nuevo índice...\n');

    const pdfs = escanearPDFsExistentes();

    const indice = {
        success: true,
        version: "1.0-inicial",
        total_pdfs: pdfs.length,
        pdfs: pdfs.map(filename => {
            const pdfData = generarDatosPDF(filename);
            return analizarYGenerarContenido(pdfData);
        })
    };

    fs.writeFileSync('./data/pdf-index.json', JSON.stringify(indice, null, 2));

    console.log('✅ Nuevo índice creado con éxito!');
    console.log(`📊 Productos indexados: ${indice.total_pdfs}`);
}

// Mostrar ayuda
function mostrarAyuda() {
    console.log('📖 AYUDA - ACTUALIZADOR AUTOMÁTICO PARA SERVIDOR');
    console.log('='.repeat(60));
    console.log('\n🚀 USO:');
    console.log('   node actualizar-pdfs-servidor.js');
    console.log('\n📋 DESCRIPCIÓN:');
    console.log('   Escanea la carpeta pdfs/ y actualiza automáticamente');
    console.log('   el índice data/pdf-index.json con los PDFs nuevos encontrados.');
    console.log('\n📁 REQUISITOS:');
    console.log('   • Tener Node.js instalado en el servidor');
    console.log('   • La carpeta pdfs/ debe existir');
    console.log('   • El archivo data/pdf-index.json debe existir');
    console.log('\n🔧 FUNCIONAMIENTO:');
    console.log('   1. Escanea todos los PDFs en pdfs/');
    console.log('   2. Compara con el índice actual');
    console.log('   3. Detecta PDFs nuevos');
    console.log('   4. Genera datos automáticamente');
    console.log('   5. Actualiza el índice');
    console.log('   6. Crea backup del índice anterior');
    console.log('\n💡 OPCIONES ADICIONALES:');
    console.log('   • Si no existe data/pdf-index.json, usa --inicializar');
    console.log('   • Para ver ayuda: --help');
    console.log('\n📝 EJEMPLO:');
    console.log('   # Subir nuevo PDF a pdfs/');
    console.log('   scp nuevo-producto.pdf servidor:/ruta/pdfs/');
    console.log('   # Ejecutar actualizador');
    console.log('   ssh servidor');
    console.log('   cd /ruta/proyecto');
    console.log('   node actualizar-pdfs-servidor.js');
    console.log('\n');
}

// Main function
function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        mostrarAyuda();
        return;
    }

    if (args.includes('--inicializar') || args.includes('-i')) {
        inicializarIndice();
        return;
    }

    try {
        actualizarPDFs();
    } catch (error) {
        console.log('❌ Error en la ejecución:', error.message);
        console.log('\n💡 SOLUCIONES:');
        console.log('1. Verifica que la carpeta pdfs/ exista');
        console.log('2. Verifica que data/pdf-index.json exista');
        console.log('3. Verifica permisos de escritura');
        console.log('4. Si es la primera vez, usa: node actualizar-pdfs-servidor.js --inicializar');
    }
}

// Ejecutar
main();