// PRUEBA DE RENDIMIENTO DE RED Y RECURSOS
// ========================================

class NetworkPerformanceTester {
    constructor() {
        this.testResults = {
            resourceLoading: [],
            networkRequests: [],
            totalSize: 0,
            compressionEfficiency: 0,
            cacheEfficiency: 0
        };
    }

    async runNetworkTests() {
        console.log('🌐 Iniciando pruebas de rendimiento de red...');

        await this.testResourceLoading();
        await this.testNetworkRequests();
        this.analyzeCompression();
        this.analyzeCaching();
        this.testDataLoading();

        this.generateReport();
        return this.testResults;
    }

    async testResourceLoading() {
        console.log('📦 Analizando carga de recursos...');

        const resources = performance.getEntriesByType('resource');
        const resourceAnalysis = resources.map(resource => ({
            name: resource.name.split('/').pop(),
            type: resource.initiatorType,
            duration: resource.duration,
            size: resource.transferSize || 0,
            decodedSize: resource.decodedBodySize || 0,
            compressed: resource.transferSize < resource.decodedBodySize,
            cached: resource.transferSize === 0,
            startTime: resource.startTime
        }));

        this.testResults.resourceLoading = resourceAnalysis;

        // Calcular estadísticas
        const totalSize = resourceAnalysis.reduce((sum, res) => sum + res.decodedSize, 0);
        const cachedSize = resourceAnalysis.filter(res => res.cached).reduce((sum, res) => sum + res.decodedSize, 0);
        const compressedSize = resourceAnalysis.filter(res => res.compressed).length;

        this.testResults.totalSize = totalSize;
        this.testResults.cacheEfficiency = Math.round((cachedSize / totalSize) * 100);
        this.testResults.compressionEfficiency = Math.round((compressedSize / resourceAnalysis.length) * 100);

        console.log(`  • Total recursos: ${resourceAnalysis.length}`);
        console.log(`  • Tamaño total: ${Math.round(totalSize / 1024)}KB`);
        console.log(`  • Eficiencia caché: ${this.testResults.cacheEfficiency}%`);
        console.log(`  • Eficiencia compresión: ${this.testResults.compressionEfficiency}%`);
    }

    async testNetworkRequests() {
        console.log('🔄 Analizando peticiones de red...');

        // Medir tiempo de respuesta del servidor
        const serverResponse = await this.measureServerResponse();
        this.testResults.networkRequests.push(serverResponse);

        // Probar carga de datos (PDFs, etc.)
        const dataLoading = await this.testDataLoading();
        this.testResults.networkRequests.push(dataLoading);
    }

