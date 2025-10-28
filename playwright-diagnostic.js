const { chromium } = require('playwright');
const path = require('path');

async function runDiagnostics() {
    console.log('🔍 Starting LIFEPLUS Page Diagnostic Analysis...\n');

    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    // Enable console logging
    page.on('console', msg => {
        console.log(`Browser Console: ${msg.text()}`);
    });

    page.on('pageerror', error => {
        console.log(`Page Error: ${error.message}`);
    });

    try {
        // Navigate to the local file
        const filePath = `file://${path.join(process.cwd(), 'index.html')}`;
        console.log(`📄 Loading: ${filePath}`);

        await page.goto(filePath, {
            waitUntil: 'networkidle',
            timeout: 10000
        });

        // Wait for page to fully load
        await page.waitForTimeout(3000);

        console.log('\n📊 === MEASUREMENTS AND ANALYSIS ===\n');

        // 1. Take full page screenshot
        console.log('📸 Taking full page screenshot...');
        await page.screenshot({
            path: 'diagnostic-fullpage.png',
            fullPage: true
        });

        // 2. Header analysis
        console.log('🎯 Analyzing header section...');
        const headerBounds = await page.locator('.header').boundingBox();
        console.log(`Header dimensions: ${JSON.stringify(headerBounds)}`);

        await page.locator('.header').screenshot({
            path: 'diagnostic-header.png'
        });

        // 3. Search and results spacing analysis
        console.log('🔍 Analyzing search and results spacing...');
        const searchBounds = await page.locator('.search-section').boundingBox();
        const resultsBounds = await page.locator('.results-section').boundingBox();

        console.log(`Search section: ${JSON.stringify(searchBounds)}`);
        console.log(`Results section: ${JSON.stringify(resultsBounds)}`);

        if (searchBounds && resultsBounds) {
            const spacing = resultsBounds.y - (searchBounds.y + searchBounds.height);
            console.log(`📏 Spacing between search and results: ${spacing}px`);
        }

        // 4. Video analysis
        console.log('🎥 Analyzing video sections...');
        const phoneFrames = await page.locator('.phone-mockup').count();
        console.log(`Phone frames found: ${phoneFrames}`);

        for (let i = 0; i < phoneFrames; i++) {
            const phoneFrame = page.locator('.phone-mockup').nth(i);
            const phoneBounds = await phoneFrame.boundingBox();
            const video = phoneFrame.locator('.phone-video');
            const videoBounds = await video.boundingBox();

            console.log(`Phone ${i + 1} bounds: ${JSON.stringify(phoneBounds)}`);
            console.log(`Video ${i + 1} bounds: ${JSON.stringify(videoBounds)}`);

            if (phoneBounds && videoBounds) {
                const horizontalFit = Math.abs((phoneBounds.width - videoBounds.width) / 2);
                const verticalFit = Math.abs((phoneBounds.height - videoBounds.height) / 2);
                console.log(`Phone ${i + 1} video fit - Horizontal: ${horizontalFit}px, Vertical: ${verticalFit}px`);
            }

            await phoneFrame.screenshot({
                path: `diagnostic-phone-${i + 1}.png`
            });
        }

        // 5. Animation visibility check
        console.log('🌊 Checking header animation...');
        const wavesVisible = await page.locator('.waves-container').isVisible();
        const particlesVisible = await page.locator('.particles-container').isVisible();

        console.log(`Waves animation visible: ${wavesVisible}`);
        console.log(`Particles animation visible: ${particlesVisible}`);

        // 6. Console diagnostic injection
        console.log('\n🔧 Running console diagnostic...');
        await page.addScriptTag({
            content: `
                console.log('=== DIAGNOSTIC RESULTS ===');

                // Check video elements
                const videos = document.querySelectorAll('.phone-video');
                console.log('Video elements found:', videos.length);

                videos.forEach((video, index) => {
                    console.log(\`Video \${index + 1}:\`, {
                        src: video.src,
                        readyState: video.readyState,
                        networkState: video.networkState,
                        paused: video.paused,
                        ended: video.ended,
                        error: video.error ? video.error.message : 'None',
                        videoWidth: video.videoWidth,
                        videoHeight: video.videoHeight,
                        clientWidth: video.clientWidth,
                        clientHeight: video.clientHeight
                    });
                });

                // Check spacing
                const searchSection = document.querySelector('.search-section');
                const resultsSection = document.querySelector('.results-section');
                if (searchSection && resultsSection) {
                    const searchRect = searchSection.getBoundingClientRect();
                    const resultsRect = resultsSection.getBoundingClientRect();
                    const spacing = resultsRect.top - searchRect.bottom;
                    console.log('Spacing between search and results:', spacing + 'px');
                }

                // Check animation elements
                const waves = document.querySelector('.waves-container');
                const particles = document.querySelector('.particles-container');
                console.log('Animation elements:', {
                    waves: waves ? 'Present' : 'Missing',
                    particles: particles ? 'Present' : 'Missing'
                });

                // Check for diagnostic borders
                const styledElements = document.querySelectorAll('[style*="border"]');
                console.log('Elements with inline border styles:', styledElements.length);

                // Check CSS variables
                const rootStyles = getComputedStyle(document.documentElement);
                console.log('CSS Variables:', {
                    '--spacing-unit': rootStyles.getPropertyValue('--spacing-unit'),
                    '--header-height': rootStyles.getPropertyValue('--header-height')
                });
            `
        });

        await page.waitForTimeout(2000);

        // 7. Take targeted screenshots of potential issues
        console.log('📸 Taking targeted screenshots...');

        // Search and results area
        if (searchBounds && resultsBounds) {
            const combinedHeight = resultsBounds.y + resultsBounds.height - searchBounds.y;
            await page.screenshot({
                path: 'diagnostic-search-results-spacing.png',
                clip: {
                    x: searchBounds.x - 50,
                    y: searchBounds.y - 20,
                    width: searchBounds.width + 100,
                    height: combinedHeight + 40
                }
            });
        }

        // Check for any colored borders (diagnostic indicators)
        await page.screenshot({
            path: 'diagnostic-borders-check.png',
            fullPage: false
        });

        console.log('\n✅ Diagnostic complete!');
        console.log('📁 Screenshots saved:');
        console.log('  - diagnostic-fullpage.png');
        console.log('  - diagnostic-header.png');
        console.log('  - diagnostic-search-results-spacing.png');
        console.log('  - diagnostic-phone-1.png');
        console.log('  - diagnostic-phone-2.png');
        console.log('  - diagnostic-borders-check.png');

    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the diagnostic
runDiagnostics().catch(console.error);