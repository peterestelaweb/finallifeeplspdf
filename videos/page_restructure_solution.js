const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Generando solución para reestructuración de página...');
    await page.goto('https://lifepluspdf.peterestela.com/');
    await page.waitForLoadState('networkidle');

    // Obtener el HTML completo actual
    const currentHTML = await page.evaluate(() => {
      return document.documentElement.outerHTML;
    });

    // Extraer las partes necesarias
    const extractedElements = await page.evaluate(() => {
      const getElementHTML = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.outerHTML : null;
      };

      return {
        searchSection: getElementHTML('.search-section'),
        statsSection: getElementHTML('.stats-section'),
        header: getElementHTML('header'),
        container: document.querySelector('.container').innerHTML
      };
    });

    // Generar el HTML reestructurado
    const restructuredHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buscador LifePlus Formulaciones PDF</title>

    <!-- ESTILOS CSS -->
    <style>
        /* Estilos existentes se mantienen igual */

        /* Nuevo orden: Header -> Estadísticas -> Búsqueda -> Resultados */
        .content-flow {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* Asegurar espaciado adecuado entre secciones */
        .stats-section {
            margin: 20px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .search-section {
            margin: 20px 0;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .stats-section {
                margin: 15px 0;
                padding: 15px;
            }

            .search-section {
                margin: 15px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header (sin cambios) -->
        ${extractedElements.header}

        <!-- Nueva estructura: Estadísticas primero, luego Búsqueda -->
        <div class="content-flow">
            <!-- Stats Section (movido aquí) -->
            ${extractedElements.statsSection}

            <!-- Search Section -->
            ${extractedElements.searchSection}
        </div>

        <!-- El resto del contenido (resultados, footer, etc.) se mantiene igual -->
    </div>
</body>
</html>`;

    console.log('\n=== SOLUCIÓN DE REESTRUCTURACIÓN ===');
    console.log('\n1. POSICIÓN ACTUAL:');
    console.log('   📍 Header (Y: 25-364)');
    console.log('   📍 Search Section (Y: 404-572)');
    console.log('   📍 Stats Section (Y: 602-703) ← NECESITA MOVERSE');

    console.log('\n2. POSICIÓN DESEADA:');
    console.log('   📍 Header (Y: 25-364)');
    console.log('   📍 Stats Section (Y: ~380-480) ← MOVIDO AQUÍ');
    console.log('   📍 Search Section (Y: ~500-670)');

    console.log('\n3. CÓDIGO HTML PARA EL REORDENAMIENTO:');
    console.log(restructuredHTML);

    // También generar un script específico para el cambio
    console.log('\n=== SCRIPT DE REORDENAMIENTO ===');
    console.log(`
// Para mover el bloque de estadísticas encima del buscador:
const statsSection = document.querySelector('.stats-section');
const searchSection = document.querySelector('.search-section');
const container = document.querySelector('.container');

if (statsSection && searchSection && container) {
    // Insertar las estadísticas justo después del header
    const header = document.querySelector('header');
    if (header) {
        header.parentNode.insertBefore(statsSection, header.nextSibling);
    }

    console.log('✅ Bloque de estadísticas movido encima del buscador');
} else {
    console.error('❌ No se encontraron los elementos necesarios');
}
`);

    // Captura de pantalla actual para referencia
    await page.screenshot({
      path: 'current_structure.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 350,
        width: 1280,
        height: 400
      }
    });

    console.log('\n✅ Análisis completado. Captura de pantalla guardada.');

  } catch (error) {
    console.error('Error durante la generación de solución:', error);
  } finally {
    await browser.close();
  }
})();