    async measureServerResponse() {
        const startTime = performance.now();

        try {
            const response = await fetch('data/pdfs.json', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            const endTime = performance.now();

            return {
                type: 'Server Response',
                duration: endTime - startTime,
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                success: response.ok
            };
        } catch (error) {
            return {
                type: 'Server Response',
                duration: performance.now() - startTime,
                status: 'error',
                error: error.message,
                success: false
            };
        }
    }

    async testDataLoading() {
        console.log('📊 Probando carga de datos de PDFs...');

        const startTime = performance.now();

        try {
            const response = await fetch('data/pdfs.json');
            const data = await response.json();
            const endTime = performance.now();

            return {
                type: 'Data Loading',
                duration: endTime - startTime,
                dataSize: JSON.stringify(data).length,
                pdfCount: data.length,
                success: true
            };
        } catch (error) {
            return {
                type: 'Data Loading',
                duration: performance.now() - startTime,
                error: error.message,
                success: false
            };
        }
    }

    analyzeCompression() {
        const resources = this.testResults.resourceLoading;
        const compressibleResources = resources.filter(r =>
            r.type === 'script' || r.type === 'stylesheet' || r.name.endsWith('.json')
        );

        const compressionSavings = compressibleResources.reduce((total, resource) => {
            if (resource.compressed) {
                return total + (resource.decodedSize - resource.size);
            }
            return total;
        }, 0);

        console.log(`💾 Ahorro por compresión: ${Math.round(compressionSavings / 1024)}KB`);
    }

    analyzeCaching() {
        const cachedResources = this.testResults.resourceLoading.filter(r => r.cached);
        const nonCachedResources = this.testResults.resourceLoading.filter(r => !r.cached);

        console.log(`🗄️ Recursos en caché: ${cachedResources.length}/${this.testResults.resourceLoading.length}`);

        // Analizar qué recursos no están en caché
        const nonCachedTypes = nonCachedResources.reduce((types, resource) => {
            types[resource.type] = (types[resource.type] || 0) + 1;
            return types;
        }, {});

        console.log('Tipos no cacheados:', nonCachedTypes);
    }

    async testDataLoading() {
        // Esta función ya está definida arriba, pero la llamamos explícitamente
        console.log('📋 Verificando carga de datos de búsqueda...');

        try {
            const response = await fetch('data/search-data.json');
            if (response.ok) {
                const data = await response.json();
                console.log(`  • Datos de búsqueda cargados: ${Object.keys(data).length} entradas`);
            } else {
                console.warn('  ⚠️ No se pudieron cargar los datos de búsqueda');
            }
        } catch (error) {
            console.warn('  ❌ Error al cargar datos de búsqueda:', error.message);
        }
    }

    generateReport() {
        const report = {
            summary: {
                totalResources: this.testResults.resourceLoading.length,
                totalSizeKB: Math.round(this.testResults.totalSize / 1024),
                cacheEfficiency: this.testResults.cacheEfficiency,
                compressionEfficiency: this.testResults.compressionEfficiency,
                avgLoadTime: this.calculateAverageLoadTime()
            },
            recommendations: this.generateRecommendations(),
            detailedResults: this.testResults
        };

        console.log('\n=== INFORME DE RENDIMIENTO DE RED ===');
        console.log('Resumen:', report.summary);
        console.log('Recomendaciones:', report.recommendations);

        this.createVisualReport(report);
        return report;
    }

    calculateAverageLoadTime() {
        const validDurations = this.testResults.resourceLoading
            .filter(r => r.duration > 0)
            .map(r => r.duration);

        if (validDurations.length === 0) return 0;

        return Math.round(
            validDurations.reduce((sum, duration) => sum + duration, 0) / validDurations.length
        );
    }

    generateRecommendations() {
        const recommendations = [];
        const summary = this.calculateAverageLoadTime();

        // Recomendaciones de caché
        if (this.testResults.cacheEfficiency < 50) {
            recommendations.push({
                type: 'Caching',
                priority: 'high',
                message: 'Implementar caché de recursos estáticos',
                impact: 'high'
            });
        }

        // Recomendaciones de compresión
        if (this.testResults.compressionEfficiency < 80) {
            recommendations.push({
                type: 'Compression',
                priority: 'medium',
                message: 'Habilitar compresión gzip/brotli para recursos estáticos',
                impact: 'medium'
            });
        }

        // Recomendaciones de tamaño
        if (this.testResults.totalSize > 2000000) { // 2MB
            recommendations.push({
                type: 'Size',
                priority: 'medium',
                message: 'Optimizar tamaño de recursos (imágenes, scripts)',
                impact: 'medium'
            });
        }

        // Recomendaciones de tiempo de carga
        if (summary > 1000) { // 1 segundo
            recommendations.push({
                type: 'Load Time',
                priority: 'high',
                message: 'El tiempo de carga es superior a 1 segundo. Optimizar critical path.',
                impact: 'high'
            });
        }

        return recommendations;
    }

    createVisualReport(report) {
        const reportDiv = document.createElement('div');
        reportDiv.id = 'network-performance-report';
        reportDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: white;
            border: 2px solid #2196f3;
            border-radius: 10px;
            padding: 20px;
            max-width: 400px;
            max-height: 70vh;
            overflow-y: auto;
            z-index: 100002;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;

        reportDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #2196f3;">🌐 Rendimiento de Red</h3>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
            </div>

            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Recursos:</span>
                    <strong>${report.summary.totalResources}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Tamaño total:</span>
                    <strong>${report.summary.totalSizeKB}KB</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Tiempo promedio:</span>
                    <strong>${report.summary.avgLoadTime}ms</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Cache efficiency:</span>
                    <strong>${report.summary.cacheEfficiency}%</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Compresión:</span>
                    <strong>${report.summary.compressionEfficiency}%</strong>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <strong>Recomendaciones:</strong><br>
                ${report.recommendations.length > 0 ?
                    report.recommendations.map(rec =>
                        `• ${rec.message} <small style="color: ${rec.priority === 'high' ? '#d32f2f' : '#ff9800'}">(${rec.priority})</small>`
                    ).join('<br>') :
                    '<span style="color: #4caf50;">✅ Todo optimizado correctamente</span>'
                }
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                <small style="color: #666;">
                    Análisis: ${new Date().toLocaleTimeString()}
                </small>
            </div>
        `;

        document.body.appendChild(reportDiv);
    }
}

// Ejecutar prueba automáticamente
setTimeout(async () => {
    console.log('🚀 Iniciando pruebas de rendimiento de red...');
    const tester = new NetworkPerformanceTester();
    await tester.runNetworkTests();
    console.log('✅ Pruebas de red completadas.');
}, 7000);

console.log('✅ Analizador de rendimiento de red listo. Se ejecutará en 7 segundos...');