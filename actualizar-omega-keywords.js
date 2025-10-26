const fs = require('fs');

console.log('🔧 Actualizando palabras clave para productos OMEGA...');

// Cargar el índice actual
const indexPath = './data/pdf-index.json';
const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

console.log(`📄 Índice cargado con ${data.pdfs.length} PDFs`);

// Actualizar productos OMEGA con palabras clave adicionales
const productosOmegaActualizados = data.pdfs.map(pdf => {
    const lowerTitle = pdf.title.toLowerCase();
    const lowerFilename = pdf.filename.toLowerCase();

    // Verificar si es un producto OMEGA
    if (lowerTitle.includes('omegold') || lowerFilename.includes('omegold')) {
        console.log(`🐟 Actualizando: ${pdf.title}`);

        return {
            ...pdf,
            title: pdf.title.includes('OMEGA 3') ? pdf.title : `${pdf.title} - OMEGA 3`,
            description: `Ficha técnica de ${pdf.title} - Aceite de pescado Omega 3 de alta pureza. Suplemento con ácidos grasos esenciales EPA y DHA para salud cardiovascular y cerebral.`,
            category: 'Omega',
            keywords: ['omega 3', 'aceite de pescado', 'epa', 'dha', 'ácidos grasos', 'omegold', 'salud cardiovascular', 'cerebral']
        };
    }

    // También actualizar EPA PLUS para mejor búsqueda
    if (lowerTitle.includes('epa') || lowerFilename.includes('epa')) {
        console.log(`🐟 Actualizando: ${pdf.title}`);

        return {
            ...pdf,
            title: `${pdf.title} - OMEGA 3`,
            description: `Ficha técnica de ${pdf.title} - Aceite de pescado con Omega 3 EPA. Suplemento con ácidos grasos esenciales para salud cardiovascular.`,
            category: 'Omega',
            keywords: ['omega 3', 'aceite de pescado', 'epa', 'ácidos grasos', 'salud cardiovascular', 'omega']
        };
    }

    return pdf;
});

// Crear el nuevo objeto de datos
const newData = {
    ...data,
    pdfs: productosOmegaActualizados,
    updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    notes: 'Actualizado con palabras clave OMEGA 3 y Aceite de Pescado para mejor búsqueda'
};

// Guardar el índice actualizado
fs.writeFileSync(indexPath, JSON.stringify(newData, null, 2), 'utf8');

console.log('✅ Índice actualizado exitosamente');

// Mostrar los productos OMEGA actualizados
console.log('\n🐟 PRODUCTOS OMEGA ACTUALIZADOS:');
const productosOmega = productosOmegaActualizados.filter(pdf =>
    pdf.title.toLowerCase().includes('omega') ||
    pdf.title.toLowerCase().includes('epa') ||
    pdf.title.toLowerCase().includes('omegold')
);

productosOmega.forEach((pdf, index) => {
    console.log(`\n${index + 1}. ${pdf.title}`);
    console.log(`   Archivo: ${pdf.filename}`);
    console.log(`   Categoría: ${pdf.category}`);
    console.log(`   Descripción: ${pdf.description}`);
    if (pdf.keywords) {
        console.log(`   Keywords: ${pdf.keywords.join(', ')}`);
    }
});

// Probar búsquedas
console.log('\n🧪 PRUEBA DE BÚSQUEDA SIMULADA:');
const terminosBusqueda = ['omega3', 'omega 3', 'aceite de pescado', 'omegold', 'epa'];

terminosBusqueda.forEach(termino => {
    const resultados = productosOmegaActualizados.filter(pdf =>
        pdf.title.toLowerCase().includes(termino) ||
        pdf.description.toLowerCase().includes(termino) ||
        pdf.filename.toLowerCase().includes(termino) ||
        (pdf.keywords && pdf.keywords.some(k => k.toLowerCase().includes(termino)))
    );

    console.log(`"${termino}": ${resultados.length} resultados`);
    if (resultados.length > 0) {
        resultados.forEach(r => console.log(`  ✅ ${r.title}`));
    }
});

console.log('\n🎯 AHORA CUANDO SUBAS ESTOS ARCHIVOS A TU SERVIDOR:');
console.log('✅ "omegold" → Encontrará OMEGOLD');
console.log('✅ "omega 3" → Encontrará OMEGOLD y EPA PLUS');
console.log('✅ "aceite de pescado" → Encontrará OMEGOLD y EPA PLUS');
console.log('✅ "epa" → Encontrará EPA PLUS');

console.log('\n📁 ARCHIVO A SUBIR: data/pdf-index.json');