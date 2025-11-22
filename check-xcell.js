const fs = require('fs');

// Cargar el índice de PDFs
const pdfIndex = JSON.parse(fs.readFileSync('./data/pdf-index.json', 'utf8'));

console.log('🔍 Buscando documentos X-CELL en el índice...');

// Buscar documentos que contengan X-CELL en cualquier parte
const xcellDocs = pdfIndex.pdfs.filter(pdf => {
    const title = pdf.title.toLowerCase();
    const filename = pdf.filename.toLowerCase();
    const description = (pdf.description || '').toLowerCase();

    return title.includes('x cell') ||
           title.includes('xcell') ||
           title.includes('x-cell') ||
           filename.includes('x cell') ||
           filename.includes('xcell') ||
           filename.includes('x-cell') ||
           description.includes('x cell') ||
           description.includes('xcell') ||
           description.includes('x-cell');
});

console.log(`📋 Se encontraron ${xcellDocs.length} documentos X-CELL:`);

if (xcellDocs.length > 0) {
    xcellDocs.forEach((doc, index) => {
        console.log(`${index + 1}. "${doc.title}"`);
        console.log(`   Filename: ${doc.filename}`);
        console.log(`   Categoría: ${doc.category}`);
        console.log(`   Descripción: ${doc.description || 'Sin descripción'}`);
        console.log('');
    });
} else {
    console.log('❌ No se encontraron documentos X-CELL en el índice');
}

// Mostrar algunos documentos aleatorios para ver qué hay en el índice
console.log('\n📋 Muestra de documentos en el índice:');
for (let i = 0; i < Math.min(10, pdfIndex.pdfs.length); i++) {
    const doc = pdfIndex.pdfs[i];
    console.log(`${i + 1}. "${doc.title}" (${doc.category})`);
}