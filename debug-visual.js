// SCRIPT DE DIAGNÓSTICO VISUAL CON MCP CHROME
// =========================================

class VisualDiagnostics {
    constructor() {
        this.issues = [];
        this.screenshots = [];
    }

    async runDiagnostics() {
        console.log('🔍 Iniciando diagnóstico visual completo...');

        // 1. Verificar animación del header
        this.checkHeaderAnimation();

        // 2. Verificar layout de vídeos
        this.checkVideoLayout();

        // 3. Verificar mensaje de no resultados
        this.checkNoResultsMessage();

        // 4. Capturar información del estado actual
        this.captureCurrentState();

        // 5. Generar informe
        this.generateDiagnosticReport();

        return this.issues;
    }

    checkHeaderAnimation() {
        console.log('🎨 Verificando animación del header...');

        const header = document.querySelector('.header');
        if (!header) {
            this.issues.push({
                type: 'error',
                component: 'header',
                message: 'Header no encontrado'
            });
            return;
        }

        // Verificar estilos CSS aplicados
        const computedStyle = window.getComputedStyle(header);
        const animation = computedStyle.animation;
        const boxShadow = computedStyle.boxShadow;
        const borderBottom = computedStyle.borderBottom;

        console.log('Estilos del header:', {
            animation: animation,
            boxShadow: boxShadow,
            borderBottom: borderBottom
        });

        if (animation === 'none') {
            this.issues.push({
                type: 'error',
                component: 'header-animation',
                message: 'La animación del header no está activa',
                solution: 'Verificar que la keyframe headerGlow esté definida'
            });
        }

        if (borderBottom === 'none' || borderBottom === '0px') {
            this.issues.push({
                type: 'warning',
                component: 'header-border',
                message: 'El borde diferenciador del header no se está aplicando',
                solution: 'Revisar border-image CSS'
            });
        }

        // Verificar si las keyframes existen
        const stylesheet = Array.from(document.styleSheets).find(sheet =>
            sheet.href && sheet.href.includes('styles.css')
        );

        if (stylesheet) {
            try {
                const rules = Array.from(stylesheet.cssRules || stylesheet.rules || []);
                const hasHeaderGlow = rules.some(rule =>
                    rule.name && rule.name.includes('headerGlow')
                );

                if (!hasHeaderGlow) {
                    this.issues.push({
                        type: 'error',
                        component: 'header-keyframes',
                        message: 'La keyframe @keyframes headerGlow no se encuentra en el CSS',
                        solution: 'Añadir la animación headerGlow al CSS'
                    });
                }
            } catch (e) {
                this.issues.push({
                    type: 'warning',
                    component: 'css-access',
                    message: 'No se puede acceder a las reglas CSS (posible CORS)',
                    solution: 'Verificar que el CSS se cargue correctamente'
                });
            }
        }
    }

    checkVideoLayout() {
        console.log('📹 Verificando layout de vídeos...');

        const videoCards = document.querySelectorAll('.video-card');
        const videos = document.querySelectorAll('video');
        const phoneFrames = document.querySelectorAll('.phone-frame');

        console.log('Elementos de video encontrados:', {
            videoCards: videoCards.length,
            videos: videos.length,
            phoneFrames: phoneFrames.length
        });

        if (videoCards.length === 0) {
            this.issues.push({
                type: 'error',
                component: 'video-section',
                message: 'No se encuentran las video cards',
                solution: 'Verificar HTML de la sección de vídeos'
            });
            return;
        }

        videoCards.forEach((card, index) => {
            const computedStyle = window.getComputedStyle(card);
            const video = card.querySelector('video');
            const phoneFrame = card.querySelector('.phone-frame');

            // Verificar dimensiones
            const rect = card.getBoundingClientRect();
            const aspectRatio = rect.width / rect.height;

            if (video) {
                const videoRect = video.getBoundingClientRect();
                const frameRect = phoneFrame ? phoneFrame.getBoundingClientRect() : null;

                // Verificar si el video está bien posicionado dentro del frame
                if (frameRect) {
                    const horizontalFit = Math.abs(videoRect.width - frameRect.width) < 10;
                    const verticalFit = Math.abs(videoRect.height - frameRect.height) < 10;

                    if (!horizontalFit || !verticalFit) {
                        this.issues.push({
                            type: 'warning',
                            component: `video-${index}`,
                            message: `Video ${index + 1} no está bien dimensionado dentro del frame`,
                            details: {
                                videoSize: `${Math.round(videoRect.width)}x${Math.round(videoRect.height)}`,
                                frameSize: `${Math.round(frameRect.width)}x${Math.round(frameRect.height)}`
                            }
                        });
                    }
                }
            }
        });

        // Verificar CSS de video cards
        const firstVideoCard = videoCards[0];
        if (firstVideoCard) {
            const videoCardStyle = window.getComputedStyle(firstVideoCard);
            console.log('Estilos de video card:', {
                display: videoCardStyle.display,
                gridTemplateColumns: videoCardStyle.gridTemplateColumns,
                gap: videoCardStyle.gap
            });
        }
    }

