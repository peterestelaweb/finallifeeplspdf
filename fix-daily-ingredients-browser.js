
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

            console.log(`✅ Actualizado: ${pdf.title}`);
            console.log(`   Antes: ${oldIngredients.length} ingredientes`);
            console.log(`   Después: ${pdf.ingredients.length} ingredientes`);

            fixedCount++;
        }
    });

    console.log(`🎉 ¡Fix aplicado! ${fixedCount} productos actualizados`);

    // Refrescar la búsqueda si hay una consulta activa
    if (window.PDFSearchApp && window.PDFSearchApp.currentQuery) {
        window.PDFSearchApp.performSearch();
        console.log('🔄 Búsqueda refrescada');
    }
} else {
    console.error('❌ Motor de búsqueda no disponible');
}
