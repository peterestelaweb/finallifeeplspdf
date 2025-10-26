const fs = require('fs');
const path = require('path');

console.log('🔍 Generando índice PDF actualizado...');

// Directorios
const pdfsDir = './pdfs';
const dataDir = './data';

// Asegurar que el directorio data existe
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Leer todos los archivos PDF del directorio
try {
    const pdfFiles = fs.readdirSync(pdfsDir).filter(file =>
        file.toLowerCase().endsWith('.pdf')
    );

    console.log(`📄 Encontrados ${pdfFiles.length} archivos PDF`);

    // Generar datos para cada PDF
    const pdfData = pdfFiles.map((filename, index) => {
        // Limpiar nombre para título
        const cleanName = filename
            .replace(/\.pdf$/i, '')
            .replace(/®/g, '')
            .replace(/™/g, '')
            .trim();

        // Generar título
        const title = cleanName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        // Asignar categoría basada en el nombre
        let category = 'General';
        const lowerName = filename.toLowerCase();

        if (lowerName.includes('omega') || lowerName.includes('epa')) {
            category = 'Omega';
        } else if (lowerName.includes('vitamin') || lowerName.includes('daily')) {
            category = 'Vitaminas';
        } else if (lowerName.includes('mineral') || lowerName.includes('cal') || lowerName.includes('mag') || lowerName.includes('iron')) {
            category = 'Minerales';
        } else if (lowerName.includes('antioxid') || lowerName.includes('proanthenols')) {
            category = 'Antioxidantes';
        } else if (lowerName.includes('protein')) {
            category = 'Proteínas';
        } else if (lowerName.includes('energy') || lowerName.includes('nrg')) {
            category = 'Energía';
        } else if (lowerName.includes('immune') || lowerName.includes('zinc')) {
            category = 'Sistema Inmune';
        } else if (lowerName.includes('collagen')) {
            category = 'Colágeno';
        }

        // Obtener información del archivo
        const filePath = path.join(pdfsDir, filename);
        const stats = fs.statSync(filePath);

        return {
            filename: filename,
            title: title,
            description: `Ficha técnica de ${title}`,
            category: category,
            filePath: `pdfs/${filename}`,
            fileSize: stats.size,
            uploadDate: new Date(stats.mtime).toISOString(),
            downloadCount: Math.floor(Math.random() * 50) + 10 // Simular descargas
        };
    });

    // Calcular estadísticas
    const totalSize = pdfData.reduce((sum, pdf) => sum + pdf.fileSize, 0);
    const totalSizeMB = Math.round(totalSize / (1024 * 1024));

    // Crear objeto JSON
    const indexData = {
        success: true,
        generated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        total_pdfs: pdfData.length,
        total_size: totalSize,
        total_size_mb: totalSizeMB,
        pdfs: pdfData
    };

    // Guardar archivo JSON
    const jsonPath = path.join(dataDir, 'pdf-index.json');
    fs.writeFileSync(jsonPath, JSON.stringify(indexData, null, 2), 'utf8');

    console.log('✅ Índice PDF actualizado exitosamente');
    console.log(`📊 Total PDFs: ${pdfData.length}`);
    console.log(`💾 Tamaño total: ${totalSizeMB} MB`);
    console.log(`📁 Archivo guardado en: ${jsonPath}`);

    // Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de PDFs indexados:');
    pdfData.slice(0, 5).forEach(pdf => {
        console.log(`  - ${pdf.title} (${pdf.category})`);
    });

    // Verificar archivos Omega específicamente
    console.log('\n🔍 Archivos Omega encontrados:');
    const omegaFiles = pdfData.filter(pdf =>
        pdf.title.toLowerCase().includes('omega') ||
        pdf.title.toLowerCase().includes('epa') ||
        pdf.title.toLowerCase().includes('omegold')
    );

    omegaFiles.forEach(pdf => {
        console.log(`  ✅ ${pdf.title} - ${pdf.filename}`);
    });

} catch (error) {
    console.error('❌ Error al generar índice PDF:', error.message);
    process.exit(1);
}