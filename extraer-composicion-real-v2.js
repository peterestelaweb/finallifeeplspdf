const fs = require('fs');
const pdf = require('pdf-parse');

console.log('🔬 EXTRACTOR DE COMPOSICIÓN NUTRICIONAL REAL V2');

const PATRONES_COMPOSICION = {
    supplementFacts: /supplement\s*facts[\s\S]*?(?=\n\n|\n[A-Z][A-Z\s]*$|\nOther ingredients|% Daily Value|$)/gi,
    servingSize: /serving\s*size[\s:]*([^0-9\n]*[0-9,.]+[^0-9\n]*)/gi,
    servingsPerContainer: /servings\s*per\s*container[\s:]*([^0-9\n]*[0-9]+[^0-9\n]*)/gi,

    // Patrones más robustos para ingredientes
    vitaminA: /vitamin\s*a[^0-9]*([0-9,.]+)\s*(mcg|µg|iu|ui)/gi,
    vitaminC: /vitamin\s*c[^0-9]*([0-9,.]+)\s*(mg)/gi,
    vitaminD: /vitamin\s*d[^0-9]*([0-9,.]+)\s*(mcg|µg|iu|ui)/gi,
    vitaminE: /vitamin\s*e[^0-9]*([0-9,.]+)\s*(mg|iu|ui)/gi,

    calcium: /calcium[^0-9]*([0-9,.]+)\s*(mg)/gi,
    iron: /iron[^0-9]*([0-9,.]+)\s*(mg)/gi,
    magnesium: /magnesium[^0-9]*([0-9,.]+)\s*(mg)/gi,
    zinc: /zinc[^0-9]*([0-9,.]+)\s*(mg)/gi,

    omega3: /omega[^0-9]*3[^0-9]*([0-9,.]+)\s*(mg)/gi,
    epa: /\bepa\b[^0-9]*([0-9,.]+)\s*(mg)/gi,
    dha: /\bdha\b[^0-9]*([0-9,.]+)\s*(mg)/gi
};

async function extraerComposicionReal(filename) {
    try {
        const dataBuffer = fs.readFileSync(`./pdfs/${filename}`);
        const data = await pdf(dataBuffer);

        console.log(`📄 Analizando: ${filename}`);
        console.log(`   📖 Páginas: ${data.numpages}`);
        console.log(`   📝 Texto extraído: ${data.text.length} caracteres`);

        // Mostrar primer extracto de texto para depuración
        console.log(`   🔍 Primer extracto: ${data.text.substring(0, 200).replace(/\n/g, ' ')}...`);

        const composicion = analizarComposicion(data.text, filename);
        return composicion;

    } catch (error) {
        console.log(`❌ Error al procesar ${filename}:`, error.message);
        return null;
    }
}

function analizarComposicion(texto, filename) {
    const composicion = {
        filename: filename,
        supplementFacts: {
            servingSize: '',
            servingsPerContainer: '',
            vitaminas: {},
            minerales: {},
            acidosGrasos: {},
            otrosIngredientes: [],
            textoCompleto: texto.substring(0, 1000), // Primeros 1000 caracteres
            textoSupplementFacts: ''
        }
    };

    // Buscar sección de Supplement Facts
    const supplementMatch = texto.match(PATRONES_COMPOSICION.supplementFacts);
    if (supplementMatch) {
        const supplementText = supplementMatch[0];
        composicion.supplementFacts.textoSupplementFacts = supplementText;
        console.log(`   ✅ Sección Supplement Facts encontrada (${supplementText.length} caracteres)`);
        console.log(`   🔍 Extracto de Supplement Facts: ${supplementText.substring(0, 200).replace(/\n/g, ' ')}...`);

        // Extraer serving size con validación
        const servingMatch = supplementText.match(PATRONES_COMPOSICION.servingSize);
        if (servingMatch && servingMatch[1]) {
            composicion.supplementFacts.servingSize = servingMatch[1].trim();
            console.log(`   📊 Serving Size: ${composicion.supplementFacts.servingSize}`);
        }

        // Extraer servings per container con validación
        const servingsMatch = supplementText.match(PATRONES_COMPOSICION.servingsPerContainer);
        if (servingsMatch && servingsMatch[1]) {
            composicion.supplementFacts.servingsPerContainer = servingsMatch[1].trim();
            console.log(`   📦 Servings Per Container: ${composicion.supplementFacts.servingsPerContainer}`);
        }

        // Extraer vitaminas
        Object.assign(composicion.supplementFacts.vitaminas, extraerVitaminas(supplementText));

        // Extraer minerales
        Object.assign(composicion.supplementFacts.minerales, extraerMinerales(supplementText));

        // Extraer ácidos grasos
        Object.assign(composicion.supplementFacts.acidosGrasos, extraerAcidosGrasos(supplementText));

        // Extraer otros ingredientes
        composicion.supplementFacts.otrosIngredientes = extraerOtrosIngredientes(supplementText);

    } else {
        console.log(`   ⚠️  No se encontró sección Supplement Facts`);

        // Buscar patrones en el texto completo
        console.log(`   🔍 Buscando patrones en texto completo...`);
        Object.assign(composicion.supplementFacts.vitaminas, extraerVitaminas(texto));
        Object.assign(composicion.supplementFacts.minerales, extraerMinerales(texto));
        Object.assign(composicion.supplementFacts.acidosGrasos, extraerAcidosGrasos(texto));
    }

    return composicion;
}

