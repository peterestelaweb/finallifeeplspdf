/**
 * PRUEBA BÚSQUEDA VITAMINAS
 * Verifica que "vitaminas" solo encuentre productos de vitaminas reales
 */

console.log('🧪 PRUEBA BÚSQUEDA VITAMINAS...');

// Datos de prueba realistas
const datosPDFs = [
    // Productos VITAMINAS reales
    {
        filename: "Vitamin-E-Complex.pdf",
        title: "Vitamin E Complex",
        description: "Ficha técnica de Vitamin E Complex",
        category: "Vitaminas y Suplementos"
    },
    {
        filename: "Vitamin-C-Plus.pdf",
        title: "Vitamin C Plus",
        description: "Ficha técnica de Vitamin C Plus",
        category: "Vitaminas y Suplementos"
    },
    {
        filename: "Vitamin-D-K2.pdf",
        title: "Vitamin D K2",
        description: "Ficha técnica de Vitamin D K2",
        category: "Vitaminas y Suplementos"
    },
    // Productos NO VITAMINAS (que mencionan vitaminas en descripción)
    {
        filename: "Daily-BioBasics.pdf",
        title: "Daily BioBasics",
        description: "Contiene vitaminas esenciales y minerales",
        category: "General"
    },
    {
        filename: "Proanthenols.pdf",
        title: "Proanthenols OPC",
        description: "Antioxidante con vitaminas C y E",
        category: "Antioxidantes"
    },
    {
        filename: "OMEGOLD.pdf",
        title: "OMEGOLD Omega 3",
        description: "Aceite de pescado con vitaminas A y D",
        category: "Omega"
    },
    // Otros productos
    {
        filename: "Colagen-plus.pdf",
        title: "Colagen Plus",
        description: "Colágeno con vitamina C",
        category: "Colágeno y Belleza"
    }
];

// Función performSearch con lógica OMEGA y VITAMINAS
function performSearch(query) {
    const searchTerm = query.toLowerCase().trim();

    // Verificar si es cualquier tipo de búsqueda OMEGA
    const omegaSpecificTerms = [
        'omega3', 'omega 3', 'omega-3', 'omegold', 'vegan omegold',
        'aceite de pescado', 'epa', 'dha', 'ácidos grasos'
    ];

    const isSpecificOmegaSearch = omegaSpecificTerms.some(term => searchTerm.includes(term));
    const isGenericOmega = searchTerm === 'omega' || searchTerm === 'omegas';
    const isOmegaSearch = isSpecificOmegaSearch || isGenericOmega;

    // Verificar si es búsqueda de VITAMINAS
    // Activar solo para términos genéricos exactos
    const genericVitaminTerms = [
        'vitamina', 'vitaminas', 'vitamin', 'vitamins'
    ];

    const isVitaminSearch = genericVitaminTerms.includes(searchTerm) ||
                           genericVitaminTerms.includes(searchTerm + 's');

    const resultados = datosPDFs.filter(pdf => {
        // SI es búsqueda OMEGA específica, usar lógica especial
        if (isOmegaSearch) {
            const hasOmegaInTitle = (pdf.title || '').toLowerCase().includes('omega');
            const hasOmegoldInTitle = (pdf.title || '').toLowerCase().includes('omegold');
            const hasOmegaInFilename = (pdf.filename || '').toLowerCase().includes('omega');
            const hasOmegoldInFilename = (pdf.filename || '').toLowerCase().includes('omegold');
            const hasOmegaInCategory = (pdf.category || '').toLowerCase() === 'omega';

            if (searchTerm.includes('omegold')) {
                return hasOmegoldInTitle || hasOmegoldInFilename;
            } else {
                return hasOmegaInTitle || hasOmegoldInTitle || hasOmegaInFilename || hasOmegoldInFilename || hasOmegaInCategory;
            }
        }

        // SI es búsqueda VITAMINAS, usar lógica especial
        if (isVitaminSearch) {
            const hasVitaminInTitle = (pdf.title || '').toLowerCase().includes('vitamin');
            const hasVitaminaInTitle = (pdf.title || '').toLowerCase().includes('vitamina');
            const hasVitaminInFilename = (pdf.filename || '').toLowerCase().includes('vitamin');
            const hasVitaminaInFilename = (pdf.filename || '').toLowerCase().includes('vitamina');
            const hasVitaminInCategory = (pdf.category || '').toLowerCase().includes('vitamin') ||
                                     (pdf.category || '').toLowerCase().includes('vitamina');

            // Solo mostrar productos que realmente son vitaminas
            return hasVitaminInTitle || hasVitaminaInTitle || hasVitaminInFilename || hasVitaminaInFilename || hasVitaminInCategory;
        }

        // SI NO es búsqueda especial, usar búsqueda normal
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

// Casos de prueba específicos para vitaminas
const testCases = [
    {
        search: 'vitaminas',
        expected: 3,
        description: 'vitaminas debe encontrar solo 3 productos de vitaminas reales',
        shouldShow: ['Vitamin E Complex', 'Vitamin C Plus', 'Vitamin D K2'],
        shouldNotShow: ['Daily BioBasics', 'Proanthenols', 'OMEGOLD', 'Colagen Plus']
    },
    {
        search: 'vitamin',
        expected: 3,
        description: 'vitamin debe encontrar solo 3 productos de vitaminas reales',
        shouldShow: ['Vitamin E Complex', 'Vitamin C Plus', 'Vitamin D K2'],
        shouldNotShow: ['Daily BioBasics', 'Proanthenols', 'OMEGOLD']
    },
    {
        search: 'Vitamin C',
        expected: 1,
        description: 'Vitamin C debe encontrar solo Vitamin C Plus',
        shouldShow: ['Vitamin C Plus']
    },
    {
        search: 'Vitamin E',
        expected: 1,
        description: 'Vitamin E debe encontrar solo Vitamin E Complex',
        shouldShow: ['Vitamin E Complex']
    },
    {
        search: 'Daily',
        expected: 1,
        description: 'Daily debe encontrar solo Daily BioBasics',
        shouldShow: ['Daily BioBasics']
    },
    {
        search: 'OMEGA',
        expected: 1,
        description: 'OMEGA debe seguir funcionando (solo OMEGOLD)',
        shouldShow: ['OMEGOLD Omega 3']
    }
];

console.log('\n📋 EJECUTANDO PRUEBAS DE VITAMINAS:\n');

let passedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Buscando: "${testCase.search}"`);

    const results = performSearch(testCase.search);
    console.log(`   Resultados: ${results.length} (esperado: ${testCase.expected})`);

    results.forEach((result, i) => {
        const isVitamin = result.title.toLowerCase().includes('vitamin');
        const vitaminIndicator = isVitamin ? '💊' : '📄';
        console.log(`   ${i + 1}. ${vitaminIndicator} ${result.title} | ${result.category}`);
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
    console.log('\n🎉 ¡PROBLEMA DE VITAMINAS RESUELTO!');
    console.log('\n✅ Ahora funciona correctamente:');
    console.log('• "vitaminas" → Solo 3 productos de vitaminas reales');
    console.log('• "vitamin" → Solo 3 productos de vitaminas reales');
    console.log('• "Vitamin C" → Solo Vitamin C Plus');
    console.log('• Búsquedas OMEGA → Sigue funcionando');
    console.log('• No más productos falsos que mencionan vitaminas en descripción');

    console.log('\n🌐 SUBE EL ARCHIVO ACTUALIZADO:');
    console.log('   js/search-with-cards-CLEAN.js');
} else {
    console.log('\n⚠️ Aún necesita ajustes.');
}