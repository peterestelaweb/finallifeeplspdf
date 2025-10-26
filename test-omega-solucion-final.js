/**
 * PRUEBA FINAL ABSOLUTA - SOLUCIÓN DEFINITIVA
 * Verifica cada caso específico con la lógica corregida
 */

console.log('🧪 PRUEBA FINAL ABSOLUTA - SOLUCIÓN DEFINITIVA...');

// Datos de prueba
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
        description: "Contiene vitaminas y omega-3 entre otros ingredientes",
        category: "General"
    },
    {
        filename: "Vitamin-C.pdf",
        title: "Vitamin C Plus",
        description: "Vitamina C con omega-3 natural",
        category: "Vitaminas"
    },
    {
        filename: "Proanthenols.pdf",
        title: "Proanthenols OPC",
        description: "Antioxidante potente",
        category: "Antioxidantes"
    }
];

// Función performSearch con lógica específica
function performSearch(query) {
    const searchTerm = query.toLowerCase().trim();

    // Primero verificar si es una búsqueda especial OMEGA
    const omegaSpecificTerms = [
        'omega3', 'omega 3', 'omega-3', 'omegold', 'vegan omegold',
        'aceite de pescado', 'epa', 'dha', 'ácidos grasos'
    ];

    const isOmegaSearch = omegaSpecificTerms.some(term => searchTerm.includes(term));

    const resultados = datosPDFs.filter(pdf => {
        // SI es búsqueda OMEGA específica (OMEGA3, OMEGOLD, etc.), usar lógica especial
        if (isOmegaSearch) {
            const hasOmegaInTitle = (pdf.title || '').toLowerCase().includes('omega');
            const hasOmegoldInTitle = (pdf.title || '').toLowerCase().includes('omegold');
            const hasOmegaInFilename = (pdf.filename || '').toLowerCase().includes('omega');
            const hasOmegoldInFilename = (pdf.filename || '').toLowerCase().includes('omegold');
            const hasOmegaInCategory = (pdf.category || '').toLowerCase() === 'omega';

            // Lógica específica según término de búsqueda
            if (searchTerm.includes('omegold')) {
                // Si busca OMEGOLD, solo mostrar productos con OMEGOLD
                return hasOmegoldInTitle || hasOmegoldInFilename;
            } else {
                // Si busca OMEGA3, OMEGA 3, etc., mostrar todos los productos omega
                return hasOmegaInTitle || hasOmegoldInTitle || hasOmegaInFilename || hasOmegoldInFilename || hasOmegaInCategory;
            }
        }

        // SI NO es búsqueda OMEGA específica, usar búsqueda normal
        const texto = [
            pdf.title || '',
            pdf.filename || '',
            pdf.description || '',
            (pdf.keywords || []).join(' '),
            (pdf.tags || []).join(' '),
            pdf.category || ''
        ].join(' ').toLowerCase();

        return texto.includes(searchTerm);
    });

    return resultados;
}

// Pruebas específicas según tu problema
const testCases = [
    {
        search: 'OMEGA3',
        expected: 3,
        description: 'OMEGA3 debe encontrar todos los productos OMEGA (3)',
        shouldShow: ['OMEGOLD.4999', 'Vegan OmeGold', 'Epa Plus']
    },
    {
        search: 'OMEGOLD',
        expected: 2,
        description: 'OMEGOLD debe encontrar solo OMEGOLD y VEGAN OMEGOLD (2)',
        shouldShow: ['OMEGOLD.4999', 'Vegan OmeGold']
    },
    {
        search: 'VEGAN OMEGOLD',
        expected: 2,
        description: 'VEGAN OMEGOLD debe encontrar solo OMEGOLD y VEGAN OMEGOLD (2)',
        shouldShow: ['OMEGOLD.4999', 'Vegan OmeGold']
    },
    {
        search: 'OMEGA 3',
        expected: 3,
        description: 'OMEGA 3 debe encontrar todos los productos OMEGA (3)',
        shouldShow: ['OMEGOLD.4999', 'Vegan OmeGold', 'Epa Plus']
    },
    {
        search: 'Daily',
        expected: 1,
        description: 'Daily debe encontrar solo Daily BioBasics (1)',
        shouldShow: ['Daily BioBasics']
    },
    {
        search: 'Proanthenols',
        expected: 1,
        description: 'Proanthenols debe encontrar solo Proanthenols (1)',
        shouldShow: ['Proanthenols']
    }
];

console.log('\n📋 EJECUTANDO PRUEBAS FINALES:\n');

let passedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Buscando: "${testCase.search}"`);

    const results = performSearch(testCase.search);
    console.log(`   Resultados: ${results.length} (esperado: ${testCase.expected})`);

    results.forEach((result, i) => {
        console.log(`   ${i + 1}. ${result.title}`);
    });

    // Verificar que los resultados esperados estén presentes
    const hasExpectedResults = testCase.shouldShow.every(expected =>
        results.some(result => result.title.includes(expected))
    );

    if (results.length === testCase.expected && hasExpectedResults) {
        console.log(`   ✅ PASÓ\n`);
        passedTests++;
    } else {
        console.log(`   ❌ FALLÓ - Encontrados: ${results.length}, Esperados: ${testCase.expected}`);
        if (!hasExpectedResults) {
            console.log(`   ❌ Faltan resultados esperados`);
        }
        console.log('');
    }
});

console.log(`📊 Resultado Final: ${passedTests}/${testCases.length} pruebas pasadas`);

if (passedTests === testCases.length) {
    console.log('\n🎉 ¡SOLUCIÓN DEFINITIVA COMPLETA!');
    console.log('\n✅ Problema resuelto:');
    console.log('• OMEGA3 → Encontrará 3 productos');
    console.log('• OMEGOLD → Encontrará 2 productos');
    console.log('• VEGAN OMEGOLD → Encontrará 2 productos');
    console.log('• OMEGA 3 → Encontrará 3 productos');
    console.log('• Otras búsquedas → Sin cambios');

    console.log('\n🌐 LISTO PARA SUBIR:');
    console.log('   js/search-with-cards-CLEAN.js');

    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Sube el archivo a tu servidor');
    console.log('2. Limpia caché del navegador');
    console.log('3. Prueba las búsquedas');
} else {
    console.log('\n⚠️ Revisión necesaria.');
}