const fs = require('fs');

// Cargar el índice de PDFs
const pdfIndex = JSON.parse(fs.readFileSync('./data/pdf-index.json', 'utf8'));

console.log('🔍 Analizando problema de búsqueda con múltiples palabras...');

// Buscar documentos relacionados con PETS
const petsDocs = pdfIndex.pdfs.filter(pdf => {
    const title = pdf.title.toLowerCase();
    const filename = pdf.filename.toLowerCase();
    const description = (pdf.description || '').toLowerCase();

    return title.includes('pets') || filename.includes('pets') || description.includes('pets');
});

console.log(`📋 Se encontraron ${petsDocs.length} documentos PETS:`);
petsDocs.forEach((doc, index) => {
    console.log(`${index + 1}. "${doc.title}"`);
    console.log(`   Categoría: ${doc.category}`);
    console.log('');
});

// Buscar documentos relacionados con MOVE
const moveDocs = pdfIndex.pdfs.filter(pdf => {
    const title = pdf.title.toLowerCase();
    const filename = pdf.filename.toLowerCase();
    const description = (pdf.description || '').toLowerCase();

    return title.includes('move') || filename.includes('move') || description.includes('move');
});

console.log(`📋 Se encontraron ${moveDocs.length} documentos MOVE:`);
moveDocs.forEach((doc, index) => {
    console.log(`${index + 1}. "${doc.title}"`);
    console.log(`   Categoría: ${doc.category}`);
    console.log('');
});

// Buscar documentos que contengan ambas palabras (PETS Y MOVE)
const petsMoveDocs = pdfIndex.pdfs.filter(pdf => {
    const title = pdf.title.toLowerCase();
    const filename = pdf.filename.toLowerCase();
    const description = (pdf.description || '').toLowerCase();

    return (title.includes('pets') && title.includes('move')) ||
           (filename.includes('pets') && filename.includes('move')) ||
           (description.includes('pets') && description.includes('move'));
});

console.log(`📋 Se encontraron ${petsMoveDocs.length} documentos con PETS y MOVE:`);
petsMoveDocs.forEach((doc, index) => {
    console.log(`${index + 1}. "${doc.title}"`);
    console.log(`   Categoría: ${doc.category}`);
    console.log('');
});

// Simular búsqueda actual de "PETS MOVE"
console.log('🧪 Simulando búsqueda actual de "PETS MOVE":');
console.log('❌ Comportamiento actual: Muestra TODOS los PETS (incorrecto)');
console.log('✅ Comportamiento deseado: Muestra solo PETS MOVE (correcto)');

// Mostrar algunos documentos DAILY para análisis similar
const dailyDocs = pdfIndex.pdfs.filter(pdf => {
    const title = pdf.title.toLowerCase();
    return title.includes('daily');
});

console.log(`📋 Se encontraron ${dailyDocs.length} documentos DAILY:`);
dailyDocs.slice(0, 5).forEach((doc, index) => {
    console.log(`${index + 1}. "${doc.title}"`);
});