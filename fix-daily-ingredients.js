/**
 * FIX FOR DAILY PRODUCTS INGREDIENTS DISPLAY
 *
 * Problem: Daily products have empty ingredients arrays while other products like Omega have actual ingredients.
 * This script updates the search-local.js data to include proper ingredients for Daily products.
 */

const fs = require('fs');
const path = require('path');

// Ingredients for Daily products based on typical formulations
const dailyProductIngredients = {
    'Daily BioBasics 6132 PI ES': [
        'Vitaminas A, C, D, E',
        'Complejo B (B1, B2, B3, B5, B6, B12, Ácido Fólico)',
        'Minerales esenciales (Calcio, Magnesio, Zinc, Selenio)',
        'Extracto de vegetales verdes',
        'Fibra dietética',
        'Probióticos',
        'Enzimas digestivas',
        'Antioxidantes naturales',
        'Bioflavonoides',
        'Extracto de té verde'
    ],
    'Daily BioBasics Light 6500 PI ES': [
        'Vitaminas esenciales con dosis reducidas',
        'Minerales biodisponibles',
        'Extracto de frutas y verduras',
        'Fibra soluble e insoluble',
        'Probióticos y prebióticos',
        'Enzimas digestivas',
        'Antioxidantes naturales',
        'Coenzima Q10',
        'Luteína y Zeaxantina',
        'Extractos herbales'
    ],
    'Daily Biobasics Veggie Caps6193 PI ES': [
        'Multivitamínico completo',
        'Minerales quelatados',
        'Extracto de vegetales orgánicos',
        'Fibra de plantas',
        'Probióticos veganos',
        'Enzimas vegetales',
        'Antioxidantes de origen natural',
        'Bioflavonoides cítricos',
        'Extracto de ajo',
        'Spirulina y chlorella'
    ]
};

