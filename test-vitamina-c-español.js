/**
 * PRUEBA ESPECÍFICA - "vitamina c" en español
 * Verifica que la búsqueda "vitamina c" funcione correctamente
 */

console.log('🧪 PRUEBA ESPECÍFICA - "vitamina c" en español...');

// Datos de prueba con nombres reales
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

// Pruebas específicas para el problema reportado
const testCases = [
    {
        search: 'vitamina',  // El problema exacto reportado
        expected: 3,
        description: 'vitamina (singular) debe encontrar solo 3 productos de vitaminas'
    },
    {
        search: 'vitamina c',  // Otro problema reportado
        expected: 1,
        description: 'vitamina c debe encontrar solo Vitamin C Plus'
    },
    {
        search: 'vitaminas',  // Plural - debe funcionar
        expected: 3,
        description: 'vitaminas (plural) debe encontrar solo 3 productos de vitaminas'
    },
    {
        search: 'Vitamin C',  // Inglés - debe funcionar
        expected: 1,
        description: 'Vitamin C (inglés) debe encontrar solo Vitamin C Plus'
    },
    {
        search: 'Daily',  // Control - búsqueda normal
        expected: 1,
        description: 'Daily debe encontrar solo Daily BioBasics'
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
        const isVitamin = result.title.toLowerCase().includes('vitamin');
        const vitaminIndicator = isVitamin ? '💊' : '📄';
        console.log(`   ${i + 1}. ${vitaminIndicator} ${result.title}`);
    });

    if (results.length === testCase.expected) {
        console.log(`   ✅ PASÓ\n`);
        passedTests++;
    } else {
        console.log(`   ❌ FALLÓ - Encontrados: ${results.length}, Esperados: ${testCase.expected}\n`);
    }
});

console.log(`📊 Resultado Final: ${passedTests}/${testCases.length} pruebas pasadas`);

if (passedTests === testCases.length) {
    console.log('\n🎉 ¡PROBLEMAS ESPECÍFICOS RESUELTOS!');
    console.log('\n✅ Solucionado:');
    console.log('• "vitamina" → 3 productos de vitaminas (no más falsos positivos)');
    console.log('• "vitamina c" → 1 producto (Vitamin C Plus)');
    console.log('• "vitaminas" → 3 productos de vitaminas');
    console.log('• "Vitamin C" → 1 producto (Vitamin C Plus)');
    console.log('• Búsquedas normales → Sin cambios');

    console.log('\n🌐 SUBE EL ARCHIVO CORREGIDO:');
    console.log('   js/search-with-cards-CLEAN.js');
} else {
    console.log('\n⚠️ Aún necesita revisión.');
}