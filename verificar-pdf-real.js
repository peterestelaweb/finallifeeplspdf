const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando si podemos leer PDFs reales...');

// Intentar leer un PDF específico para ver su contenido
const testPdf = './pdfs/OMEGOLD®.pdf';

console.log(`📄 Analizando: ${testPdf}`);

try {
    // Verificar si el archivo existe
    const stats = fs.statSync(testPdf);
    console.log(`✅ PDF existe, tamaño: ${stats.size} bytes`);

    // Intentar leer como texto para ver si hay información legible
    const buffer = fs.readFileSync(testPdf);
    const text = buffer.toString('utf8', 0, 2000); // Leer primeros 2000 caracteres

    console.log('\n📖 Primeros 500 caracteres del PDF:');
    console.log('=====================================');
    console.log(text.substring(0, 500));
    console.log('=====================================');

    // Buscar patrones de composición en el texto
    console.log('\n🔬 Buscando patrones de composición...');

    const patronesComposicion = [
        /ingredientes?\s*[:\-]?\s*([^\n\r]+)/gi,
        /composición\s*[:\-]?\s*([^\n\r]+)/gi,
        /cada\s+cápsula\s+contiene\s*([^\n\r]+)/gi,
        /serving\s+size\s*([^\n\r]+)/gi,
        /amount\s+per\s+serving\s*([^\n\r]+)/gi,
        /per\s+capsule\s*([^\n\r]+)/gi,
        /per\s+tablet\s*([^\n\r]+)/gi,
        /mg\s+of\s+([a-z\s]+)/gi,
        /mcg\s+of\s+([a-z\s]+)/gi,
        /iu\s+of\s+([a-z\s]+)/gi,
        /%\s+of\s+([a-z\s]+)/gi
    ];

    let encontrado = false;
    patronesComposicion.forEach((patron, index) => {
        const matches = text.match(patron);
        if (matches) {
            console.log(`✅ Patrón ${index + 1} encontrado: ${matches[0]}`);
            encontrado = true;
        }
    });

    if (!encontrado) {
        console.log('❌ No se encontraron patrones de composición en el texto legible');
        console.log('💡 Esto es normal - los PDFs suelen estar en formato binario');
    }

    // Verificar si es un PDF válido
    const pdfHeader = buffer.toString('utf8', 0, 10);
    if (pdfHeader.includes('%PDF')) {
        console.log('✅ Es un PDF válido');
    } else {
        console.log('❌ No parece ser un PDF válido');
    }

} catch (error) {
    console.error('❌ Error al leer el PDF:', error.message);
}

console.log('\n📋 CONCLUSIÓN:');
console.log('Los PDFs están en formato binario y no se pueden leer directamente como texto.');
console.log('Para extraer composición real necesitaríamos:');
console.log('1. Una librería PDF como pdf-parse o pdf2pic');
console.log('2. O procesamiento OCR si son imágenes escaneadas');
console.log('3. O indexación manual basada en las fichas técnicas reales');

// Crear un script para actualizar manualmente composición real
console.log('\n🔧 Creando sistema para actualizar composición manual...');