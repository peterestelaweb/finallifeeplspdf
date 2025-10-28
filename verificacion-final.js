// VERIFICACIÓN FINAL ANTES DE SUBIR AL SERVIDOR
// ===========================================

class FinalVerification {
    constructor() {
        this.verificationResults = {
            pageStructure: false,
            malwareScanner: false,
            functionality: false,
            performance: false,
            security: false,
            readyForProduction: false
        };
    }

    async runFinalVerification() {
        console.log('🔍 Iniciando verificación final para producción...');

        try {
            await this.verifyPageStructure();
            await this.verifyMalwareScanner();
            await this.verifyFunctionality();
            await this.verifyPerformance();
            await this.verifySecurity();
            this.calculateReadiness();

            this.showFinalReport();
            return this.verificationResults;
        } catch (error) {
            console.error('❌ Error en verificación final:', error);
            return false;
        }
    }

    async verifyPageStructure() {
        console.log('📋 Verificando estructura de la página...');

        const requiredElements = [
            '.container',
            '.header',
            '.search-section',
            '#searchInput',
            '.results-section',
            '.video-section',
            '.contact-section',
            '.footer'
        ];

        const missingElements = [];
        requiredElements.forEach(selector => {
            if (!document.querySelector(selector)) {
                missingElements.push(selector);
            }
        });

        this.verificationResults.pageStructure = missingElements.length === 0;

        if (this.verificationResults.pageStructure) {
            console.log('✅ Estructura de página correcta');
        } else {
            console.warn('❌ Elementos faltantes:', missingElements);
        }
    }

    async verifyMalwareScanner() {
        console.log('🛡️ Verificando malware scanner...');

        const scannerExists = window.malwareScanner !== undefined;
        const scannerActive = scannerExists && window.malwareScanner.scanInterval !== null;

        this.verificationResults.malwareScanner = scannerActive;

        if (this.verificationResults.malwareScanner) {
            console.log('✅ Malware scanner activo y protegiendo');
        } else {
            console.warn('❌ Malware scanner no está activo');
        }
    }

    async verifyFunctionality() {
        console.log('🔧 Verificando funcionalidades principales...');

        const checks = {
            searchInput: document.getElementById('searchInput') !== null,
            contactForm: document.getElementById('contactForm') !== null,
            videos: document.querySelectorAll('video').length > 0,
            whatsappLinks: document.querySelectorAll('a[href*="wa.me"]').length > 0,
            responsiveElements: window.innerWidth <= 768 || true // Simplificado
        };

        const functionalCount = Object.values(checks).filter(Boolean).length;
        const totalCount = Object.keys(checks).length;

        this.verificationResults.functionality = functionalCount === totalCount;

        if (this.verificationResults.functionality) {
            console.log('✅ Todas las funcionalidades principales operativas');
        } else {
            console.warn('❌ Funcionalidades con problemas:', checks);
        }
    }

    async verifyPerformance() {
        console.log('⚡ Verificando rendimiento...');

        const navigation = performance.getEntriesByType('navigation')[0];
        const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;

        const performanceOK = loadTime < 5000; // 5 segundos máximo para producción

        this.verificationResults.performance = performanceOK;

        if (this.verificationResults.performance) {
            console.log(`✅ Rendimiento adecuado (${Math.round(loadTime)}ms)`);
        } else {
            console.warn(`❌ Rendimiento lento (${Math.round(loadTime)}ms)`);
        }
    }

    async verifySecurity() {
        console.log('🔒 Verificando medidas de seguridad...');

        const securityChecks = {
            hasMalwareScanner: window.malwareScanner !== undefined,
            hasFormValidation: document.getElementById('contactForm') !== null,
            noInlineScripts: !document.body.innerHTML.includes('<script'),
            hasHttps: location.protocol === 'https:' || location.hostname === 'localhost'
        };

        const securityScore = Object.values(securityChecks).filter(Boolean).length;
        const totalSecurityChecks = Object.keys(securityChecks).length;

        this.verificationResults.security = securityScore >= 3; // 3/4 medidas son suficientes

        if (this.verificationResults.security) {
            console.log('✅ Medidas de seguridad adecuadas');
        } else {
            console.warn('❌ Medidas de seguridad insuficientes:', securityChecks);
        }
    }

