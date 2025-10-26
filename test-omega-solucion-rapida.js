/**
 * PRUEBA RÁPIDA DE BÚSQUEDA OMEGA3/OMEGOLD
 * Simula la función performSearch modificada
 */

console.log('🧪 PRUEBA RÁPIDA DE BÚSQUEDA OMEGA3/OMEGOLD...');

// Simular datos PDFs
const datosPDFs = [
    {
        filename: "OMEGOLD.4999-PI_ES.pdf",
        title: "OMEGOLD.4999 PI ES",
        description: "Ficha técnica de OMEGOLD.4999 PI ES",
        category: "Omega"
    },
    {
        filename: "Vegan OmeGold 4998-PI_ES.pdf",
        title: "Vegan OmeGold 4998 PI ES",
        description: "Ficha técnica de Vegan OmeGold 4998 PI ES",
        category: "Omega"
    },
    {
        filename: "EPA-PLUS.pdf",
        title: "Epa Plus - OMEGA 3",
        description: "Ficha técnica de EPA PLUS",
        category: "Omega"
    },
    {
        filename: "Daily-BioBasics.pdf",
        title: "Daily BioBasics",
        description: "Ficha técnica de Daily BioBasics",
        category: "General"
    }
];

// Función performSearch modificada
function performSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    const resultados = datosPDFs.filter(pdf => {
        const texto = [
            pdf.title || '',
            pdf.filename || '',
            pdf.description || '',
            (pdf.keywords || []).join(' '),
            (pdf.tags || []).join(' '),
            pdf.category || ''
        ].join(' ').toLowerCase();

        // Búsqueda normal
        if (texto.includes(searchTerm)) {
            return true;
        }

        // Mapeo especial para OMEGA3/OMEGOLD
        const omegaTerms = [
            'omega3', 'omega 3', 'omega-3', 'omegold', 'vegan omegold',
            'aceite de pescado', 'epa', 'dha', 'ácidos grasos', 'omega'
        ];

        const isOmegaSearch = omegaTerms.some(term => searchTerm.includes(term));
        if (isOmegaSearch) {
            // Si es una búsqueda de omega, buscar productos relacionados
            const isOmegaProduct = texto.includes('omega') || texto.includes('omegold');
            return isOmegaProduct;
        }

        return false;
    });

    return resultados;
}

// Casos de prueba
const testCases = [
    { search: 'OMEGA3', expected: 3 },
    { search: 'OMEGA 3', expected: 3 },
    { search: 'OMEGOLD', expected: 2 },
    { search: 'VEGAN OMEGOLD', expected: 2 }, // También mostrará el normal
    { search: 'Daily', expected: 1 }
];

console.log('\n📋 EJECUTANDO PRUEBAS:\n');

let passedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. Buscar "${testCase.search}"`);

    const results = performSearch(testCase.search);
    console.log(`   Resultados: ${results.length}`);

    results.forEach((result, i) => {
        console.log(`   ${i + 1}. ${result.title}`);
    });

    if (results.length >= testCase.expected) {
        console.log(`   ✅ PASÓ (esperado ≥${testCase.expected})\n`);
        passedTests++;
    } else {
        console.log(`   ❌ FALLÓ (esperado ≥${testCase.expected})\n`);
    }
});

console.log(`📊 Resultados: ${passedTests}/${testCases.length} pruebas pasadas`);

if (passedTests === testCases.length) {
    console.log('\n🎉 ¡SOLUCIÓN FUNCIONANDO!');
    console.log('\n✅ Ahora cuando busques OMEGA3 en tu sitio web:');
    console.log('• OMEGOLD.4999 PI ES ✓');
    console.log('• Vegan OmeGold 4998 PI ES ✓');
    console.log('• Epa Plus - OMEGA 3 ✓');
    console.log('\n🌐 PASO FINAL: Sube el archivo modificado');
    console.log('   js/search-with-cards-CLEAN.js');
} else {
    console.log('\n⚠️ Revisa la implementación');
}