const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 INSTALANDO LIBRERÍAS Y PROCESANDO PDFs REALES...\n');

// Función para verificar si pdf-parse está instalado
function verificarLibrerias() {
    try {
        require('pdf-parse');
        console.log('✅ pdf-parse ya está instalado');
        return true;
    } catch (error) {
        console.log('📦 Instalando pdf-parse...');
        try {
            execSync('npm install pdf-parse', { stdio: 'inherit' });
            console.log('✅ pdf-parse instalado correctamente');
            return true;
        } catch (installError) {
            console.log('❌ Error al instalar pdf-parse:', installError.message);
            return false;
        }
    }
}

// Función para crear el extractor real con pdf-parse
function crearExtractorReal() {
    const extractorCode = `
const fs = require('fs');
const pdf = require('pdf-parse');

console.log('🔬 EXTRACTOR DE COMPOSICIÓN NUTRICIONAL REAL CON PDF-PARSE');

const PATRONES_COMPOSICION = {
    supplementFacts: /supplement\\s*facts[\\s\\S]*?(?=[A-Z][A-Z\\s]*$|$)/gi,
    servingSize: /serving\\s*size[:\\s]*([^\\n]+)/gi,
    servingsPerContainer: /servings\\s*per\\s*container[:\\s]*([^\\n]+)/gi,

    // Patrones para ingredientes con cantidades
    ingredienteConCantidad: /([^\\n]+?)\\s+([0-9,]+\\.?[0-9]*)\\s*(mg|mcg|µg|g|ug|iu|ui)\\s*([^\\n]*?)\\n/gi,

    // Patrones específicos para vitaminas
    vitaminA: /vitamin\\s*a[^0-9]*([0-9,]+)\\s*(iu|ui|mcg|µg)/gi,
    vitaminC: /vitamin\\s*c[^0-9]*([0-9,]+)\\s*(mg)/gi,
    vitaminD: /vitamin\\s*d[^0-9]*([0-9,]+)\\s*(iu|ui|mcg|µg)/gi,
    vitaminE: /vitamin\\s*e[^0-9]*([0-9,]+)\\s*(iu|ui|mg)/gi,

    // Patrones para minerales
    calcium: /calcium[^0-9]*([0-9,]+)\\s*(mg)/gi,
    iron: /iron[^0-9]*([0-9,]+)\\s*(mg)/gi,
    magnesium: /magnesium[^0-9]*([0-9,]+)\\s*(mg)/gi,
    zinc: /zinc[^0-9]*([0-9,]+)\\s*(mg)/gi,

    // Patrones para ácidos grasos
    omega3: /omega[^0-9]*3[^0-9]*([0-9,]+)\\s*(mg)/gi,
    epa: /\\bepa\\b[^0-9]*([0-9,]+)\\s*(mg)/gi,
    dha: /\\bdha\\b[^0-9]*([0-9,]+)\\s*(mg)/gi,

    // Patrones generales
    cantidadUnidad: /([0-9,]+\\.?[0-9]*)\\s*(mg|mcg|µg|g|ug|iu|ui)/gi
};

async function extraerComposicionReal(filename) {
    try {
        const dataBuffer = fs.readFileSync(\`./pdfs/\${filename}\`);
        const data = await pdf(dataBuffer);

        console.log(\`📄 Analizando: \${filename}\`);
        console.log(\`   📖 Páginas: \${data.numpages}\`);
        console.log(\`   📝 Texto extraído: \${data.text.length} caracteres\`);

        const composicion = analizarComposicion(data.text, filename);
        return composicion;

    } catch (error) {
        console.log(\`❌ Error al procesar \${filename}:\`, error.message);
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
            textoCompleto: texto.substring(0, 2000) // Primeros 2000 caracteres
        }
    };

    // Buscar sección de Supplement Facts
    const supplementMatch = texto.match(PATRONES_COMPOSICION.supplementFacts);
    if (supplementMatch) {
        const supplementText = supplementMatch[0];
        console.log(\`   ✅ Sección Supplement Facts encontrada (\${supplementText.length} caracteres)\`);

        // Extraer serving size
        const servingMatch = supplementText.match(PATRONES_COMPOSICION.servingSize);
        if (servingMatch) {
            composicion.supplementFacts.servingSize = servingMatch[1].trim();
        }

        // Extraer servings per container
        const servingsMatch = supplementText.match(PATRONES_COMPOSICION.servingsPerContainer);
        if (servingsMatch) {
            composicion.supplementFacts.servingsPerContainer = servingsMatch[1].trim();
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
        console.log(\`   ⚠️  No se encontró sección Supplement Facts\`);
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
        if (match) {
            const cantidad = match[1];
            const unidad = match[2];
            vitaminas[vitamina] = { cantidad, unidad };
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
        if (match) {
            const cantidad = match[1];
            const unidad = match[2];
            minerales[mineral] = { cantidad, unidad };
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
        if (match) {
            const cantidad = match[1];
            const unidad = match[2];
            acidosGrasos[acido] = { cantidad, unidad };
        }
    });

    return acidosGrasos;
}

function extraerOtrosIngredientes(texto) {
    const ingredientes = [];
    const regex = PATRONES_COMPOSICION.ingredienteConCantidad;
    let match;

    while ((match = regex.exec(texto)) !== null) {
        ingredientes.push({
            nombre: match[1].trim(),
            cantidad: match[2],
            unidad: match[3],
            infoAdicional: match[4] ? match[4].trim() : ''
        });
    }

    return ingredientes;
}

async function procesarTodosLosPDFs() {
    console.log('🔍 INICIANDO EXTRACCIÓN REAL DE COMPOSICIÓN NUTRICIONAL\\n');

    const pdfsDir = './pdfs';
    const archivos = fs.readdirSync(pdfsDir);
    const pdfFiles = archivos.filter(archivo => archivo.endsWith('.pdf'));

    console.log(\`📄 Encontrados \${pdfFiles.length} archivos PDF\`);

    const composiciones = [];
    let procesados = 0;
    let errores = 0;

    // Procesar primeros 10 PDFs como prueba
    const pdfsParaProcesar = pdfFiles.slice(0, 10);

    for (let i = 0; i < pdfsParaProcesar.length; i++) {
        const filename = pdfsParaProcesar[i];
        console.log(\`\\n📊 Procesando \${i + 1}/\${pdfsParaProcesar.length}: \${filename}\`);

        const composicion = await extraerComposicionReal(filename);
        if (composicion) {
            composiciones.push(composicion);
            procesados++;

            // Mostrar resumen
            const numVitaminas = Object.keys(composicion.supplementFacts.vitaminas).length;
            const numMinerales = Object.keys(composicion.supplementFacts.minerales).length;
            const numAcidos = Object.keys(composicion.supplementFacts.acidosGrasos).length;
            const numOtros = composicion.supplementFacts.otrosIngredientes.length;

            console.log(\`   📋 Vitaminas: \${numVitaminas}\`);
            console.log(\`   🔧 Minerales: \${numMinerales}\`);
            console.log(\`   🐟 Ácidos grasos: \${numAcidos}\`);
            console.log(\`   📦 Otros ingredientes: \${numOtros}\`);
        } else {
            errores++;
        }
    }

    // Guardar resultados
    const resultado = {
        success: true,
        version: "3.0-composicion-real-pdf-parse",
        fecha_procesamiento: new Date().toISOString(),
        total_pdfs_disponibles: pdfFiles.length,
        pdfs_procesados: procesados,
        pdfs_con_errores: errores,
        composiciones: composiciones
    };

    fs.writeFileSync('./data/composicion-real.json', JSON.stringify(resultado, null, 2));

    console.log(\`\\n✅ Procesamiento completado!\`);
    console.log(\`📊 PDFs procesados: \${procesados}/\${pdfsParaProcesar.length}\`);
    console.log(\`❌ PDFs con errores: \${errores}\`);
    console.log(\`📁 Resultados guardados en: data/composicion-real.json\`);

    return resultado;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    procesarTodosLosPDFs().catch(console.error);
}

module.exports = { extraerComposicionReal, procesarTodosLosPDFs };
`;

    fs.writeFileSync('./extraer-composicion-real.js', extractorCode);
    console.log('✅ Creado extractor real: extraer-composicion-real.js');
}

// Ejecutar instalación y procesamiento
async function main() {
    console.log('🔧 INICIANDO INSTALACIÓN Y PROCESAMIENTO DE PDFs\n');

    // Paso 1: Verificar/librerías
    const libreriasOK = verificarLibrerias();
    if (!libreriasOK) {
        console.log('❌ No se pudieron instalar las librerías necesarias');
        return;
    }

    // Paso 2: Crear extractor real
    console.log('\n🛠️ Creando extractor con pdf-parse...');
    crearExtractorReal();

    // Paso 3: Ejecutar extractor
    console.log('\n🔬 Ejecutando extractor de composición real...');
    try {
        execSync('node extraer-composicion-real.js', { stdio: 'inherit' });

        console.log('\n🎉 PROCESAMIENTO COMPLETADO!');
        console.log('='.repeat(60));
        console.log('✅ Librerías instaladas');
        console.log('✅ PDFs procesados con composición real');
        console.log('✅ Resultados guardados en data/composicion-real.json');

    } catch (error) {
        console.log('❌ Error en el procesamiento:', error.message);
    }
}

// Ejecutar
main().catch(console.error);