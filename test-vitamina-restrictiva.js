/**
 * PRUEBA VITAMINAS - LÓGICA MÁS ESTRICTA
 * Verifica que "vitamina" solo muestre productos que EMPIEZAN con "Vitamin"
 */

console.log('🧪 PRUEBA VITAMINAS - LÓGICA MÁS ESTRICTA...');

// Datos de prueba realistas que incluyen los productos problemáticos
const datosPDFs = [
    // Productos VITAMINAS reales (deben mostrarse)
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
    // Productos que mencionan vitaminas pero NO son productos de vitaminas (NO deben mostrarse)
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
        filename: "Colagen-Plus.pdf",
        title: "Colagen Plus",
        description: "Colágeno con vitamina C añadida",
        category: "Colágeno y Belleza"
    },
    {
        filename: "OMEGOLD.pdf",
        title: "OMEGOLD Omega 3",
        description: "Aceite de pescado con vitaminas A y D",
        category: "Omega"
    }
];

// Función performSearch con lógica MUY restrictiva
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
            const title = (pdf.title || '').toLowerCase();

            // Lógica MUY ESPECÍFICA: Solo productos que realmente son vitaminas
            // Deben empezar con "vitamin" o "vitamina" para ser considerados productos de vitaminas
            const startsWithVitamin = title.startsWith('vitamin') || title.startsWith('vitamina');

            return startsWithVitamin;
        }

        // BÚSQUEDA NORMAL mejorada para vitaminas específicas
        // Si es búsqueda específica de vitaminas (vitamina c, vitamin e, etc.)
        // permitir coincidencias flexibles entre español/inglés
        if (searchTerm.match(/vitamin\s+[a-z]/i) || searchTerm.match(/vitamina\s+[a-z]/i)) {
            const searchTermFlex = searchTerm.toLowerCase();
            const titleFlex = (pdf.title || '').toLowerCase();
            const filenameFlex = (pdf.filename || '').toLowerCase();

            // Permitir coincidencias como "vitamina c" → "vitamin c"
            const searchTermNormalized = searchTermFlex
                .replace(/\s+/g, '')
                .replace('vitamina', 'vitamin');

            const titleNormalized = titleFlex.replace(/\s+/g, '');
            const filenameNormalized = filenameFlex.replace(/\s+/g, '');

            return titleNormalized.includes(searchTermNormalized) ||
                   filenameNormalized.includes(searchTermNormalized);
        }

        // BÚSQUEDA NORMAL para otros casos
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

// Pruebas específicas para el problema de "vitamina"
const testCases = [
    {
        search: 'vitamina',  // El problema principal
        expected: 3,
        description: 'vitamina debe mostrar SOLO 3 productos que empiezan con "Vitamin"',
        shouldShow: ['Vitamin E Complex', 'Vitamin C Plus', 'Vitamin D K2'],
        shouldNotShow: ['Daily BioBasics', 'Proanthenols OPC', 'Colagen Plus', 'OMEGOLD']
    },
    {
        search: 'vitaminas',  // Plural
        expected: 3,
        description: 'vitaminas debe mostrar SOLO 3 productos que empiezan con "Vitamin"',
        shouldShow: ['Vitamin E Complex', 'Vitamin C Plus', 'Vitamin D K2'],
        shouldNotShow: ['Daily BioBasics', 'Proanthenols OPC', 'Colagen Plus']
    },
    {
        search: 'vitamin',  // Inglés
        expected: 3,
        description: 'vitamin debe mostrar SOLO 3 productos que empiezan con "Vitamin"',
        shouldShow: ['Vitamin E Complex', 'Vitamin C Plus', 'Vitamin D K2'],
        shouldNotShow: ['Daily BioBasics', 'Proanthenols OPC', 'Colagen Plus']
    },
    {
        search: 'vitamina c',  // Específico - debe seguir funcionando
        expected: 1,
        description: 'vitamina c debe encontrar Vitamin C Plus',
        shouldShow: ['Vitamin C Plus']
    },
    {
        search: 'Daily',  // Control - búsqueda normal
        expected: 1,
        description: 'Daily debe encontrar solo Daily BioBasics',
        shouldShow: ['Daily BioBasics']
    }
];

console.log('\n📋 EJECUTANDO PRUEBAS CON LÓGICA ESTRICTA:\n');

let passedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Buscando: "${testCase.search}"`);

    const results = performSearch(testCase.search);
    console.log(`   Resultados: ${results.length} (esperado: ${testCase.expected})`);

    results.forEach((result, i) => {
        const isVitaminProduct = result.title.toLowerCase().startsWith('vitamin');
        const indicator = isVitaminProduct ? '💊' : '❌';
        console.log(`   ${i + 1}. ${indicator} ${result.title}`);
    });

    // Verificar que los productos correctos estén presentes
    const hasExpectedResults = testCase.shouldShow.every(expected =>
        results.some(result => result.title.includes(expected))
    );

    // Verificar que los productos incorrectos NO estén presentes
    const noUnwantedResults = testCase.shouldNotShow ?
        testCase.shouldNotShow.every(unwanted =>
            !results.some(result => result.title.includes(unwanted))
        ) : true;

    if (results.length === testCase.expected && hasExpectedResults && noUnwantedResults) {
        console.log(`   ✅ PASÓ\n`);
        passedTests++;
    } else {
        console.log(`   ❌ FALLADO:`);
        if (results.length !== testCase.expected) {
            console.log(`      - Cantidad incorrecta: ${results.length} vs ${testCase.expected}`);
        }
        if (!hasExpectedResults) {
            console.log(`      - Faltan productos esperados`);
        }
        if (!noUnwantedResults) {
            console.log(`      - Aparecen productos no deseados`);
        }
        console.log('');
    }
});

console.log(`📊 Resultado Final: ${passedTests}/${testCases.length} pruebas pasadas`);

if (passedTests === testCases.length) {
    console.log('\n🎉 ¡PROBLEMA DE "VITAMINA" RESUELTO!');
    console.log('\n✅ Ahora funciona correctamente:');
    console.log('• "vitamina" → Solo 3 productos que empiezan con "Vitamin"');
    console.log('• "vitaminas" → Solo 3 productos que empiezan con "Vitamin"');
    console.log('• "vitamin" → Solo 3 productos que empiezan con "Vitamin"');
    console.log('• "vitamina c" → Vitamin C Plus (específico)');
    console.log('• NO aparecen Daily BioBasics, Proanthenols, Colagen Plus');

    console.log('\n🌐 SUBE EL ARCHIVO CORREGIDO:');
    console.log('   js/search-with-cards-CLEAN.js');
} else {
    console.log('\n⚠️ Aún necesita ajustes.');
}