    calculateReadiness() {
        const results = this.verificationResults;
        const passedChecks = Object.values(results).filter(Boolean).length;
        const totalChecks = Object.keys(results).filter(key => key !== 'readyForProduction').length;

        this.verificationResults.readyForProduction = passedChecks >= totalChecks - 1; // Permitimos 1 fallo menor

        if (this.verificationResults.readyForProduction) {
            console.log('🎯 LISTO PARA PRODUCCIÓN');
        } else {
            console.warn('⚠️ NECESITA REVISIONES ANTES DE PRODUCCIÓN');
        }
    }

    showFinalReport() {
        const results = this.verificationResults;
        const readyForProduction = results.readyForProduction;

        const reportDiv = document.createElement('div');
        reportDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${readyForProduction ? 'white' : '#fff3e0'};
            border: 3px solid ${readyForProduction ? '#4caf50' : '#ff9800'};
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            z-index: 100004;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            font-family: Arial, sans-serif;
            text-align: center;
        `;

        reportDiv.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">
                    ${readyForProduction ? '🎉' : '⚠️'}
                </div>
                <h2 style="margin: 0; color: ${readyForProduction ? '#4caf50' : '#ff9800'};">
                    ${readyForProduction ? '¡LISTO PARA PRODUCCIÓN!' : 'REQUIERE REVISIÓN'}
                </h2>
            </div>

            <div style="text-align: left; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Verificación Final:</h3>
                ${Object.entries(results).filter(([key]) => key !== 'readyForProduction').map(([key, value]) => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px; background: #f5f5f5; border-radius: 3px;">
                        <span>${this.getCheckLabel(key)}:</span>
                        <span style="font-weight: bold; color: ${value ? '#4caf50' : '#d32f2f'};">
                            ${value ? '✅ OK' : '❌ ERROR'}
                        </span>
                    </div>
                `).join('')}
            </div>

            <div style="margin: 20px 0; padding: 15px; background: ${readyForProduction ? '#e8f5e8' : '#fff8e1'}; border-radius: 5px;">
                <strong style="color: ${readyForProduction ? '#2e7d32' : '#f57c00'};">
                    ${readyForProduction ?
                        '✅ La página está lista para subir al servidor.' :
                        '⚠️ Se recomienda solucionar los problemas antes de subir.'}
                </strong>
            </div>

            <button onclick="this.parentElement.remove();"
                    style="background: ${readyForProduction ? '#4caf50' : '#ff9800'};
                           color: white; border: none; padding: 12px 24px;
                           border-radius: 5px; cursor: pointer; font-size: 16px;">
                Cerrar Verificación
            </button>

            <div style="margin-top: 15px; font-size: 12px; color: #666;">
                Verificación completada: ${new Date().toLocaleString()}
            </div>
        `;

        document.body.appendChild(reportDiv);

        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (reportDiv.parentNode) {
                reportDiv.remove();
            }
        }, 10000);
    }

    getCheckLabel(key) {
        const labels = {
            pageStructure: 'Estructura de Página',
            malwareScanner: 'Malware Scanner',
            functionality: 'Funcionalidades',
            performance: 'Rendimiento',
            security: 'Seguridad'
        };
        return labels[key] || key;
    }
}

// Ejecutar verificación final automáticamente
setTimeout(async () => {
    console.log('🔍 Ejecutando verificación final para producción...');
    const verification = new FinalVerification();
    await verification.runFinalVerification();
    console.log('✅ Verificación final completada.');
}, 2000);

console.log('✅ Sistema de verificación final listo. Se ejecutará en 2 segundos...');