function extraerVitaminas(texto) {
    const vitaminas = {};

    const matches = {
        'Vitamin A': texto.match(PATRONES_COMPOSICION.vitaminA),
        'Vitamin C': texto.match(PATRONES_COMPOSICION.vitaminC),
        'Vitamin D': texto.match(PATRONES_COMPOSICION.vitaminD),
        'Vitamin E': texto.match(PATRONES_COMPOSICION.vitaminE)
    };

    Object.entries(matches).forEach(([vitamina, match]) => {
        if (match && match.length > 0) {
            const cantidad = match[1];
            const unidad = match[2];
            vitaminas[vitamina] = { cantidad, unidad, texto: match[0] };
            console.log(`     📋 ${vitamina}: ${cantidad} ${unidad}`);
        }
    });

    return vitaminas;
}

function extraerMinerales(texto) {
    const minerales = {};

    const matches = {
        'Calcium': texto.match(PATRONES_COMPOSICION.calcium),
        'Iron': texto.match(PATRONES_COMPOSICION.iron),
        'Magnesium': texto.match(PATRONES_COMPOSICION.magnesium),
        'Zinc': texto.match(PATRONES_COMPOSICION.zinc)
    };

    Object.entries(matches).forEach(([mineral, match]) => {
        if (match && match.length > 0) {
            const cantidad = match[1];
            const unidad = match[2];
            minerales[mineral] = { cantidad, unidad, texto: match[0] };
            console.log(`     🔧 ${mineral}: ${cantidad} ${unidad}`);
        }
    });

    return minerales;
}

function extraerAcidosGrasos(texto) {
    const acidosGrasos = {};

    const matches = {
        'Omega-3': texto.match(PATRONES_COMPOSICION.omega3),
        'EPA': texto.match(PATRONES_COMPOSICION.epa),
        'DHA': texto.match(PATRONES_COMPOSICION.dha)
    };

    Object.entries(matches).forEach(([acido, match]) => {
        if (match && match.length > 0) {
            const cantidad = match[1];
            const unidad = match[2];
            acidosGrasos[acido] = { cantidad, unidad, texto: match[0] };
            console.log(`     🐟 ${acido}: ${cantidad} ${unidad}`);
        }
    });

    return acidosGrasos;
}

function extraerOtrosIngredientes(texto) {
    const ingredientes = [];

    // Patrones más flexibles para ingredientes
    const patronesIngredientes = [
        /([a-zA-Z\s]+?)\s+([0-9,.]+)\s*(mg|mcg|µg|g|iu|ui)\s*([^0-9\n]*?)\n/gi,
        /([a-zA-Z\s]+?)\s+([0-9,.]+)\s*(mg|mcg|µg|g|iu|ui)\s*\(%?[\w\s]*?\)/gi
    ];

    patronesIngredientes.forEach(patron => {
        let match;
        while ((match = patron.exec(texto)) !== null) {
            if (match && match[1] && match[2] && match[3]) {
                ingredientes.push({
                    nombre: match[1].trim(),
                    cantidad: match[2],
                    unidad: match[3],
                    infoAdicional: match[4] ? match[4].trim() : '',
                    textoCompleto: match[0]
                });
                console.log(`     📦 ${match[1].trim()}: ${match[2]} ${match[3]}`);
            }
        }
    });

    return ingredientes;
}

