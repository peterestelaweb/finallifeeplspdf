/**
 * PRUEBA DEFINITIVA - VERSIÓN FINAL CORREGIDA
 * Lógica específica para búsquedas OMEGA3/OMEGOLD sin afectar otras búsquedas
 */

console.log('🧪 PRUEBA DEFINITIVA - LÓGICA OMEGA FINAL...');

// Datos de prueba realistas
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

// Función performSearch definitiva
function performSearch(query) {
    const searchTerm = query.toLowerCase().trim();

    // Primero verificar si es una búsqueda especial OMEGA
    // Excluir búsquedas genéricas como solo "omega"
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

            // Solo productos que realmente son de omega (título, filename o categoría)
            return hasOmegaInTitle || hasOmegoldInTitle || hasOmegaInFilename || hasOmegoldInFilename || hasOmegaInCategory;
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

// Casos de prueba finales
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
        search: 'omega',  // Búsqueda genérica
        expected: 5,     // Buscará en todo el texto (comportamiento normal)
        description: 'Búsqueda genérica "omega" debe funcionar normalmente'
    },
    {
        search: 'Daily',
        expected: 1,
        description: 'Daily debe encontrar solo Daily BioBasics'
    },
    {
        search: 'Vitamin',
        expected: 1,
        description: 'Vitamin debe encontrar solo Vitamin C Plus'
    }
];

console.log('\n📋 EJECUTANDO PRUEBAS DEFINITIVAS:\n');

let passedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Buscando: "${testCase.search}"`);

    const results = performSearch(testCase.search);
    console.log(`   Resultados: ${results.length} (esperado: ${testCase.expected})`);

    results.forEach((result, i) => {
        const isOmega = result.category === 'Omega' || result.title.includes('OMEGA') || result.title.includes('Omegold');
        const omegaIndicator = isOmega ? '🐟' : '📄';
        console.log(`   ${i + 1}. ${omegaIndicator} ${result.title} | ${result.category}`);
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
    console.log('\n🎉 ¡SOLUCIÓN DEFINITIVA PERFECTA!');
    console.log('\n✅ Comportamiento garantizado:');
    console.log('• "OMEGA3" → 3 productos OMEGA reales');
    console.log('• "OMEGOLD" → 2 productos OMEGOLD');
    console.log('• "OMEGA" → Búsqueda normal (más resultados)');
    console.log('• Otras búsquedas → Funcionan igual');

    console.log('\n🌐 LISTO PARA SUBIR:');
    console.log('   js/search-with-cards-CLEAN.js (versión definitiva)');

    console.log('\n📋 RESUMEN:');
    console.log('• OMEGA3: Encuentra OMEGOLD normal + VEGAN OMEGOLD + EPA PLUS');
    console.log('• OMEGOLD: Encuentra OMEGOLD normal + VEGAN OMEGOLD');
    console.log('• Búsquedas normales: Sin cambios');
} else {
    console.log('\n⚠️ Aún necesita revisión.');
}