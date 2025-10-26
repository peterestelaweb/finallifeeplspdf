/**
 * PRUEBA CORREGIDA - MÁS ESPECÍFICA PARA OMEGA3/OMEGOLD
 * Verifica que solo aparezcan productos reales de OMEGA
 */

console.log('🧪 PRUEBA CORREGIDA - BÚSQUEDA OMEGA ESPECÍFICA...');

// Simular datos PDFs más realistas
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
    // Productos NO OMEGA (deben ser excluidos)
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

// Función performSearch corregida
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
            'aceite de pescado', 'epa', 'dha', 'ácidos grasos'
        ];

        const isOmegaSearch = omegaTerms.some(term => searchTerm.includes(term));
        if (isOmegaSearch) {
            // Si es una búsqueda de omega, buscar SOLO productos OMEGA reales
            // Más estricto: solo productos específicos de omega
            const hasOmegaInTitle = (pdf.title || '').toLowerCase().includes('omega');
            const hasOmegoldInTitle = (pdf.title || '').toLowerCase().includes('omegold');
            const hasOmegaInFilename = (pdf.filename || '').toLowerCase().includes('omega');
            const hasOmegoldInFilename = (pdf.filename || '').toLowerCase().includes('omegold');
            const hasOmegaInCategory = (pdf.category || '').toLowerCase() === 'omega';

            // Solo considerar productos que realmente son de omega
            return hasOmegaInTitle || hasOmegoldInTitle || hasOmegaInFilename || hasOmegoldInFilename || hasOmegaInCategory;
        }

        return false;
    });

    return resultados;
}

// Casos de prueba
const testCases = [
    {
        search: 'OMEGA3',
        expected: 3,
        description: 'OMEGA3 debe encontrar solo productos OMEGA reales'
    },
    {
        search: 'OMEGA 3',
        expected: 3,
        description: 'OMEGA 3 debe encontrar solo productos OMEGA reales'
    },
    {
        search: 'OMEGOLD',
        expected: 2,
        description: 'OMEGOLD debe encontrar solo productos OMEGOLD'
    },
    {
        search: 'OMEGA',
        expected: 3,
        description: 'OMEGA debe encontrar solo productos OMEGA reales'
    },
    {
        search: 'Daily',
        expected: 1,
        description: 'Daily debe encontrar Daily BioBasics (control)'
    }
];

console.log('\n📋 EJECUTANDO PRUEBAS CORREGIDAS:\n');

let passedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Buscando: "${testCase.search}"`);

    const results = performSearch(testCase.search);
    console.log(`   Resultados: ${results.length} (esperado: ${testCase.expected})`);

    results.forEach((result, i) => {
        console.log(`   ${i + 1}. ${result.title} | Categoría: ${result.category}`);
    });

    if (results.length === testCase.expected) {
        console.log(`   ✅ PASÓ - Resultado exacto\n`);
        passedTests++;
    } else {
        console.log(`   ❌ FALLÓ - Encontrados: ${results.length}, Esperados: ${testCase.expected}\n`);
    }
});

console.log(`📊 Resultados: ${passedTests}/${testCases.length} pruebas pasadas`);

if (passedTests === testCases.length) {
    console.log('\n🎉 ¡SOLUCIÓN CORREGIDA FUNCIONANDO!');
    console.log('\n✅ Ahora las búsquedas de OMEGA son más específicas:');
    console.log('• Solo aparecen productos OMEGA reales');
    console.log('• Se excluyen productos que solo mencionan omega en descripción');
    console.log('• Búsquedas normales siguen funcionando');

    console.log('\n🌐 SUBE EL ARCHIVO CORREGIDO:');
    console.log('   js/search-with-cards-CLEAN.js (versión corregida)');
} else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisa la lógica.');
}