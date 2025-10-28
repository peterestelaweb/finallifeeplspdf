// SCRIPT DE ANÁLISIS DE RENDIMIENTO Y SEGURIDAD
// =================================================

class PerformanceAnalyzer {
    constructor() {
        this.performanceData = {
            loadTimes: {},
            resources: [],
            memoryUsage: {},
            securityMeasures: []
        };
    }

    async analyzePage() {
        console.log('🔍 Iniciando análisis de rendimiento y seguridad...');

        // Medir tiempos de carga
        this.measureLoadTimes();

        // Analizar recursos
        this.analyzeResources();

        // Medir uso de memoria
        this.measureMemoryUsage();

        // Evaluar medidas de seguridad
        this.evaluateSecurityMeasures();

        // Probar rendimiento de búsqueda
        await this.testSearchPerformance();

        return this.performanceData;
    }

    measureLoadTimes() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.performanceData.loadTimes = {
                domComplete: navigation.domComplete,
                loadEventEnd: navigation.loadEventEnd,
                firstContentfulPaint: this.getFCP(),
                largestContentfulPaint: this.getLCP(),
                cumulativeLayoutShift: this.getCLS()
            };
            console.log('⏱️ Tiempos de carga medidos:', this.performanceData.loadTimes);
        }
    }

    getFCP() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
    }

    getLCP() {
        // Simplificado - en producción usar LCP API
        return performance.getEntriesByType('resource')
            .reduce((latest, entry) => Math.max(latest, entry.responseEnd), 0);
    }

    getCLS() {
        // Simplificado - en producción usar CLS API
        return 0; // No disponible sin observer
    }

    analyzeResources() {
        const resources = performance.getEntriesByType('resource');
        this.performanceData.resources = resources.map(resource => ({
            name: resource.name,
            type: resource.initiatorType,
            duration: resource.duration,
            size: resource.transferSize || 0,
            decodedSize: resource.decodedBodySize || 0
        }));

        console.log('📊 Recursos analizados:', this.performanceData.resources.length);
    }

    measureMemoryUsage() {
        if (performance.memory) {
            this.performanceData.memoryUsage = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
            console.log('💾 Uso de memoria:', this.performanceData.memoryUsage);
        }
    }

    evaluateSecurityMeasures() {
        const malwareScanner = window.malwareScanner;
        if (malwareScanner) {
            this.performanceData.securityMeasures.push({
                type: 'Malware Scanner',
                status: 'active',
                blockedDomains: malwareScanner.blockedDomains.length,
                scanFrequency: '1 segundo'
            });
            console.log('🛡️ Scanner de malware detectado y activo');
        }

        // Verificar headers de seguridad
        const securityHeaders = {
            'Content-Security-Policy': document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
            'X-Frame-Options': document.querySelector('meta[http-equiv="X-Frame-Options"]'),
            'X-Content-Type-Options': document.querySelector('meta[http-equiv="X-Content-Type-Options"]')
        };

        Object.entries(securityHeaders).forEach(([header, element]) => {
            if (element) {
                this.performanceData.securityMeasures.push({
                    type: 'Security Header',
                    header: header,
                    status: 'present'
                });
            }
        });
    }

    async testSearchPerformance() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // Probar rendimiento de búsqueda con diferentes términos
            const testTerms = ['Omega3', 'Daily', 'Vitamin', 'LifePlus'];
            const searchResults = [];

            for (const term of testTerms) {
                const startTime = performance.now();
                searchInput.value = term;
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));

                // Esperar resultados (simulación)
                await new Promise(resolve => setTimeout(resolve, 100));

                const endTime = performance.now();
                searchResults.push({
                    term: term,
                    searchTime: endTime - startTime
                });
            }

            this.performanceData.searchPerformance = searchResults;
            console.log('🔍 Rendimiento de búsqueda:', searchResults);
        }
    }

    generateReport() {
        const report = {
            summary: {
                totalResources: this.performanceData.resources.length,
                loadTime: this.performanceData.loadTimes.loadEventEnd || 0,
                securityMeasures: this.performanceData.securityMeasures.length,
                memoryUsageMB: this.performanceData.memoryUsage.usedJSHeapSize ?
                    Math.round(this.performanceData.memoryUsage.usedJSHeapSize / 1024 / 1024) : 0
            },
            recommendations: this.generateRecommendations(),
            performanceData: this.performanceData
        };

        console.log('📋 Informe generado:', report);
        return report;
    }

    generateRecommendations() {
        const recommendations = [];

        // Analizar tiempos de carga
        if (this.performanceData.loadTimes.loadEventEnd > 3000) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: 'El tiempo de carga es superior a 3 segundos. Considera optimizar recursos.',
                impact: 'high'
            });
        }

        // Analizar recursos grandes
        const largeResources = this.performanceData.resources.filter(r => r.decodedSize > 500000);
        if (largeResources.length > 0) {
            recommendations.push({
                type: 'performance',
                priority: 'medium',
                message: `Hay ${largeResources.length} recursos grandes (>500KB). Considera compresión.`,
                impact: 'medium'
            });
        }

        // Analizar uso de memoria
        if (this.performanceData.memoryUsage.usedJSHeapSize > 50000000) {
            recommendations.push({
                type: 'memory',
                priority: 'medium',
                message: 'Uso de memoria alto. Revisar posibles memory leaks.',
                impact: 'medium'
            });
        }

        // Evaluar impacto de medidas de seguridad
        const malwareScanTime = this.measureMalwareScanImpact();
        if (malwareScanTime > 100) {
            recommendations.push({
                type: 'security',
                priority: 'low',
                message: 'El scanner de malware puede estar afectando el rendimiento. Considera ajustar la frecuencia.',
                impact: 'low'
            });
        }

        return recommendations;
    }

    measureMalwareScanImpact() {
        const startScan = performance.now();
        if (window.malwareScanner) {
            window.malwareScanner.scan();
        }
        const endScan = performance.now();
        return endScan - startScan;
    }
}

