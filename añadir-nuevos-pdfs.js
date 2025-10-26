const fs = require('fs');
const path = require('path');

console.log('🔧 Creando sistema para añadir nuevos PDFs fácilmente...');

// Función para escanear la carpeta PDFs y encontrar archivos nuevos
function escanearPDFsExistentes() {
    const pdfsDir = './pdfs';
    const archivos = fs.readdirSync(pdfsDir);
    const pdfFiles = archivos.filter(archivo => archivo.endsWith('.pdf'));

    console.log(`📄 Encontrados ${pdfFiles.length} archivos PDF en la carpeta`);
    return pdfFiles;
}

// Función para cargar el índice actual
function cargarIndiceActual() {
    try {
        const data = fs.readFileSync('./data/pdf-index.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('⚠️  No se encontró índice actual, creando uno nuevo...');
        return {
            success: true,
            version: "2.0-composicion-detallada",
            total_pdfs: 0,
            pdfs: []
        };
    }
}

// Función para encontrar PDFs nuevos
function encontrarPDFsNuevos(pdfsExistentes, indiceActual) {
    const pdfsActuales = new Set(indiceActual.pdfs.map(pdf => pdf.filename));
    const pdfsNuevos = pdfsExistentes.filter(pdf => !pdfsActuales.has(pdf));

    console.log(`🆕 Encontrados ${pdfsNuevos.length} PDFs nuevos para añadir`);
    return pdfsNuevos;
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
        fileSize = Math.floor(Math.random() * 500000) + 100000; // Tamaño aleatorio si no existe
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

// Función para analizar el nombre del PDF y sugerir ingredientes/beneficios
function analizarYAgregarComposicion(pdfData) {
    const nombre = pdfData.title.toLowerCase();
    const ingredientes = [];
    const beneficios = [];
    const categorias = [];
    const keywords = [...pdfData.keywords];

    // Análisis por patrones en el nombre
    const patronesIngredientes = {
        'omega': ['omega 3', 'omega 6', 'omega 9', 'epa', 'dha', 'aceite de pescado'],
        'vitamina': ['vitamina c', 'vitamina d', 'vitamina e', 'vitamina b', 'ácido fólico'],
        'colageno': ['colágeno hidrolizado', 'péptidos de colágeno', 'ácido hialurónico'],
        'proteina': ['proteína de suero', 'aminoácidos', 'bcaas'],
        'calcio': ['calcio', 'magnesio', 'vitamina d', 'zinc'],
        'hierro': ['hierro', 'vitamina c', 'ácido fólico'],
        'antioxidante': ['antioxidantes', 'polifenoles', 'vitamina e', 'selenio'],
        'probiotico': ['probióticos', 'bifidobacterias', 'lactobacillus'],
        'enzima': ['enzimas digestivas', 'bromelaina', 'papaina'],
        'mineral': ['zinc', 'selenio', 'cobre', 'manganeso']
    };

    const patronesBeneficios = {
        'inmune': ['sistema inmunitario', 'defensas', 'resistencia'],
        'energia': ['energía', 'vitalidad', 'fatiga', 'cansancio'],
        'articular': ['articulaciones', 'movilidad', 'flexibilidad'],
        'cardio': ['corazón', 'cardiovascular', 'circulación'],
        'cerebral': ['cerebro', 'cognición', 'memoria', 'concentración'],
        'digestivo': ['digestión', 'intestinal', 'microbiota'],
        'piel': ['piel', 'cabello', 'uñas', 'colágeno'],
        'hueso': ['huesos', 'óseo', 'densidad ósea'],
        'muscular': ['músculos', 'recuperación', 'rendimiento'],
        'estrés': ['estrés', 'relajación', 'sueño', 'ansiedad']
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
    if (pdfData.ingredients.some(ing => ing.includes('vitamina'))) {
        categorias.push('vitaminas');
    }
    if (pdfData.ingredients.some(ing => ing.includes('mineral') || ing.includes('calcio') || ing.includes('hierro'))) {
        categorias.push('minerales');
    }
    if (pdfData.ingredients.some(ing => ing.includes('probiotico') || ing.includes('bacteria'))) {
        categorias.push('probióticos');
    }
    if (pdfData.ingredients.some(ing => ing.includes('enzima'))) {
        categorias.push('enzimas');
    }

    pdfData.categories = categorias.length > 0 ? categorias : ["General"];
    pdfData.category = pdfData.categories[0];

    return pdfData;
}

// Función principal para añadir nuevos PDFs
function añadirNuevosPDFs() {
    console.log('🔍 Escaneando carpetas en busca de PDFs nuevos...\n');

    // Escanear archivos existentes
    const pdfsExistentes = escanearPDFsExistentes();

    // Cargar índice actual
    const indiceActual = cargarIndiceActual();
    console.log(`📊 Índice actual contiene ${indiceActual.pdfs.length} productos\n`);

    // Encontrar PDFs nuevos
    const pdfsNuevos = encontrarPDFsNuevos(pdfsExistentes, indiceActual);

    if (pdfsNuevos.length === 0) {
        console.log('✅ No hay PDFs nuevos para añadir');
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
        pdfData = analizarYAgregarComposicion(pdfData);

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

    // Guardar índice actualizado
    fs.writeFileSync('./data/pdf-index.json', JSON.stringify(indiceActual, null, 2));

    console.log('✅ Índice actualizado con éxito!');
    console.log(`📊 Total de productos en índice: ${indiceActual.total_pdfs}`);
    console.log(`🆕 Productos añadidos: ${nuevosPDFsDatos.length}`);

    // Mostrar resumen
    console.log('\n📋 RESUMEN DE PRODUCTOS AÑADIDOS:');
    nuevosPDFsDatos.forEach((pdf, index) => {
        console.log(`${index + 1}. ${pdf.title}`);
        console.log(`   Ingredientes: ${pdf.ingredients.slice(0, 3).join(', ')}${pdf.ingredients.length > 3 ? '...' : ''}`);
        console.log(`   Beneficios: ${pdf.benefits.slice(0, 2).join(', ')}${pdf.benefits.length > 2 ? '...' : ''}`);
        console.log('');
    });

    // Preguntar si se quiere actualizar la versión local
    console.log('🔄 Actualizando versión local para pruebas...');

    try {
        // Actualizar la versión local de búsqueda
        const searchLocalPath = './js/search-local.js';
        let searchLocalContent = fs.readFileSync(searchLocalPath, 'utf8');

        // Buscar y reemplazar el array de PDFs
        const pdfsJsonString = JSON.stringify(indiceActual.pdfs, null, 12);
        const regex = /this\.pdfs = \[[\s\S]*?\];/;

        if (regex.test(searchLocalContent)) {
            searchLocalContent = searchLocalContent.replace(regex, `this.pdfs = ${pdfsJsonString};`);
            fs.writeFileSync(searchLocalPath, searchLocalContent, 'utf8');
            console.log('✅ Versión local actualizada correctamente');
        } else {
            console.log('⚠️  No se pudo actualizar la versión local automáticamente');
        }
    } catch (error) {
        console.log('⚠️  Error al actualizar versión local:', error.message);
    }
}

// Ejecutar el proceso
try {
    añadirNuevosPDFs();

    console.log('\n🎉 PROCESO COMPLETADO!');
    console.log('📁 AHORA PUEDES:');
    console.log('✅ Probar la búsqueda en local abriendo index.html');
    console.log('✅ Ver los nuevos productos en los resultados');
    console.log('✅ Buscar por los nuevos ingredientes y beneficios');
    console.log('\n📝 PARA SUBIR AL SERVIDOR:');
    console.log('1. Sube los nuevos PDFs a la carpeta pdfs/');
    console.log('2. Sube el archivo data/pdf-index.json actualizado');
    console.log('3. Si usas search.js en servidor, asegúrate que pueda cargar el JSON');

} catch (error) {
    console.error('❌ Error en el proceso:', error.message);
    console.log('\n💡 SOLUCIONES:');
    console.log('1. Verifica que la carpeta pdfs/ exista');
    console.log('2. Verifica que tengas permisos de escritura');
    console.log('3. Crea la carpeta data/ si no existe');
}

console.log('\n' + '='.repeat(60));