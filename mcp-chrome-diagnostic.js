/**
 * Diagnostic Script for LIFEPLUS Page Issues
 * This script analyzes video playback, spacing issues, and header animations
 * Run this in the browser console on the target page
 */

console.log('🔍 Starting comprehensive page diagnosis...');

class PageDiagnostic {
    constructor() {
        this.results = {
            videos: [],
            spacing: {},
            header: {},
            layout: {},
            performance: {}
        };
        this.startTime = performance.now();
    }

    // Main diagnostic function
    async runFullDiagnosis() {
        console.log('📊 Running complete page diagnosis...');

        try {
            await this.diagnoseVideos();
            await this.diagnoseSpacing();
            await this.diagnoseHeader();
            await this.diagnoseLayout();
            await this.measurePerformance();

            this.generateReport();
        } catch (error) {
            console.error('❌ Diagnostic error:', error);
        }
    }

    // Video Diagnostics
    async diagnoseVideos() {
        console.log('🎥 Analyzing video elements...');

        const videos = document.querySelectorAll('video');
        const videoCards = document.querySelectorAll('.video-card');

        this.results.videos = {
            totalVideos: videos.length,
            totalCards: videoCards.length,
            details: []
        };

        videos.forEach((video, index) => {
            const diagnosis = {
                index: index,
                id: video.id || `video-${index}`,
                src: video.src,
                currentSrc: video.currentSrc,
                readyState: video.readyState,
                networkState: video.networkState,
                paused: video.paused,
                ended: video.ended,
                muted: video.muted,
                autoplay: video.autoplay,
                loop: video.loop,
                playsinline: video.playsinline,
                preload: video.preload,
                duration: video.duration,
                currentTime: video.currentTime,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                naturalWidth: video.naturalWidth,
                naturalHeight: video.naturalHeight,
                style: {
                    width: video.style.width || window.getComputedStyle(video).width,
                    height: video.style.height || window.getComputedStyle(video).height,
                    objectFit: window.getComputedStyle(video).objectFit,
                    display: window.getComputedStyle(video).display
                },
                parent: {
                    tagName: video.parentElement?.tagName,
                    className: video.parentElement?.className,
                    dimensions: video.parentElement ? {
                        width: video.parentElement.offsetWidth,
                        height: video.parentElement.offsetHeight
                    } : null
                },
                issues: []
            };

            // Check for issues
            if (!video.src && !video.currentSrc) {
                diagnosis.issues.push('❌ No video source found');
            }

            if (video.readyState < 2) {
                diagnosis.issues.push('⚠️ Video not loaded (readyState < 2)');
            }

            if (video.paused && video.autoplay) {
                diagnosis.issues.push('⚠️ Autoplay failed - video is paused');
            }

            if (video.networkState === 3) {
                diagnosis.issues.push('❌ Network error - video failed to load');
            }

            if (video.videoWidth === 0 || video.videoHeight === 0) {
                diagnosis.issues.push('❌ Video dimensions are 0');
            }

            // Check phone mockup container
            const phoneScreen = video.closest('.phone-screen');
            if (phoneScreen) {
                const phoneDimensions = {
                    width: phoneScreen.offsetWidth,
                    height: phoneScreen.offsetHeight
                };
                diagnosis.phoneScreen = phoneDimensions;

                // Check if video fits properly in phone screen
                if (phoneDimensions.width > 0 && phoneDimensions.height > 0) {
                    const videoAspectRatio = video.videoWidth / video.videoHeight;
                    const phoneAspectRatio = phoneDimensions.width / phoneDimensions.height;

                    if (Math.abs(videoAspectRatio - phoneAspectRatio) > 0.2) {
                        diagnosis.issues.push('⚠️ Aspect ratio mismatch between video and container');
                    }
                }
            }

            this.results.videos.details.push(diagnosis);
        });

        // Analyze video cards
        videoCards.forEach((card, index) => {
            const dimensions = card.getBoundingClientRect();
            const videoInCard = card.querySelector('video');

            if (videoInCard) {
                const videoRect = videoInCard.getBoundingClientRect();
                const diagnosis = this.results.videos.details.find(v => v.id === videoInCard.id);
                if (diagnosis) {
                    diagnosis.cardDimensions = {
                        width: dimensions.width,
                        height: dimensions.height,
                        top: dimensions.top,
                        left: dimensions.left
                    };

                    diagnosis.videoInCardPosition = {
                        width: videoRect.width,
                        height: videoRect.height,
                        top: videoRect.top - dimensions.top,
                        left: videoRect.left - dimensions.left
                    };
                }
            }
        });

        console.log('✅ Video analysis complete:', this.results.videos);
    }