// Función para ejecutar análisis completo
async function runCompleteAnalysis() {
    console.log('🚀 Iniciando análisis completo de rendimiento y seguridad...');

    const analyzer = new PerformanceAnalyzer();
    const data = await analyzer.analyzePage();
    const report = analyzer.generateReport();

    // Mostrar resultados en consola
    console.log('\n=== INFORME DE ANÁLISIS ===');
    console.log('Resumen:', report.summary);
    console.log('Recomendaciones:', report.recommendations);
    console.log('Datos completos:', report.performanceData);

    // También crear versión visible en la página
    displayResults(report);

    return report;
}

// Función para mostrar resultados en la página
function displayResults(report) {
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'performance-results';
    resultsDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: white;
        border: 2px solid #4c1d95;
        border-radius: 10px;
        padding: 20px;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 100000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;

    resultsDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #4c1d95;">📊 Análisis de Rendimiento</h3>
            <button onclick="this.parentElement.parentElement.remove()"
                    style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
        </div>

        <div style="margin-bottom: 15px;">
            <strong>Resumen:</strong><br>
            • Recursos: ${report.summary.totalResources}<br>
            • Tiempo carga: ${Math.round(report.summary.loadTime)}ms<br>
            • Memoria: ${report.summary.memoryUsageMB}MB<br>
            • Medidas seguridad: ${report.summary.securityMeasures}
        </div>

        <div style="margin-bottom: 15px;">
            <strong>Recomendaciones:</strong><br>
            ${report.recommendations.map(rec =>
                `• ${rec.message} (${rec.priority})`
            ).join('<br>')}
        </div>

        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            <small style="color: #666;">
                Análisis completado el ${new Date().toLocaleString()}
            </small>
        </div>
    `;

    document.body.appendChild(resultsDiv);
}

// Ejecutar análisis automáticamente después de 3 segundos
setTimeout(() => {
    runCompleteAnalysis();
}, 3000);

console.log('✅ Analizador de rendimiento listo. Se ejecutará en 3 segundos...');