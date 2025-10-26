const fs = require('fs');
const pdf = require('pdf-parse');

console.log('🔬 PROCESANDO TODOS LOS PDFs PARA COMPOSICIÓN NUTRICIONAL EXACTA\n');

// Patrones mejorados para extraer información exacta
const PATRONES_EXTRACCION = {
    // Serving size
    servingSize: [
        /serving\s*size[\s:]*([^0-9\n]*[0-9,.]+\s*[^0-9\n]*capsules?)/gi,
        /serving\s*size[\s:]*([^0-9\n]*[0-9,.]+\s*[^0-9\n]*softgels?)/gi,
        /serving\s*size[\s:]*([^0-9\n]*[0-9,.]+\s*[^0-9\n]*tablet)/gi,
        /serving\s*size[\s:]*([^0-9\n]*[0-9,.]+\s*[^0-9\n]*scoop)/gi,
        /serving\s*size[\s:]*([^0-9\n]*[0-9,.]+\s*[^0-9\n]*[^0-9\n])/gi
    ],

    // Servings per container
    servingsPerContainer: [
        /servings\s*per\s*container[\s:]*([^0-9\n]*[0-9,]+[^0-9\n]*)/gi
    ],

    // Vitaminas con cantidades exactas
    vitaminas: {
        'Vitamin A': [
            /vitamin\s*a[^0-9]*([0-9,.]+)\s*(mcg|µg|iu|ui|rae)/gi,
            /vitamin\s*a[^0-9]*as\s*beta\s*carotene[^0-9]*([0-9,.]+)\s*(iu|ui)/gi
        ],
        'Vitamin C': [
            /vitamin\s*c[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /ascorbic\s*acid[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Vitamin D': [
            /vitamin\s*d[^0-9]*([0-9,.]+)\s*(iu|ui|mcg|µg)/gi,
            /cholecalciferol[^0-9]*([0-9,.]+)\s*(iu|ui|mcg|µg)/gi
        ],
        'Vitamin E': [
            /vitamin\s*e[^0-9]*([0-9,.]+)\s*(iu|ui|mg)/gi,
            /d-alpha\s*tocopherol[^0-9]*([0-9,.]+)\s*(iu|ui|mg)/gi
        ],
        'Vitamin K': [
            /vitamin\s*k[^0-9]*([0-9,.]+)\s*(mcg|µg)/gi
        ],
        'Thiamin (Vitamin B1)': [
            /thiamin[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /vitamin\s*b1[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Riboflavin (Vitamin B2)': [
            /riboflavin[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /vitamin\s*b2[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Niacin (Vitamin B3)': [
            /niacin[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /vitamin\s*b3[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Vitamin B6': [
            /vitamin\s*b6[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /pyridoxine[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Folate (Vitamin B9)': [
            /folate[^0-9]*([0-9,.]+)\s*(mcg|µg)/gi,
            /folic\s*acid[^0-9]*([0-9,.]+)\s*(mcg|µg)/gi
        ],
        'Vitamin B12': [
            /vitamin\s*b12[^0-9]*([0-9,.]+)\s*(mcg|µg)/gi,
            /cobalamin[^0-9]*([0-9,.]+)\s*(mcg|µg)/gi
        ],
        'Biotin (Vitamin B7)': [
            /biotin[^0-9]*([0-9,.]+)\s*(mcg|µg)/gi
        ],
        'Pantothenic Acid (Vitamin B5)': [
            /pantothenic\s*acid[^0-9]*([0-9,.]+)\s*(mg)/gi
        ]
    },

    // Minerales con cantidades exactas
    minerales: {
        'Calcium': [
            /calcium[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /calcio[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Iron': [
            /iron[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /hierro[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Magnesium': [
            /magnesium[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /magnesio[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Zinc': [
            /zinc[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Selenium': [
            /selenium[^0-9]*([0-9,.]+)\s*(mcg|µg)/gi
        ],
        'Copper': [
            /copper[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Manganese': [
            /manganese[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Chromium': [
            /chromium[^0-9]*([0-9,.]+)\s*(mcg|µg)/gi
        ],
        'Molybdenum': [
            /molybdenum[^0-9]*([0-9,.]+)\s*(mcg|µg)/gi
        ],
        'Potassium': [
            /potassium[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Iodine': [
            /iodine[^0-9]*([0-9,.]+)\s*(mcg|µg)/gi
        ]
    },

    // Ácidos grasos con cantidades exactas
    acidosGrasos: {
        'Total Omega-3': [
            /omega[-\s]*3[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /total\s*omega[-\s]*3[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'EPA (Eicosapentaenoic Acid)': [
            /\bepa\b[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /eicosapentaenoic[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'DHA (Docosahexaenoic Acid)': [
            /\bdha\b[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /docosahexaenoic[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'ALA (Alpha-Linolenic Acid)': [
            /\bala\b[^0-9]*([0-9,.]+)\s*(mg)/gi,
            /alpha[-\s]*linolenic[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Total Omega-6': [
            /omega[-\s]*6[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'GLA (Gamma-Linolenic Acid)': [
            /\bgla\b[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Omega-9': [
            /omega[-\s]*9[^0-9]*([0-9,.]+)\s*(mg)/gi
        ]
    },

    // Otros nutrientes importantes
    otrosNutrientes: {
        'Protein': [
            /protein[^0-9]*([0-9,.]+)\s*(g)/gi,
            /proteína[^0-9]*([0-9,.]+)\s*(g)/gi
        ],
        'Fiber': [
            /fiber[^0-9]*([0-9,.]+)\s*(g)/gi,
            /fibra[^0-9]*([0-9,.]+)\s*(g)/gi
        ],
        'Total Carbohydrate': [
            /total\s*carbohydrate[^0-9]*([0-9,.]+)\s*(g)/gi
        ],
        'Sugar': [
            /sugar[^0-9]*([0-9,.]+)\s*(g)/gi
        ],
        'Sodium': [
            /sodium[^0-9]*([0-9,.]+)\s*(mg)/gi
        ],
        'Cholesterol': [
            /cholesterol[^0-9]*([0-9,.]+)\s*(mg)/gi
        ]
    }
};

async function extraerComposicionCompleta(filename) {
    try {
        const dataBuffer = fs.readFileSync(`./pdfs/${filename}`);
        const data = await pdf(dataBuffer);

        console.log(`📄 Analizando: ${filename}`);
        console.log(`   📖 Páginas: ${data.numpages}`);

        const composicion = {
            filename: filename,
            nombreProducto: extraerNombreProducto(filename),
            supplementFacts: {
                servingSize: '',
                servingsPerContainer: '',
                vitaminas: {},
                minerales: {},
                acidosGrasos: {},
                otrosNutrientes: {},
                ingredientesLista: [],
                textoCompletoSupplementFacts: ''
            },
            infoAdicional: {
                ingredientesPrincipales: [],
                advertencias: [],
                instruccionesUso: '',
                alergenos: []
            }
        };

        // Extraer sección de Supplement Facts
        const supplementSection = extraerSupplementFacts(data.text);
        composicion.supplementFacts.textoCompletoSupplementFacts = supplementSection;

        // Extraer información básica
        composicion.supplementFacts.servingSize = extraerServingSize(supplementSection);
        composicion.supplementFacts.servingsPerContainer = extraerServingsPerContainer(supplementSection);

        // Extraer vitaminas
        composicion.supplementFacts.vitaminas = extraerGrupoNutrientes(supplementSection, PATRONES_EXTRACCION.vitaminas);

        // Extraer minerales
        composicion.supplementFacts.minerales = extraerGrupoNutrientes(supplementSection, PATRONES_EXTRACCION.minerales);

        // Extraer ácidos grasos
        composicion.supplementFacts.acidosGrasos = extraerGrupoNutrientes(supplementSection, PATRONES_EXTRACCION.acidosGrasos);

        // Extraer otros nutrientes
        composicion.supplementFacts.otrosNutrientes = extraerGrupoNutrientes(supplementSection, PATRONES_EXTRACCION.otrosNutrientes);

        // Extraer información adicional
        composicion.infoAdicional = extraerInformacionAdicional(data.text);

        // Mostrar resumen
        const numVitaminas = Object.keys(composicion.supplementFacts.vitaminas).length;
        const numMinerales = Object.keys(composicion.supplementFacts.minerales).length;
        const numAcidos = Object.keys(composicion.supplementFacts.acidosGrasos).length;
        const numOtros = Object.keys(composicion.supplementFacts.otrosNutrientes).length;

        console.log(`   ✅ Vitaminas: ${numVitaminas}`);
        console.log(`   ✅ Minerales: ${numMinerales}`);
        console.log(`   ✅ Ácidos grasos: ${numAcidos}`);
        console.log(`   ✅ Otros nutrientes: ${numOtros}`);

        return composicion;

    } catch (error) {
        console.log(`❌ Error al procesar ${filename}:`, error.message);
        return null;
    }
}

function extraerNombreProducto(filename) {
    return filename
        .replace(/\.[^/.]+$/, '') // Quitar extensión
        .replace(/[®™]/g, '') // Quitar símbolos
        .replace(/[-_]/g, ' ') // Reemplazar guiones por espacios
        .replace(/\s+/g, ' ') // Eliminar espacios múltiples
        .trim();
}

function extraerSupplementFacts(textoCompleto) {
    // Buscar la sección de Supplement Facts
    const supplementStart = textoCompleto.search(/supplement\s*facts/i);
    if (supplementStart === -1) {
        console.log('   ⚠️  No se encontró sección Supplement Facts');
        return '';
    }

    // Buscar el final de la sección
    const textoDesdeSupplement = textoCompleto.substring(supplementStart);

    // Posibles finales de la sección
    const finalesSeccion = [
        /\n\n\s*\*These\s*statement/i,
        /\n\n\s*Other\s*ingredients/i,
        /\n\n\s*Suggested\s*use/i,
        /\n\n\s*Directions/i,
        /\n\n\s*Warning/i,
        /\n\n[A-Z][A-Z\s]{10,}$/m,
        /\n\n%?\s*Daily\s*Value/i
    ];

    let textoSupplement = textoDesdeSupplement;
    for (const finalPatron of finalesSeccion) {
        const match = textoDesdeSupplement.match(finalPatron);
        if (match && match.index !== undefined) {
            textoSupplement = textoDesdeSupplement.substring(0, match.index);
            break;
        }
    }

    // Limitar a un máximo de 3000 caracteres para evitar extraer demasiado
    return textoSupplement.substring(0, 3000);
}

function extraerServingSize(texto) {
    for (const patron of PATRONES_EXTRACCION.servingSize) {
        const matches = [...texto.matchAll(patron)];
        for (const match of matches) {
            if (match && match[1]) {
                const servingSize = match[1].trim();
                if (servingSize.length > 3 && servingSize.length < 100) {
                    console.log(`   📊 Serving Size: ${servingSize}`);
                    return servingSize;
                }
            }
        }
    }
    return '';
}

function extraerServingsPerContainer(texto) {
    for (const patron of PATRONES_EXTRACCION.servingsPerContainer) {
        const matches = [...texto.matchAll(patron)];
        for (const match of matches) {
            if (match && match[1]) {
                const servings = match[1].trim();
                if (servings.match(/\d+/)) {
                    console.log(`   📦 Servings Per Container: ${servings}`);
                    return servings;
                }
            }
        }
    }
    return '';
}

function extraerGrupoNutrientes(texto, patrones) {
    const nutrientes = {};

    Object.entries(patrones).forEach(([nutriente, listaPatrones]) => {
        for (const patron of listaPatrones) {
            const matches = [...texto.matchAll(patron)];
            for (const match of matches) {
                if (match && match[1] && match[2]) {
                    const cantidad = match[1].replace(/,/g, '');
                    const unidad = match[2].toLowerCase();

                    nutrientes[nutriente] = {
                        cantidad: cantidad,
                        unidad: unidad,
                        textoCompleto: match[0]
                    };
                    console.log(`     ✅ ${nutriente}: ${cantidad} ${unidad}`);
                    break; // Solo tomar el primer match para cada nutriente
                }
            }
            if (nutrientes[nutriente]) break; // Si ya encontramos el nutriente, pasar al siguiente
        }
    });

    return nutrientes;
}

function extraerInformacionAdicional(textoCompleto) {
    const info = {
        ingredientesPrincipales: [],
        advertencias: [],
        instruccionesUso: '',
        alergenos: []
    };

    // Extraer ingredientes principales
    const ingredientesMatch = textoCompleto.match(/ingredients?:?\s*([^\n]+)/i);
    if (ingredientesMatch) {
        info.ingredientesPrincipales = ingredientesMatch[1].split(',').map(i => i.trim());
    }

    // Extraer advertencias
    const advertenciasMatch = textoCompleto.match(/warning[:\s]*([^\n]+)/gi);
    if (advertenciasMatch) {
        info.advertencias = advertenciasMatch.map(w => w.replace(/warning[:\s]*/i, '').trim());
    }

    // Extraer instrucciones de uso
    const usoMatch = textoCompleto.match(/(?:directions|suggested\s*use|instructions?)[:\s]*([^\n]+)/i);
    if (usoMatch) {
        info.instruccionesUso = usoMatch[1].trim();
    }

    // Extraer alérgenos comunes
    const alergenosComunes = ['soy', 'fish', 'shellfish', 'milk', 'wheat', 'nuts', 'egg'];
    alergenosComunes.forEach(alergeno => {
        if (textoCompleto.toLowerCase().includes(alergeno)) {
            info.alergenos.push(alergeno);
        }
    });

    return info;
}

async function procesarTodosLosPDFs() {
    console.log('🔍 PROCESANDO TODOS LOS PDFs PARA COMPOSICIÓN EXACTA\n');

    const pdfsDir = './pdfs';
    const archivos = fs.readdirSync(pdfsDir);
    const pdfFiles = archivos.filter(archivo => archivo.endsWith('.pdf')).sort();

    console.log(`📄 Encontrados ${pdfFiles.length} archivos PDF\n`);

    const composiciones = [];
    let procesados = 0;
    let errores = 0;
    let totalVitaminas = 0;
    let totalMinerales = 0;
    let totalAcidos = 0;

    // Procesar todos los PDFs en lotes pequeños para evitar sobrecarga
    const loteSize = 5;
    for (let i = 0; i < pdfFiles.length; i += loteSize) {
        const lote = pdfFiles.slice(i, i + loteSize);
        console.log(`\n📊 Procesando lote ${Math.floor(i/loteSize) + 1}/${Math.ceil(pdfFiles.length/loteSize)} (PDFs ${i+1}-${Math.min(i+loteSize, pdfFiles.length)})`);
        console.log('='.repeat(80));

        for (const filename of lote) {
            const composicion = await extraerComposicionCompleta(filename);
            if (composicion) {
                composiciones.push(composicion);
                procesados++;
                totalVitaminas += Object.keys(composicion.supplementFacts.vitaminas).length;
                totalMinerales += Object.keys(composicion.supplementFacts.minerales).length;
                totalAcidos += Object.keys(composicion.supplementFacts.acidosGrasos).length;
            } else {
                errores++;
            }
        }

        // Pequeña pausa entre lotes
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Guardar resultados
    const resultado = {
        success: true,
        version: "4.0-composicion-nutricional-completa",
        fecha_procesamiento: new Date().toISOString(),
        resumen: {
            total_pdfs_disponibles: pdfFiles.length,
            pdfs_procesados: procesados,
            pdfs_con_errores: errores,
            total_vitaminas_encontradas: totalVitaminas,
            total_minerales_encontrados: totalMinerales,
            total_acidos_grasos_encontrados: totalAcidos
        },
        composiciones: composiciones
    };

    fs.writeFileSync('./data/composicion-completa-final.json', JSON.stringify(resultado, null, 2));

    // Crear versión simplificada para el buscador
    const versionParaBuscador = composiciones.map(comp => ({
        filename: comp.filename,
        nombreProducto: comp.nombreProducto,
        servingSize: comp.supplementFacts.servingSize,
        servingsPerContainer: comp.supplementFacts.servingsPerContainer,
        vitaminas: comp.supplementFacts.vitaminas,
        minerales: comp.supplementFacts.minerales,
        acidosGrasos: comp.supplementFacts.acidosGrasos,
        otrosNutrientes: comp.supplementFacts.otrosNutrientes,
        ingredientesPrincipales: comp.infoAdicional.ingredientesPrincipales,
        alergenos: comp.infoAdicional.alergenos
    }));

    fs.writeFileSync('./data/composicion-para-buscador.json', JSON.stringify(versionParaBuscador, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('🎉 PROCESAMIENTO COMPLETADO!');
    console.log('='.repeat(80));
    console.log(`📊 PDFs procesados: ${procesados}/${pdfFiles.length}`);
    console.log(`❌ PDFs con errores: ${errores}`);
    console.log(`📋 Total vitaminas encontradas: ${totalVitaminas}`);
    console.log(`🔧 Total minerales encontrados: ${totalMinerales}`);
    console.log(`🐟 Total ácidos grasos encontrados: ${totalAcidos}`);
    console.log(`\n📁 Archivos generados:`);
    console.log(`   ✅ data/composicion-completa-final.json (Completo)`);
    console.log(`   ✅ data/composicion-para-buscador.json (Para búsqueda)`);
    console.log(`\n🚀 ¡LISTO PARA INTEGRAR EN EL BUSCADOR!`);

    return resultado;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    procesarTodosLosPDFs().catch(console.error);
}

module.exports = { extraerComposicionCompleta, procesarTodosLosPDFs };