    // Spacing Diagnostics
    async diagnoseSpacing() {
        console.log('📏 Analyzing spacing between elements...');

        const searchSection = document.querySelector('.search-section');
        const resultsSection = document.querySelector('.results-section');
        const videoSection = document.querySelector('.video-section');
        const header = document.querySelector('.header');

        if (searchSection && resultsSection) {
            const searchRect = searchSection.getBoundingClientRect();
            const resultsRect = resultsSection.getBoundingClientRect();

            this.results.spacing = {
                searchToResults: {
                    distance: resultsRect.top - searchRect.bottom,
                    searchBottom: searchRect.bottom,
                    resultsTop: resultsRect.top,
                    searchHeight: searchRect.height,
                    resultsHeight: resultsRect.height,
                    unit: 'px'
                },
                searchMarginBottom: window.getComputedStyle(searchSection).marginBottom,
                resultsMarginTop: window.getComputedStyle(resultsSection).marginTop
            };

            // Check computed styles
            this.results.spacing.searchComputed = {
                marginBottom: window.getComputedStyle(searchSection).marginBottom,
                paddingBottom: window.getComputedStyle(searchSection).paddingBottom,
                height: window.getComputedStyle(searchSection).height
            };

            this.results.spacing.resultsComputed = {
                marginTop: window.getComputedStyle(resultsSection).marginTop,
                paddingTop: window.getComputedStyle(resultsSection).paddingTop,
                height: window.getComputedStyle(resultsSection).height
            };
        }

        // Check spacing to video section
        if (videoSection) {
            const videoRect = videoSection.getBoundingClientRect();
            const resultsRect = resultsSection?.getBoundingClientRect();

            if (resultsRect) {
                this.results.spacing.resultsToVideo = {
                    distance: videoRect.top - resultsRect.bottom,
                    resultsBottom: resultsRect.bottom,
                    videoTop: videoRect.top,
                    videoHeight: videoRect.height
                };
            }
        }

        // Check header spacing
        if (header && searchSection) {
            const headerRect = header.getBoundingClientRect();
            const searchRect = searchSection.getBoundingClientRect();

            this.results.spacing.headerToSearch = {
                distance: searchRect.top - headerRect.bottom,
                headerBottom: headerRect.bottom,
                searchTop: searchRect.top,
                headerMarginBottom: window.getComputedStyle(header).marginBottom
            };
        }

        console.log('✅ Spacing analysis complete:', this.results.spacing);
    }