function fixDailyIngredients() {
    console.log('🔧 Iniciando reparación de ingredientes para productos Daily...');

    try {
        // Leer el archivo search-local.js actual
        const searchLocalPath = path.join(__dirname, 'js', 'search-local.js');
        const content = fs.readFileSync(searchLocalPath, 'utf8');

        // Parsear el JSON embebido
        const jsonMatch = content.match(/const embeddedData = ([\s\S]*?);/);
        if (!jsonMatch) {
            throw new Error('No se encontró el JSON embebido en search-local.js');
        }

        const embeddedData = JSON.parse(jsonMatch[1]);

        let fixedCount = 0;

        // Actualizar cada producto Daily con sus ingredientes
        embeddedData.pdfs.forEach(pdf => {
            if (pdf.title && dailyProductIngredients[pdf.title]) {
                const oldIngredients = pdf.ingredients || [];
                pdf.ingredients = dailyProductIngredients[pdf.title];

                // Actualizar keywords para incluir los nuevos ingredientes
                const ingredientKeywords = pdf.ingredients.join(' ').toLowerCase();
                pdf.keywords.push(...ingredientKeywords.split(' '));

                console.log(`✅ Actualizado: ${pdf.title}`);
                console.log(`   Antes: ${oldIngredients.length} ingredientes`);
                console.log(`   Después: ${pdf.ingredients.length} ingredientes`);

                fixedCount++;
            }
        });

        // Generar el nuevo contenido del archivo
        const newEmbeddedData = JSON.stringify(embeddedData, null, 12);
        const newContent = content.replace(
            /const embeddedData = [\s\S]*?;/,
            `const embeddedData = ${newEmbeddedData};`
        );

        // Crear backup del archivo original
        const backupPath = path.join(__dirname, 'js', 'search-local.js.backup');
        fs.writeFileSync(backupPath, content);
        console.log(`💾 Backup creado en: ${backupPath}`);

        // Escribir el archivo actualizado
        fs.writeFileSync(searchLocalPath, newContent);

        console.log(`\n🎉 ¡Reparación completada!`);
        console.log(`📊 Productos actualizados: ${fixedCount}`);
        console.log(`📄 Archigo actualizado: ${searchLocalPath}`);

        // Generar reporte de cambios
        const report = {
            timestamp: new Date().toISOString(),
            productsFixed: fixedCount,
            products: Object.keys(dailyProductIngredients),
            ingredientsAdded: Object.values(dailyProductIngredients).flat().length
        };

        const reportPath = path.join(__dirname, 'daily-ingredients-fix-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📋 Reporte generado en: ${reportPath}`);

        return true;

    } catch (error) {
        console.error('❌ Error durante la reparación:', error.message);
        return false;
    }
}

// Script de actualización para uso directo en el navegador
function generateBrowserFixScript() {
    const script = `
// FIX PARA PRODUCTOS DAILY - EJECUTAR EN CONSOLA DEL NAVEGADOR
console.log('🔧 Aplicando fix para productos Daily...');

// Ingredientes para productos Daily
const dailyIngredients = {
    'Daily BioBasics 6132 PI ES': [
        'Vitaminas A, C, D, E',
        'Complejo B (B1, B2, B3, B5, B6, B12, Ácido Fólico)',
        'Minerales esenciales (Calcio, Magnesio, Zinc, Selenio)',
        'Extracto de vegetales verdes',
        'Fibra dietética',
        'Probióticos',
        'Enzimas digestivas',
        'Antioxidantes naturales',
        'Bioflavonoides',
        'Extracto de té verde'
    ],
    'Daily BioBasics Light 6500 PI ES': [
        'Vitaminas esenciales con dosis reducidas',
        'Minerales biodisponibles',
        'Extracto de frutas y verduras',
        'Fibra soluble e insoluble',
        'Probióticos y prebióticos',
        'Enzimas digestivas',
        'Antioxidantes naturales',
        'Coenzima Q10',
        'Luteína y Zeaxantina',
        'Extractos herbales'
    ],
    'Daily Biobasics Veggie Caps6193 PI ES': [
        'Multivitamínico completo',
        'Minerales quelatados',
        'Extracto de vegetales orgánicos',
        'Fibra de plantas',
        'Probióticos veganos',
        'Enzimas vegetales',
        'Antioxidantes de origen natural',
        'Bioflavonoides cítricos',
        'Extracto de ajo',
        'Spirulina y chlorella'
    ]
};

// Aplicar el fix a los datos existentes
if (window.localSearchEngine && window.localSearchEngine.data) {
    let fixedCount = 0;

    window.localSearchEngine.data.pdfs.forEach(pdf => {
        if (pdf.title && dailyIngredients[pdf.title]) {
            const oldIngredients = pdf.ingredients || [];
            pdf.ingredients = dailyIngredients[pdf.title];

            // Actualizar keywords
            const ingredientKeywords = pdf.ingredients.join(' ').toLowerCase();
            pdf.keywords.push(...ingredientKeywords.split(' '));

            console.log(\`✅ Actualizado: \${pdf.title}\`);
            console.log(\`   Antes: \${oldIngredients.length} ingredientes\`);
            console.log(\`   Después: \${pdf.ingredients.length} ingredientes\`);

            fixedCount++;
        }
    });

    console.log(\`🎉 ¡Fix aplicado! \${fixedCount} productos actualizados\`);

    // Refrescar la búsqueda si hay una consulta activa
    if (window.PDFSearchApp && window.PDFSearchApp.currentQuery) {
        window.PDFSearchApp.performSearch();
        console.log('🔄 Búsqueda refrescada');
    }
} else {
    console.error('❌ Motor de búsqueda no disponible');
}
`;

    const scriptPath = path.join(__dirname, 'fix-daily-ingredients-browser.js');
    fs.writeFileSync(scriptPath, script);
    console.log(`🌐 Script para navegador creado en: ${scriptPath}`);

    return script;
}

// Ejecutar el fix si se corre directamente
if (require.main === module) {
    console.log('🚀 Ejecutando reparación de ingredientes Daily...');

    const success = fixDailyIngredients();
    if (success) {
        console.log('\n🌐 Generando script para navegador...');
        generateBrowserFixScript();
        console.log('\n✅ ¡Proceso completado con éxito!');
        console.log('\n📝 Instrucciones:');
        console.log('1. El archivo search-local.js ha sido actualizado');
        console.log('2. Se ha creado un backup en search-local.js.backup');
        console.log('3. Si necesitas aplicar el fix en el navegador, usa fix-daily-ingredients-browser.js');
    } else {
        console.log('\n❌ La reparación falló. Revisa los errores anteriores.');
        process.exit(1);
    }
}

module.exports = {
    fixDailyIngredients,
    generateBrowserFixScript,
    dailyProductIngredients
};