/**
 * PRUEBA BÚSQUEDA OMEGA GENÉRICA
 * Verifica que "OMEGA" solo encuentre productos OMEGA reales
 */

console.log('🧪 PRUEBA BÚSQUEDA OMEGA GENÉRICA...');

// Datos de prueba
const datosPDFs = [
    // Productos OMEGA reales
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
    // Productos NO OMEGA (que mencionan omega en descripción)
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

// Función performSearch con lógica corregida
function performSearch(query) {
    const searchTerm = query.toLowerCase().trim();

    // Verificar si es cualquier tipo de búsqueda OMEGA
    const omegaSpecificTerms = [
        'omega3', 'omega 3', 'omega-3', 'omegold', 'vegan omegold',
        'aceite de pescado', 'epa', 'dha', 'ácidos grasos'
    ];

    const isSpecificOmegaSearch = omegaSpecificTerms.some(term => searchTerm.includes(term));
    const isGenericOmega = searchTerm === 'omega' || searchTerm === 'omegas';

    // Si es cualquier tipo de búsqueda OMEGA, usar lógica especial
    const isOmegaSearch = isSpecificOmegaSearch || isGenericOmega;

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
                // Si busca OMEGA3, OMEGA 3, o solo OMEGA, mostrar todos los productos omega
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

// Pruebas específicas para el problema de OMEGA genérico
const testCases = [
    {
        search: 'OMEGA',
        expected: 3,
        description: 'OMEGA (genérico) debe encontrar solo productos OMEGA reales (3)',
        shouldShow: ['OMEGOLD.4999', 'Vegan OmeGold', 'Epa Plus'],
        shouldNotShow: ['Daily BioBasics', 'Vitamin C Plus']
    },
    {
        search: 'omega',
        expected: 3,
        description: 'omega (minúscula) debe encontrar solo productos OMEGA reales (3)',
        shouldShow: ['OMEGOLD.4999', 'Vegan OmeGold', 'Epa Plus'],
        shouldNotShow: ['Daily BioBasics', 'Vitamin C Plus']
    },
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
        search: 'Daily',
        expected: 1,
        description: 'Daily debe encontrar solo Daily BioBasics (1)',
        shouldShow: ['Daily BioBasics']
    }
];

console.log('\n📋 EJECUTANDO PRUEBAS PARA OMEGA GENÉRICO:\n');

let passedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Buscando: "${testCase.search}"`);

    const results = performSearch(testCase.search);
    console.log(`   Resultados: ${results.length} (esperado: ${testCase.expected})`);

    results.forEach((result, i) => {
        const isOmega = result.category === 'Omega';
        const omegaIndicator = isOmega ? '🐟' : '📄';
        console.log(`   ${i + 1}. ${omegaIndicator} ${result.title} | ${result.category}`);
    });

    // Verificar resultados esperados
    const hasExpectedResults = testCase.shouldShow.every(expected =>
        results.some(result => result.title.includes(expected))
    );

    const noUnwantedResults = testCase.shouldNotShow ?
        testCase.shouldNotShow.every(unwanted =>
            !results.some(result => result.title.includes(unwanted))
        ) : true;

    if (results.length === testCase.expected && hasExpectedResults && noUnwantedResults) {
        console.log(`   ✅ PASÓ\n`);
        passedTests++;
    } else {
        console.log(`   ❌ FALLÓ:`);
        if (results.length !== testCase.expected) {
            console.log(`      - Cantidad incorrecta: ${results.length} vs ${testCase.expected}`);
        }
        if (!hasExpectedResults) {
            console.log(`      - Faltan resultados esperados`);
        }
        if (!noUnwantedResults) {
            console.log(`      - Aparecen resultados no deseados`);
        }
        console.log('');
    }
});

console.log(`📊 Resultado Final: ${passedTests}/${testCases.length} pruebas pasadas`);

if (passedTests === testCases.length) {
    console.log('\n🎉 ¡PROBLEMA DE OMEGA GENÉRICO RESUELTO!');
    console.log('\n✅ Ahora funciona correctamente:');
    console.log('• "OMEGA" → Solo 3 productos OMEGA reales');
    console.log('• "omega" → Solo 3 productos OMEGA reales');
    console.log('• "OMEGA3" → 3 productos OMEGA reales');
    console.log('• "OMEGOLD" → 2 productos OMEGOLD');
    console.log('• No más resultados falsos positivos');

    console.log('\n🌐 SUBE EL ARCHIVO CORREGIDO:');
    console.log('   js/search-with-cards-CLEAN.js');
} else {
    console.log('\n⚠️ Aún necesita ajustes.');
}