    // Header Animation Diagnostics
    async diagnoseHeader() {
        console.log('🎨 Analyzing header animations...');

        const header = document.querySelector('.header');
        const waves = document.querySelectorAll('.wave');
        const particles = document.querySelector('.particles-container');
        const threeParticles = document.querySelector('.three-d-particles');

        this.results.header = {
            exists: !!header,
            dimensions: header ? header.getBoundingClientRect() : null,
            waves: {
                count: waves.length,
                animated: false
            },
            particles: {
                container: !!particles,
                threeD: !!threeParticles
            },
            animations: []
        };

        if (header) {
            const headerStyles = window.getComputedStyle(header);

            // Check for animation properties
            this.results.header.animationProperties = {
                transform: headerStyles.transform,
                transition: headerStyles.transition,
                animation: headerStyles.animation
            };

            // Check wave animations
            waves.forEach((wave, index) => {
                const waveStyles = window.getComputedStyle(wave);
                this.results.header.waves.animated = this.results.header.waves.animated ||
                    waveStyles.animation !== 'none';

                this.results.header.animations.push({
                    type: 'wave',
                    index: index,
                    animation: waveStyles.animation,
                    transform: waveStyles.transform
                });
            });

            // Check for particle animations
            if (particles) {
                const particleStyles = window.getComputedStyle(particles);
                this.results.header.animations.push({
                    type: 'particles',
                    animation: particleStyles.animation,
                    transform: particleStyles.transform
                });
            }

            if (threeParticles) {
                const threeDStyles = window.getComputedStyle(threeParticles);
                this.results.header.animations.push({
                    type: 'threeD-particles',
                    animation: threeDStyles.animation,
                    transform: threeDStyles.transform
                });
            }
        }

        console.log('✅ Header animation analysis complete:', this.results.header);
    }

    // Layout Diagnostics
    async diagnoseLayout() {
        console.log('📐 Analyzing overall layout...');

        const container = document.querySelector('.container');
        const body = document.body;
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.results.layout = {
            viewport: viewport,
            container: container ? {
                exists: true,
                dimensions: container.getBoundingClientRect(),
                computedStyles: {
                    maxWidth: window.getComputedStyle(container).maxWidth,
                    margin: window.getComputedStyle(container).margin,
                    padding: window.getComputedStyle(container).padding
                }
            } : { exists: false },
            body: {
                dimensions: body.getBoundingClientRect(),
                computedStyles: {
                    overflowX: window.getComputedStyle(body).overflowX,
                    overflowY: window.getComputedStyle(body).overflowY
                }
            },
            scrollPosition: {
                x: window.scrollX,
                y: window.scrollY,
                totalHeight: document.documentElement.scrollHeight,
                visibleHeight: viewport.height
            }
        };

        // Check for horizontal scroll
        this.results.layout.horizontalScroll = document.documentElement.scrollWidth > viewport.width;

        // Check responsive breakpoints
        this.results.layout.responsive = {
            isMobile: viewport.width <= 768,
            isTablet: viewport.width > 768 && viewport.width <= 1024,
            isDesktop: viewport.width > 1024
        };

        console.log('✅ Layout analysis complete:', this.results.layout);
    }

    // Performance Measurements
    async measurePerformance() {
        console.log('⚡ Measuring performance...');

        const endTime = performance.now();
        const loadTime = endTime - this.startTime;

        this.results.performance = {
            diagnosticTime: loadTime,
            pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            paintMetrics: performance.getEntriesByType('paint').reduce((acc, entry) => {
                acc[entry.name] = entry.startTime;
                return acc;
            }, {})
        };

        console.log('✅ Performance measurement complete:', this.results.performance);
    }

