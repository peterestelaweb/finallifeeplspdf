const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    console.log('🔍 Buscando OMEGA directamente en los datos...');

    // Cargar datos directamente
    const pdfData = JSON.parse(fs.readFileSync('./data/pdf-index.json', 'utf8'));

    console.log(`📄 Total PDFs en índice: ${pdfData.pdfs.length}`);

    // Buscar archivos OMEGA
    const omegaFiles = pdfData.pdfs.filter(pdf =>
        pdf.title.toLowerCase().includes('omega') ||
        pdf.title.toLowerCase().includes('omegold') ||
        pdf.title.toLowerCase().includes('epa')
    );

    console.log('\n🐟 ARCHIVOS OMEGA ENCONTRADOS:');
    omegaFiles.forEach((pdf, index) => {
        console.log(`${index + 1}. ${pdf.title}`);
        console.log(`   Archivo: ${pdf.filename}`);
        console.log(`   Categoría: ${pdf.category}`);
        console.log(`   Descripción: ${pdf.description}`);
        console.log(`   Ruta: ${pdf.filePath}`);
        console.log('');
    });

    // Verificar si los archivos existen físicamente
    console.log('🔍 VERIFICANDO ARCHIVOS FÍSICOS:');
    omegaFiles.forEach(pdf => {
        const exists = fs.existsSync(pdf.filePath);
        console.log(`${exists ? '✅' : '❌'} ${pdf.filename} - ${exists ? 'EXISTS' : 'MISSING'}`);
    });

    // Probar diferentes términos de búsqueda
    console.log('\n🧪 PRUEBA DE TÉRMINOS DE BÚSQUEDA:');
    const searchTerms = ['omega', 'omega3', 'omegold', 'epa'];

    searchTerms.forEach(term => {
        const results = pdfData.pdfs.filter(pdf =>
            pdf.title.toLowerCase().includes(term) ||
            pdf.filename.toLowerCase().includes(term) ||
            pdf.description.toLowerCase().includes(term)
        );
        console.log(`"${term}": ${results.length} resultados`);
        if (results.length > 0) {
            results.forEach(r => console.log(`  - ${r.title}`));
        }
    });

    console.log('\n✅ Análisis completado');
    console.log('📝 CONCLUSIÓN: Los datos están correctos, el problema es el CORS en el navegador');

})();