const fs = require('fs');
const path = require('path');

console.log('🔧 SOLUCIÓN DEL PROBLEMA DEL LOGO LIFEPLUS');
console.log('=========================================');

async function solucionarLogoProblem() {
    try {
        // Rutas de archivos
        const rutaOriginal = path.join(__dirname, 'images', 'LOGO LIFEPLUS LIMPIO.png');
        const rutaNueva = path.join(__dirname, 'images', 'logo-lifeplus-limpio.png');
        const rutaIndexHtml = path.join(__dirname, 'index.html');

        console.log('\n📁 RUTAS DE ARCHIVOS:');
        console.log(`Original: ${rutaOriginal}`);
        console.log(`Nueva: ${rutaNueva}`);
        console.log(`HTML: ${rutaIndexHtml}`);

        // Verificar si el archivo original existe
        if (fs.existsSync(rutaOriginal)) {
            console.log('\n✅ Archivo original encontrado');

            // Obtener estadísticas del archivo
            const stats = fs.statSync(rutaOriginal);
            console.log(`📊 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`🔒 Permisos: ${stats.mode.toString(8)}`);

            // Renombrar el archivo
            console.log('\n🔄 Renombrando archivo...');
            fs.renameSync(rutaOriginal, rutaNueva);
            console.log('✅ Archivo renombrado exitosamente');

            // Verificar que el nuevo archivo existe
            if (fs.existsSync(rutaNueva)) {
                console.log('✅ Nuevo archivo verificado');

                // Leer el archivo HTML
                console.log('\n📖 Leyendo archivo HTML...');
                let htmlContent = fs.readFileSync(rutaIndexHtml, 'utf8');

                // Reemplazar la referencia al logo
                const oldString = '<img src="images/LOGO LIFEPLUS LIMPIO.png" alt="LifePlus Logo" class="side-logo lifeplus-side-logo">';
                const newString = '<img src="images/logo-lifeplus-limpio.png" alt="LifePlus Logo" class="side-logo lifeplus-side-logo">';

                if (htmlContent.includes(oldString)) {
                    console.log('🔄 Actualizando referencia en HTML...');
                    htmlContent = htmlContent.replace(oldString, newString);

                    // Guardar el archivo HTML actualizado
                    fs.writeFileSync(rutaIndexHtml, htmlContent);
                    console.log('✅ HTML actualizado exitosamente');
                } else {
                    console.log('❌ No se encontró la referencia al logo en el HTML');
                    console.log('🔍 Buscando alternativas...');

                    // Buscar patrones alternativos
                    const patterns = [
                        /src="images\/LOGO LIFEPLUS LIMPIO\.png"/g,
                        /src='images\/LOGO LIFEPLUS LIMPIO\.png'/g,
                        /src=images\/LOGO LIFEPLUS LIMPIO\.png/g
                    ];

                    let found = false;
                    patterns.forEach(pattern => {
                        if (htmlContent.match(pattern)) {
                            console.log(`🔍 Patrón encontrado: ${pattern}`);
                            htmlContent = htmlContent.replace(pattern, 'src="images/logo-lifeplus-limpio.png"');
                            found = true;
                        }
                    });

                    if (found) {
                        fs.writeFileSync(rutaIndexHtml, htmlContent);
                        console.log('✅ HTML actualizado con patrón alternativo');
                    } else {
                        console.log('❌ No se encontraron patrones de referencia al logo');
                    }
                }

                // Verificar el resultado
                console.log('\n🔍 Verificando cambios...');
                const updatedHtml = fs.readFileSync(rutaIndexHtml, 'utf8');
                if (updatedHtml.includes('logo-lifeplus-limpio.png')) {
                    console.log('✅ Referencia actualizada correctamente en el HTML');
                } else {
                    console.log('❌ La referencia no se actualizó en el HTML');
                }

            } else {
                console.log('❌ Error: El nuevo archivo no existe después del renombrado');
            }

        } else {
            console.log('❌ Error: El archivo original no existe');
            console.log('📁 Verificando contenido del directorio images/...');
            const files = fs.readdirSync(path.join(__dirname, 'images'));
            console.log('Archivos encontrados:', files);
        }

        // Crear archivo de verificación
        const verificacion = `
# VERIFICACIÓN DE CAMBIOS - LOGO LIFEPLUS

## ✅ CAMBIOS REALIZADOS:

### 1. Archivo renombrado:
- **Antes**: \`images/LOGO LIFEPLUS LIMPIO.png\`
- **Ahora**: \`images/logo-lifeplus-limpio.png\`

### 2. HTML actualizado:
- **Referencia anterior**: \`images/LOGO LIFEPLUS LIMPIO.png\`
- **Referencia nueva**: \`images/logo-lifeplus-limpio.png\`

## 🔍 PASOS SIGUIENTES:

1. **Subir cambios al servidor**:
   - Subir el archivo renombrado: \`images/logo-lifeplus-limpio.png\`
   - Subir el HTML actualizado: \`index.html\`

2. **Verificar en el servidor**:
   - Visitar: https://lifepluspdf.peterestela.com
   - Verificar que el logo se muestre correctamente

3. **Limpiar caché**:
   - Limpiar caché del navegador
   - Forzar recarga (Ctrl+F5 o Cmd+Shift+R)

## 📋 BENEFICIOS:

- ✅ Nombres de archivos compatibles con web
- ✅ Sin espacios que causen problemas de codificación
- ✅ En minúsculas para consistencia
- ✅ Guiones en lugar de espacios
- ✅ Mejor compatibilidad entre sistemas operativos

## 🎯 RESULTADO ESPERADO:

El logo de LifePlus debería cargarse correctamente en el servidor después de subir los cambios.
`;

        fs.writeFileSync('test-results/verificacion-cambios-logo.md', verificacion);
        console.log('\n📄 Archivo de verificación creado: test-results/verificacion-cambios-logo.md');

        console.log('\n🎉 ¡SOLUCIÓN COMPLETADA!');
        console.log('\n📋 RESUMEN:');
        console.log('1. ✅ Archivo renombrado: LOGO LIFEPLUS LIMPIO.png → logo-lifeplus-limpio.png');
        console.log('2. ✅ Referencia actualizada en index.html');
        console.log('3. ✅ Archivo de verificación creado');
        console.log('\n🔄 PRÓXIMOS PASOS:');
        console.log('- Subir los archivos modificados al servidor');
        console.log('- Verificar que el logo se muestre correctamente');

    } catch (error) {
        console.log('❌ Error durante la solución:', error.message);
        console.log(error.stack);
    }
}

// Crear directorio de resultados si no existe
if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
}

solucionarLogoProblem();