    checkNoResultsMessage() {
        console.log('🔍 Verificando mensaje de no resultados...');

        const noResults = document.getElementById('noResults');
        if (!noResults) {
            this.issues.push({
                type: 'error',
                component: 'no-results',
                message: 'Elemento #noResults no encontrado',
                solution: 'Verificar que el elemento exista en el HTML'
            });
            return;
        }

        // Verificar contenido actual
        const currentContent = noResults.innerHTML;
        console.log('Contenido actual de no results:', currentContent);

        // Verificar si tiene el diseño nuevo o el viejo
        const hasOldDesign = currentContent.includes('fa-search') &&
                           !currentContent.includes('suggestion-tag');

        if (hasOldDesign) {
            this.issues.push({
                type: 'error',
                component: 'no-results-design',
                message: 'Todavía está usando el diseño viejo de la lupa',
                solution: 'Verificar que el HTML se haya actualizado correctamente'
            });
        }

        // Verificar si tiene el diseño nuevo
        const hasNewDesign = currentContent.includes('no-results-content') &&
                           currentContent.includes('suggestion-tag');

        if (!hasNewDesign) {
            this.issues.push({
                type: 'error',
                component: 'no-results-new-design',
                message: 'No se encuentra el nuevo diseño del mensaje',
                solution: 'Actualizar el HTML con el nuevo diseño'
            });
        } else {
            // Verificar estilos del nuevo diseño
            const iconCircle = noResults.querySelector('.icon-circle');
            const suggestionTags = noResults.querySelectorAll('.suggestion-tag');

            if (iconCircle) {
                const iconStyle = window.getComputedStyle(iconCircle);
                console.log('Estilos del icon circle:', {
                    width: iconStyle.width,
                    height: iconStyle.height,
                    animation: iconStyle.animation
                });

                if (iconStyle.animation === 'none') {
                    this.issues.push({
                        type: 'warning',
                        component: 'no-results-animation',
                        message: 'La animación del icono no está activa',
                        solution: 'Verificar keyframes gentleFloat y pulseGlow'
                    });
                }
            }

            console.log('Tags de sugerencia encontrados:', suggestionTags.length);
        }
    }

    captureCurrentState() {
        console.log('📸 Capturando estado actual...');

        // Información del viewport
        this.viewportInfo = {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
        };

        // Información de carga CSS
        const stylesheets = Array.from(document.styleSheets);
        this.cssInfo = {
            total: stylesheets.length,
            loaded: stylesheets.filter(sheet => sheet.href).length,
            list: stylesheets.map(sheet => sheet.href).filter(Boolean)
        };

        console.log('Estado actual:', {
            viewport: this.viewportInfo,
            css: this.cssInfo
        });
    }

    generateDiagnosticReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: this.viewportInfo,
            css: this.cssInfo,
            issues: this.issues,
            summary: {
                total: this.issues.length,
                errors: this.issues.filter(i => i.type === 'error').length,
                warnings: this.issues.filter(i => i.type === 'warning').length
            }
        };

        console.log('\n=== INFORME DE DIAGNÓSTICO VISUAL ===');
        console.log('URL:', report.url);
        console.log('Viewport:', report.viewport);
        console.log('Issues totales:', report.summary.total);
        console.log('Errores:', report.summary.errors);
        console.log('Warnings:', report.summary.warnings);

        if (this.issues.length > 0) {
            console.log('\n🚨 PROBLEMAS DETECTADOS:');
            this.issues.forEach((issue, index) => {
                console.log(`${index + 1}. [${issue.type.toUpperCase()}] ${issue.component}`);
                console.log(`   Mensaje: ${issue.message}`);
                if (issue.details) console.log(`   Detalles:`, issue.details);
                if (issue.solution) console.log(`   Solución: ${issue.solution}`);
                console.log('');
            });
        } else {
            console.log('✅ No se detectaron problemas');
        }

        // Crear informe visual en la página
        this.createVisualReport(report);

        return report;
    }

    createVisualReport(report) {
        const reportDiv = document.createElement('div');
        reportDiv.id = 'visual-diagnostic-report';
        reportDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: white;
            border: 2px solid #e53e3e;
            border-radius: 10px;
            padding: 15px;
            max-width: 400px;
            max-height: 70vh;
            overflow-y: auto;
            z-index: 100005;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: monospace;
            font-size: 12px;
        `;

        const hasErrors = report.summary.errors > 0;
        const borderColor = hasErrors ? '#e53e3e' : '#48bb78';

        reportDiv.style.borderColor = borderColor;

        reportDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: ${borderColor};">🔍 Diagnóstico Visual</h3>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="background: none; border: none; font-size: 16px; cursor: pointer;">×</button>
            </div>

            <div style="margin-bottom: 10px;">
                <strong>URL:</strong> ${report.url}<br>
                <strong>Viewport:</strong> ${report.viewport.width}x${report.viewport.height}<br>
                <strong>CSS cargados:</strong> ${report.css.loaded}/${report.css.total}
            </div>

            <div style="margin-bottom: 10px;">
                <strong>Issues:</strong> ${report.summary.total} (${report.summary.errors} errores, ${report.summary.warnings} warnings)
            </div>

            ${report.issues.length > 0 ? `
                <div style="background: #fff5f5; border-radius: 5px; padding: 10px;">
                    <strong>Problemas detectados:</strong><br>
                    ${report.issues.map(issue =>
                        `<div style="margin: 5px 0; padding: 5px; background: ${issue.type === 'error' ? '#fed7d7' : '#fef5e7'}; border-radius: 3px;">
                            <span style="color: ${issue.type === 'error' ? '#e53e3e' : '#dd6b20'}">
                                [${issue.type.toUpperCase()}]
                            </span> ${issue.component}<br>
                            <small>${issue.message}</small>
                            ${issue.solution ? `<br><small><strong>Solución:</strong> ${issue.solution}</small>` : ''}
                        </div>`
                    ).join('')}
                </div>
            ` : `
                <div style="background: #f0fff4; border-radius: 5px; padding: 10px; color: #22543d;">
                    ✅ No se detectaron problemas visuales
                </div>
            `}

            <div style="margin-top: 10px; font-size: 10px; color: #666; text-align: center;">
                Generado: ${new Date().toLocaleString()}
            </div>
        `;

        document.body.appendChild(reportDiv);

        // Auto-remover después de 15 segundos
        setTimeout(() => {
            if (reportDiv.parentNode) {
                reportDiv.remove();
            }
        }, 15000);
    }
}

// Ejecutar diagnóstico automáticamente
setTimeout(() => {
    console.log('🔍 Iniciando diagnóstico visual automático...');
    const diagnostics = new VisualDiagnostics();
    diagnostics.runDiagnostics();
}, 1000);

console.log('✅ Sistema de diagnóstico visual listo. Se ejecutará en 1 segundo...');