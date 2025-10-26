const { chromium } = require('playwright');

async function testModalSimple() {
    console.log('🔍 Starting Simple Modal Test...');

    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Capture console logs and errors
    const consoleLogs = [];
    const jsErrors = [];

    page.on('console', msg => {
        consoleLogs.push(msg.text());
        console.log(`📝 Console: ${msg.text()}`);
    });

    page.on('pageerror', error => {
        jsErrors.push(error.message);
        console.error(`❌ JavaScript Error: ${error.message}`);
    });

    try {
        // Navigate to the website
        console.log('🌐 Navigating to LifePlus PDF search website...');
        await page.goto('https://lifepluspdf.peterestela.com', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ Page loaded successfully');

        // Take screenshot of the entire page
        console.log('📸 Taking full page screenshot...');
        await page.screenshot({
            path: './test-results/modal-simple/full-page.png',
            fullPage: true
        });

        // Check if there are any JavaScript errors
        console.log(`📊 Found ${jsErrors.length} JavaScript errors`);

        if (jsErrors.length > 0) {
            console.log('\n❌ JAVASCRIPT ERRORS FOUND:');
            jsErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        // Try to find the footer
        console.log('🔍 Looking for footer...');
        const footer = await page.$('footer');
        if (footer) {
            console.log('✅ Footer found');

            // Take screenshot of footer area
            const footerRect = await footer.boundingBox();
            if (footerRect) {
                await page.screenshot({
                    path: './test-results/modal-simple/footer-area.png',
                    clip: {
                        x: footerRect.x,
                        y: footerRect.y,
                        width: footerRect.width,
                        height: footerRect.height
                    }
                });
            }
        } else {
            console.log('❌ Footer not found');
        }

        // Try to find the legal modal in DOM
        console.log('🔍 Looking for legal modal in DOM...');
        const modal = await page.$('#legalModal');
        if (modal) {
            console.log('✅ Legal modal found in DOM');

            // Check modal visibility
            const isVisible = await modal.isVisible();
            console.log(`👁️ Modal visible: ${isVisible}`);

            // Check modal styles
            const display = await modal.evaluate(el => el.style.display);
            const opacity = await modal.evaluate(el => el.style.opacity);
            console.log(`📋 Modal styles - display: ${display}, opacity: ${opacity}`);

            // Get modal HTML structure
            const modalHTML = await modal.innerHTML();
            console.log(`📋 Modal HTML length: ${modalHTML.length} characters`);
        } else {
            console.log('❌ Legal modal not found in DOM');
        }

        // Try to find the disclaimer link
        console.log('🔍 Looking for disclaimer link...');
        const disclaimerLink = await page.$('#disclaimerLink');
        if (disclaimerLink) {
            console.log('✅ Disclaimer link found');

            const linkText = await disclaimerLink.textContent();
            console.log(`📋 Link text: "${linkText}"`);

            // Check if link is visible
            const isLinkVisible = await disclaimerLink.isVisible();
            console.log(`👁️ Link visible: ${isLinkVisible}`);

            // Try to click the link
            console.log('🖱️ Clicking disclaimer link...');
            await disclaimerLink.click();

            // Wait a bit for any potential modal to appear
            await page.waitForTimeout(1000);

            // Take screenshot after click
            await page.screenshot({
                path: './test-results/modal-simple/after-click.png',
                fullPage: true
            });

        } else {
            console.log('❌ Disclaimer link not found');

            // Try alternative selectors
            console.log('🔍 Trying alternative selectors...');
            const textLink = await page.$('a="Información para mercado estadounidense"');
            if (textLink) {
                console.log('✅ Found link by text');
                const linkRect = await textLink.boundingBox();
                console.log(`📍 Link position: ${linkRect ? `x=${linkRect.x}, y=${linkRect.y}` : 'not found'}`);
            } else {
                console.log('❌ Link not found by text either');
            }
        }

        // Generate final report
        console.log('\n📊 === FINAL REPORT ===');
        console.log(`✅ Total console logs: ${consoleLogs.length}`);
        console.log(`❌ Total JavaScript errors: ${jsErrors.length}`);

        console.log('\n🔍 ELEMENTS FOUND:');
        console.log(`📄 Footer: ${await page.$('footer') ? '✅' : '❌'}`);
        console.log(`📄 Legal modal: ${await page.$('#legalModal') ? '✅' : '❌'}`);
        console.log(`📄 Disclaimer link: ${await page.$('#disclaimerLink') ? '✅' : '❌'}`);

    } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);

        // Take error screenshot
        await page.screenshot({
            path: './test-results/modal-simple/error-state.png',
            fullPage: true
        });

        throw error;
    } finally {
        await context.close();
        await browser.close();
    }

    console.log('\n✅ Test completed!');
    console.log('📁 Check test-results/modal-simple/ for screenshots');
}

// Run the test
testModalSimple().catch(console.error);