    // Generate comprehensive report
    generateReport() {
        console.log('\n📋 COMPREHENSIVE DIAGNOSTIC REPORT');
        console.log('=' .repeat(50));

        // Video Issues
        console.log('\n🎥 VIDEO ANALYSIS:');
        if (this.results.videos.totalVideos === 0) {
            console.log('❌ No video elements found');
        } else {
            console.log(`✅ Found ${this.results.videos.totalVideos} video(s) in ${this.results.videos.totalCards} card(s)`);

            this.results.videos.details.forEach(video => {
                console.log(`\n📹 Video: ${video.id}`);
                console.log(`   Source: ${video.currentSrc || video.src}`);
                console.log(`   Dimensions: ${video.videoWidth}x${video.videoHeight}`);
                console.log(`   State: ${video.paused ? 'paused' : 'playing'}, Ready: ${video.readyState}/4`);

                if (video.issues.length > 0) {
                    console.log('   Issues:');
                    video.issues.forEach(issue => console.log(`     ${issue}`));
                }

                if (video.phoneScreen) {
                    console.log(`   Phone Screen: ${video.phoneScreen.width}x${video.phoneScreen.height}`);
                }
            });
        }

        // Spacing Issues
        console.log('\n📏 SPACING ANALYSIS:');
        if (this.results.spacing.searchToResults) {
            const spacing = this.results.spacing.searchToResults;
            console.log(`🔍 Search to Results: ${spacing.distance}px`);

            if (spacing.distance > 100) {
                console.log('⚠️  EXCESSIVE SPACE: More than 100px between search and results');
            } else if (spacing.distance < 10) {
                console.log('⚠️  TOO LITTLE SPACE: Less than 10px between search and results');
            } else {
                console.log('✅ SPACING OK: Reasonable distance between sections');
            }

            console.log(`   Search margin-bottom: ${this.results.spacing.searchMarginBottom}`);
            console.log(`   Results margin-top: ${this.results.spacing.resultsMarginTop}`);
        }

        // Header Animation Status
        console.log('\n🎨 HEADER ANIMATION ANALYSIS:');
        if (this.results.header.exists) {
            console.log('✅ Header element found');
            console.log(`🌊 Waves: ${this.results.header.waves.count} found, Animated: ${this.results.header.waves.animated}`);
            console.log(`✨ Particles: Container: ${this.results.header.particles.container}, 3D: ${this.results.header.particles.threeD}`);

            this.results.header.animations.forEach(anim => {
                console.log(`   ${anim.type}: ${anim.animation || 'no animation'}`);
            });
        } else {
            console.log('❌ No header element found');
        }

        // Layout Issues
        console.log('\n📐 LAYOUT ANALYSIS:');
        console.log(`📱 Viewport: ${this.results.layout.viewport.width}x${this.results.layout.viewport.height}`);
        console.log(`📱 Responsive mode: ${this.results.layout.responsive.isMobile ? 'Mobile' : this.results.layout.responsive.isTablet ? 'Tablet' : 'Desktop'}`);
        console.log(`📜 Page height: ${this.results.layout.scrollPosition.totalHeight}px`);
        console.log(`📜 Scroll position: ${this.results.layout.scrollPosition.y}px`);

        if (this.results.layout.horizontalScroll) {
            console.log('⚠️  HORIZONTAL SCROLL DETECTED');
        } else {
            console.log('✅ No horizontal scroll issues');
        }

        // Performance
        console.log('\n⚡ PERFORMANCE:');
        console.log(`🕐 Diagnostic time: ${this.results.performance.diagnosticTime.toFixed(2)}ms`);
        console.log(`🕐 Page load time: ${this.results.performance.pageLoadTime}ms`);

        if (this.results.performance.paintMetrics['first-contentful-paint']) {
            console.log(`🎨 First Contentful Paint: ${this.results.performance.paintMetrics['first-contentful-paint']}ms`);
        }

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');

        // Video recommendations
        const videoIssues = this.results.videos.details.flatMap(v => v.issues);
        if (videoIssues.length > 0) {
            console.log('🎥 VIDEO FIXES NEEDED:');
            videoIssues.forEach(issue => console.log(`   ${issue}`));
        }

        // Spacing recommendations
        if (this.results.spacing.searchToResults?.distance > 100) {
            console.log('📏 REDUCE SPACING: Decrease margin-bottom on .search-section or margin-top on .results-section');
        }

        // Animation recommendations
        if (!this.results.header.waves.animated) {
            console.log('🎨 CHECK ANIMATIONS: Wave animations may not be working');
        }

        console.log('\n✅ Diagnostic complete! Copy this report for reference.');

        return this.results;
    }
}

// Auto-run the diagnostic
const diagnostic = new PageDiagnostic();

// Wait for page to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => diagnostic.runFullDiagnosis(), 1000);
    });
} else {
    setTimeout(() => diagnostic.runFullDiagnosis(), 500);
}

// Also expose the diagnostic object for manual testing
window.pageDiagnostic = diagnostic;

console.log('🔧 Diagnostic script loaded. Run window.pageDiagnostic.runFullDiagnosis() to start analysis.');