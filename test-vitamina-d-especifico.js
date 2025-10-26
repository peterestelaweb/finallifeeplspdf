/**
 * PRUEBA ESPECÍFICA - VITAMINA D
 * Verifica que "vitamina d" funcione correctamente como "vitamina c" y "vitamina e"
 */

console.log('🧪 PRUEBA ESPECÍFICA - VITAMINA D...');

// Datos de prueba con todos los productos de vitaminas
const datosPDFs = [
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
    {
        filename: "Vitamin-A.pdf",
        title: "Vitamin A",
        description: "Ficha técnica de Vitamin A",
        category: "Vitaminas y Suplementos"
    }
];

// Función performSearch con l mejorada
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
            const startsWithVitamin = title.startsWith('vitamin') || title.startsWith('vitamina');

            return startsWithVitamin;
        }

        // BÚSQUEDA NORMAL mejorada para vitaminas específicas
        if (searchTerm.match(/vitamina\s+[a-z]/i) || searchTerm.match(/vitamin\s+[a-z]/i)) {
            const searchTermFlex = searchTerm.toLowerCase();
            const titleFlex = (pdf.title || '').toLowerCase();
            const filenameFlex = (pdf.filename || '').toLowerCase();

            // Mejor normalización: manejar múltiples formatos
            let searchTermNormalized = searchTermFlex
                .replace(/\s+/g, '')
                .replace('vitamina', 'vitamin');

            let titleNormalized = titleFlex.replace(/\s+/g, '');
            let filenameNormalized = filenameFlex.replace(/\s+/g, '');

            // Depuración: mostrar qué estamos buscando
            console.log(`🔍 Buscando: "${searchTerm}" → "${searchTermNormalized}"`);
            console.log(`   Título: "${titleFlex}" → "${titleNormalized}"`);

            // Intentar coincidencia directa primero
            const directMatch = titleNormalized.includes(searchTermNormalized) ||
                              filenameNormalized.includes(searchTermNormalized);

            if (directMatch) {
                return true;
            }

            // Si no hay coincidencia directa, intentar con solo la letra de la vitamina
            const vitaminLetter = searchTermFlex.replace(/[^a-z]/gi, '').slice(-1);
            if (vitaminLetter && vitaminLetter.length === 1) {
                const letterMatch = titleFlex.includes(`vitamin ${vitaminLetter}`) ||
                                  titleFlex.includes(`vitamin${vitaminLetter}`) ||
                                  filenameFlex.includes(`vitamin ${vitaminLetter}`) ||
                                  filenameFlex.includes(`vitamin${vitaminLetter}`);
                console.log(`   Letra vitamina: "${vitaminLetter}" → Coincidencia: ${letterMatch}`);
                return letterMatch;
            }

            return false;
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

// Pruebas específicas para todas las vitaminas
const testCases = [
    {
        search: 'vitamina d',  // El problema principal
        expected: 1,
        description: 'vitamina d debe encontrar Vitamin D K2',
        shouldShow: ['Vitamin D K2']
    },
    {
        search: 'vitamina c',  // Debe seguir funcionando
        expected: 1,
        description: 'vitamina c debe encontrar Vitamin C Plus',
        shouldShow: ['Vitamin C Plus']
    },
    {
        search: 'vitamina e',  // Debe seguir funcionando
        expected: 1,
        description: 'vitamina e debe encontrar Vitamin E Complex',
        shouldShow: ['Vitamin E Complex']
    },
    {
        search: 'vitamina a',  // Adicional
        expected: 1,
        description: 'vitamina a debe encontrar Vitamin A',
        shouldShow: ['Vitamin A']
    },
    {
        search: 'vitamina',  // Control - debe mostrar todos
        expected: 4,
        description: 'vitamina debe mostrar todas las vitaminas',
        shouldShow: ['Vitamin E Complex', 'Vitamin C Plus', 'Vitamin D K2', 'Vitamin A']
    }
];

console.log('\n📋 EJECUTANDO PRUEBAS ESPECÍFICAS:\n');

let passedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Buscando: "${testCase.search}"`);

    const results = performSearch(testCase.search);
    console.log(`   Resultados: ${results.length} (esperado: ${testCase.expected})`);

    results.forEach((result, i) => {
        console.log(`   ${i + 1}. 💊 ${result.title}`);
    });

    // Verificar resultados esperados
    const hasExpectedResults = testCase.shouldShow.every(expected =>
        results.some(result => result.title.includes(expected))
    );

    if (results.length === testCase.expected && hasExpectedResults) {
        console.log(`   ✅ PASÓ\n`);
        passedTests++;
    } else {
        console.log(`   ❌ FALLADO:`);
        if (results.length !== testCase.expected) {
            console.log(`      - Cantidad incorrecta: ${results.length} vs ${testCase.expected}`);
        }
        if (!hasExpectedResults) {
            console.log(`      - Faltan resultados esperados`);
        }
        console.log('');
    }
});

console.log(`📊 Resultado Final: ${passedTests}/${testCases.length} pruebas pasadas`);

if (passedTests === testCases.length) {
    console.log('\n🎉 ¡PROBLEMA DE VITAMINA D RESUELTO!');
    console.log('\n✅ Ahora todas las vitaminas específicas funcionan:');
    console.log('• vitamina a → Vitamin A');
    console.log('• vitamina c → Vitamin C Plus');
    console.log('• vitamina d → Vitamin D K2');
    console.log('• vitamina e → Vitamin E Complex');
    console.log('• vitamina → Todas las vitaminas');

    console.log('\n🌐 SUBE EL ARCHIVO CORREGIDO:');
    console.log('   js/search-with-cards-CLEAN.js');
} else {
    console.log('\n⚠️ Aún necesita revisión.');
}