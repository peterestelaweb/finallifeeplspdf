/**
 * PRUEBA CON NOMBRES REALES DE ARCHIVOS
 * Verifica que "vitamina d" funcione con "VITAMINS D K 2.pdf"
 */

console.log('🧪 PRUEBA CON NOMBRES REALES DE ARCHIVOS...');

// Datos con nombres REALES de archivos
const datosPDFs = [
    {
        filename: "VITAMINS E COMPLEX.pdf",
        title: "VITAMINS E COMPLEX",
        description: "Ficha técnica de VITAMINS E COMPLEX",
        category: "Vitaminas y Suplementos"
    },
    {
        filename: "VITAMINS C PLUS.pdf",
        title: "VITAMINS C PLUS",
        description: "Ficha técnica de VITAMINS C PLUS",
        category: "Vitaminas y Suplementos"
    },
    {
        filename: "VITAMINS D K 2.pdf",
        title: "VITAMINS D K 2",
        description: "Ficha técnica de VITAMINS D K 2",
        category: "Vitaminas y Suplementos"
    },
    {
        filename: "VITAMINS A.pdf",
        title: "VITAMINS A",
        description: "Ficha técnica de VITAMINS A",
        category: "Vitaminas y Suplementos"
    }
];

// Función performSearch con lógica corregida
function performSearch(query) {
    const searchTerm = query.toLowerCase().trim();

    // Verificar si es búsqueda de VITAMINAS
    const genericVitaminTerms = [
        'vitamina', 'vitaminas', 'vitamin', 'vitamins'
    ];

    const isVitaminSearch = genericVitaminTerms.includes(searchTerm) ||
                           genericVitaminTerms.includes(searchTerm + 's');

    const resultados = datosPDFs.filter(pdf => {
        // SI es búsqueda VITAMINAS, usar lógica especial
        if (isVitaminSearch) {
            const title = (pdf.title || '').toLowerCase();

            // Lógica específica: productos que contienen "vitamin" o "vitamina"
            const hasVitaminInTitle = title.includes('vitamin') || title.includes('vitamina');

            return hasVitaminInTitle;
        }

        // BÚSQUEDA NORMAL mejorada para vitaminas específicas
        if (searchTerm.match(/vitamina\s+[a-z]/i) || searchTerm.match(/vitamin\s+[a-z]/i)) {
            const searchTermFlex = searchTerm.toLowerCase();
            const titleFlex = (pdf.title || '').toLowerCase();
            const filenameFlex = (pdf.filename || '').toLowerCase();

            console.log(`🔍 Buscando: "${searchTerm}"`);
            console.log(`   Título: "${titleFlex}"`);

            // Mejor normalización: No convertir español a inglés
            let searchTermNormalized = searchTermFlex.replace(/\s+/g, '');
            let titleNormalized = titleFlex.replace(/\s+/g, '');
            let filenameNormalized = filenameFlex.replace(/\s+/g, '');

            console.log(`   Normalizado: "${searchTermNormalized}" vs "${titleNormalized}"`);

            // Intentar coincidencia directa
            const directMatch = titleNormalized.includes(searchTermNormalized) ||
                              filenameNormalized.includes(searchTermNormalized);

            if (directMatch) {
                console.log(`   ✅ Coincidencia directa encontrada`);
                return true;
            }

            // Si no hay coincidencia directa, buscar por letra de vitamina
            const vitaminLetter = searchTermFlex.replace(/[^a-z]/gi, '').slice(-1);
            if (vitaminLetter && vitaminLetter.length === 1) {
                console.log(`   Buscando letra: "${vitaminLetter}"`);

                // Buscar en formatos: "vitamins d", "vitamin d", "vitamina d", etc.
                const letterMatch = titleFlex.includes(`vitamins ${vitaminLetter}`) ||
                                  titleFlex.includes(`vitamin${vitaminLetter}`) ||
                                  titleFlex.includes(`vitamin ${vitaminLetter}`) ||
                                  titleFlex.includes(`vitamina ${vitaminLetter}`) ||
                                  filenameFlex.includes(`vitamins ${vitaminLetter}`) ||
                                  filenameFlex.includes(`vitamin${vitaminLetter}`) ||
                                  filenameFlex.includes(`vitamin ${vitaminLetter}`) ||
                                  filenameFlex.includes(`vitamina ${vitaminLetter}`);

                console.log(`   Coincidencia por letra: ${letterMatch}`);
                return letterMatch;
            }

            console.log(`   ❌ No se encontró coincidencia`);
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

// Pruebas específicas
const testCases = [
    {
        search: 'vitamina d',
        expected: 1,
        description: 'vitamina d debe encontrar VITAMINS D K 2'
    },
    {
        search: 'vitamina c',
        expected: 1,
        description: 'vitamina c debe encontrar VITAMINS C PLUS'
    },
    {
        search: 'vitamina e',
        expected: 1,
        description: 'vitamina e debe encontrar VITAMINS E COMPLEX'
    },
    {
        search: 'vitamina',
        expected: 4,
        description: 'vitamina debe encontrar todos los VITAMINS'
    }
];

console.log('\n📋 EJECUTANDO PRUEBAS CON NOMBRES REALES:\n');

let passedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Buscando: "${testCase.search}"`);

    const results = performSearch(testCase.search);
    console.log(`   Resultados: ${results.length} (esperado: ${testCase.expected})`);

    results.forEach((result, i) => {
        console.log(`   ${i + 1}. 💊 ${result.title}`);
    });

    if (results.length === testCase.expected) {
        console.log(`   ✅ PASÓ\n`);
        passedTests++;
    } else {
        console.log(`   ❌ FALLADO - Encontrados: ${results.length}, Esperados: ${testCase.expected}\n`);
    }
});

console.log(`📊 Resultado Final: ${passedTests}/${testCases.length} pruebas pasadas`);

if (passedTests === testCases.length) {
    console.log('\n🎉 ¡SOLUCIÓN CON NOMBRES REALES FUNCIONA!');
    console.log('\n✅ Ahora "vitamina d" funcionará con "VITAMINS D K 2"');
    console.log('• vitamina d → VITAMINS D K 2');
    console.log('• vitamina c → VITAMINS C PLUS');
    console.log('• vitamina e → VITAMINS E COMPLEX');

    console.log('\n🌐 SUBE EL ARCHIVO CORREGIDO:');
    console.log('   js/search-with-cards-CLEAN.js');
} else {
    console.log('\n⚠️ Aún necesita ajustes.');
}