async function procesarAlgunosPDFs() {
    console.log('\n🔍 INICIANDO EXTRACCIÓN REAL DE COMPOSICIÓN NUTRICIONAL\n');

    const pdfsDir = './pdfs';
    const archivos = fs.readdirSync(pdfsDir);
    const pdfFiles = archivos.filter(archivo => archivo.endsWith('.pdf'));

    console.log(`📄 Encontrados ${pdfFiles.length} archivos PDF`);

    // Seleccionar algunos PDFs específicos para analizar
    const pdfsParaAnalizar = [
        'OMEGOLD®.pdf',
        'Aloe Vera Caps 6003-PI_ES.pdf',
        'BIO LIGHT .pdf',
        'BE FOCUSED BERRY.pdf',
        'Daily Biobasics .pdf',
        'Vitamin C 6002-PI_ES.pdf'
    ].filter(nombre => pdfFiles.includes(nombre));

    if (pdfsParaAnalizar.length === 0) {
        console.log('⚠️  No se encontraron los PDFs específicos, usando los primeros disponibles...');
        pdfsParaAnalizar.push(...pdfFiles.slice(0, 5));
    }

    console.log(`📄 Analizando ${pdfsParaAnalizar.length} PDFs específicos:\n`);

    const composiciones = [];
    let procesados = 0;
    let errores = 0;

    for (let i = 0; i < pdfsParaAnalizar.length; i++) {
        const filename = pdfsParaAnalizar[i];
        console.log(`\n📊 Procesando ${i + 1}/${pdfsParaAnalizar.length}: ${filename}`);
        console.log('-'.repeat(60));

        const composicion = await extraerComposicionReal(filename);
        if (composicion) {
            composiciones.push(composicion);
            procesados++;

            // Mostrar resumen final
            const numVitaminas = Object.keys(composicion.supplementFacts.vitaminas).length;
            const numMinerales = Object.keys(composicion.supplementFacts.minerales).length;
            const numAcidos = Object.keys(composicion.supplementFacts.acidosGrasos).length;
            const numOtros = composicion.supplementFacts.otrosIngredientes.length;

            console.log(`\n   📋 RESUMEN DE ${filename}:`);
            console.log(`   📋 Vitaminas encontradas: ${numVitaminas}`);
            console.log(`   🔧 Minerales encontrados: ${numMinerales}`);
            console.log(`   🐟 Ácidos grasos encontrados: ${numAcidos}`);
            console.log(`   📦 Otros ingredientes: ${numOtros}`);
            console.log(`   📊 Serving Size: ${composicion.supplementFacts.servingSize || 'No encontrado'}`);
            console.log(`   📦 Servings: ${composicion.supplementFacts.servingsPerContainer || 'No encontrado'}`);
        } else {
            errores++;
        }
    }

    // Guardar resultados
    const resultado = {
        success: true,
        version: "3.1-composicion-real-pdf-parse-v2",
        fecha_procesamiento: new Date().toISOString(),
        total_pdfs_disponibles: pdfFiles.length,
        pdfs_analizados: pdfsParaAnalizar.length,
        pdfs_procesados: procesados,
        pdfs_con_errores: errores,
        composiciones: composiciones
    };

    fs.writeFileSync('./data/composicion-real-v2.json', JSON.stringify(resultado, null, 2));

    console.log(`\n✅ Procesamiento completado!`);
    console.log(`📊 PDFs procesados: ${procesados}/${pdfsParaAnalizar.length}`);
    console.log(`❌ PDFs con errores: ${errores}`);
    console.log(`📁 Resultados guardados en: data/composicion-real-v2.json`);

    // Mostrar ejemplo de datos extraídos
    if (composiciones.length > 0) {
        console.log('\n📋 EJEMPLO DE DATOS EXTRAÍDOS:');
        console.log(JSON.stringify(composiciones[0], null, 2));
    }

    return resultado;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    procesarAlgunosPDFs().catch(console.error);
}

module.exports = { extraerComposicionReal, procesarAlgunosPDFs };