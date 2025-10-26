const fs = require('fs');
const path = require('path');

console.log('🔧 INDEXADOR AUTOMÁTICO PARA SERVIDOR');
console.log('=====================================\n');

// Configuración
const PDFS_DIR = './pdfs';
const INDEX_FILE = './data/pdf-index.json';
const SEARCH_LOCAL_FILE = './js/search-local.js';

// Función para verificar si un archivo existe
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

// Función para escanear archivos PDF que realmente existen
function scanExistingPDFs() {
    try {
        const files = fs.readdirSync(PDFS_DIR);
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        console.log(`📄 Archivos PDF encontrados: ${pdfFiles.length}`);
        return pdfFiles;
    } catch (error) {
        console.log('❌ Error al leer directorio pdfs/:', error.message);
        return [];
    }
}

// Función para cargar el índice actual
function loadCurrentIndex() {
    try {
        const data = fs.readFileSync(INDEX_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('❌ Error al cargar índice actual:', error.message);
        return null;
    }
}

// Función para limpiar el índice eliminando archivos que no existen
function cleanIndex(currentIndex, existingFiles) {
    const validPDFs = currentIndex.pdfs.filter(pdf => existingFiles.includes(pdf.filename));

    console.log(`📊 Índice original: ${currentIndex.pdfs.length} archivos`);
    console.log(`✅ Archivos válidos: ${validPDFs.length} archivos`);
    console.log(`🗑️  Archivos eliminados: ${currentIndex.pdfs.length - validPDFs.length} archivos`);

    // Actualizar el índice
    currentIndex.pdfs = validPDFs;
    currentIndex.total_pdfs = validPDFs.length;
    currentIndex.lastUpdate = new Date().toISOString();
    currentIndex.version = `cleaned-${Date.now()}`;

    return currentIndex;
}

// Función para actualizar search-local.js
function updateSearchLocalFile(cleanedIndex) {
    try {
        // Leer el archivo actual
        let content = fs.readFileSync(SEARCH_LOCAL_FILE, 'utf8');

        // Encontrar el inicio y fin del array de PDFs
        const startIndex = content.indexOf('"pdfs": [');
        const endIndex = content.indexOf('],\n  "success"');

        if (startIndex === -1 || endIndex === -1) {
            console.log('❌ No se pudo encontrar la sección de PDFs en search-local.js');
            return false;
        }

        // Reconstruir el archivo con el índice limpio
        const beforePdfs = content.substring(0, startIndex);
        const afterPdfs = content.substring(endIndex + 2);

        const newPdfsSection = JSON.stringify(cleanedIndex.pdfs, null, 2);
        const newContent = beforePdfs + '"pdfs": ' + newPdfs + afterPdfs;

        // Hacer backup
        fs.writeFileSync(SEARCH_LOCAL_FILE + '.backup', content);
        console.log('💾 Backup creado: search-local.js.backup');

        // Escribir el nuevo contenido
        fs.writeFileSync(SEARCH_LOCAL_FILE, newContent);
        console.log('✅ search-local.js actualizado');

        return true;
    } catch (error) {
        console.log('❌ Error al actualizar search-local.js:', error.message);
        return false;
    }
}

// Función principal
function main() {
    console.log('🔍 Iniciando limpieza de índices...\n');

    // 1. Escanear archivos existentes
    const existingFiles = scanExistingPDFs();
    if (existingFiles.length === 0) {
        console.log('❌ No se encontraron archivos PDF o el directorio no existe');
        return;
    }

    // 2. Cargar índice actual
    const currentIndex = loadCurrentIndex();
    if (!currentIndex) {
        console.log('❌ No se pudo cargar el índice actual');
        return;
    }

    // 3. Limpiar índice
    const cleanedIndex = cleanIndex(currentIndex, existingFiles);

    // 4. Guardar índice limpio
    try {
        fs.writeFileSync(INDEX_FILE, JSON.stringify(cleanedIndex, null, 2));
        console.log('✅ Índice pdf-index.json actualizado');
    } catch (error) {
        console.log('❌ Error al guardar índice limpio:', error.message);
        return;
    }

    // 5. Actualizar search-local.js
    const searchUpdated = updateSearchLocalFile(cleanedIndex);

    // 6. Mostrar resultados
    console.log('\n📋 RESUMEN DE LA LIMPIEZA:');
    console.log(`✅ Archivos PDF válidos: ${existingFiles.length}`);
    console.log(`✅ Índice actualizado: ${cleanedIndex.pdfs.length} productos`);
    console.log(`✅ search-local.js ${searchUpdated ? 'actualizado' : 'no actualizado'}`);

    console.log('\n🔍 Verificación:');
    console.log('Los siguientes archivos están indexados y existen:');
    cleanedIndex.pdfs.slice(0, 10).forEach((pdf, i) => {
        console.log(`   ${i+1}. ${pdf.title}`);
    });
    if (cleanedIndex.pdfs.length > 10) {
        console.log(`   ... y ${cleanedIndex.pdfs.length - 10} más`);
    }

    console.log('\n✨ ¡LIMPIEZA COMPLETADA!');
    console.log('🚀 El índice ahora solo contiene archivos que existen físicamente\n');

    // Mostrar archivos sugeridos para búsquedas de prueba
    console.log('🧪 SUGERENCIAS PARA PRUEBAS:');
    const testFiles = cleanedIndex.pdfs.filter(pdf =>
        pdf.title.toLowerCase().includes('omega') ||
        pdf.title.toLowerCase().includes('vitamin') ||
        pdf.title.toLowerCase().includes('protein')
    ).slice(0, 5);

    testFiles.forEach(pdf => {
        console.log(`   • Buscar: "${pdf.title.split(' ').slice(0, 2).join(' ')}"`);
    });
}

// Ejecutar
if (require.main === module) {
    main();
}

module.exports = { main, cleanIndex, updateSearchLocalFile };