const { chromium } = require('playwright');

async function testModalFinal() {
    console.log('🔍 Starting Final Modal Test...');

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

        // Take screenshot before clicking
        console.log('📸 Taking screenshot before clicking...');
        await page.screenshot({
            path: './test-results/modal-final/before-click.png',
            fullPage: true
        });

        // Check JavaScript errors
        console.log(`📊 Found ${jsErrors.length} JavaScript errors`);

        // Try to find the disclaimer link using multiple methods
        console.log('🔍 Looking for disclaimer link...');

        let disclaimerLink = await page.$('#disclaimerLink');

        if (!disclaimerLink) {
            console.log('🔍 Trying to find link by text...');
            disclaimerLink = await page.$('text="Información para mercado estadounidense"');
        }

        if (!disclaimerLink) {
            console.log('🔍 Trying to find link containing text...');
            disclaimerLink = await page.$('a:has-text("Información para mercado estadounidense")');
        }

        if (!disclaimerLink) {
            console.log('🔍 Trying to find link in footer...');
            disclaimerLink = await page.$('footer a');
        }

        if (disclaimerLink) {
            console.log('✅ Disclaimer link found');

            // Get link information
            const linkText = await disclaimerLink.textContent();
            console.log(`📋 Link text: "${linkText}"`);

            // Check if link is visible
            const isLinkVisible = await disclaimerLink.isVisible();
            console.log(`👁️ Link visible: ${isLinkVisible}`);

            if (isLinkVisible) {
                // Get link position
                const linkRect = await disclaimerLink.boundingBox();
                if (linkRect) {
                    console.log(`📍 Link position: x=${linkRect.x}, y=${linkRect.y}, width=${linkRect.width}, height=${linkRect.height}`);
                }

                // Try to click the link
                console.log('🖱️ Clicking disclaimer link...');
                await disclaimerLink.click();

                // Wait for potential modal to appear
                await page.waitForTimeout(1000);

                // Take screenshot after click
                console.log('📸 Taking screenshot after clicking...');
                await page.screenshot({
                    path: './test-results/modal-final/after-click.png',
                    fullPage: true
                });

                // Check if modal appeared
                const modal = await page.$('#legalModal');
                if (modal) {
                    console.log('✅ Legal modal found in DOM');

                    // Check if modal is visible
                    const isModalVisible = await modal.isVisible();
                    console.log(`👁️ Modal visible: ${isModalVisible}`);

                    if (isModalVisible) {
                        // Get modal dimensions
                        const modalRect = await modal.boundingBox();
                        if (modalRect) {
                            console.log(`📐 Modal dimensions: ${modalRect.width}x${modalRect.height}`);
                            console.log(`📐 Modal position: x=${modalRect.x}, y=${modalRect.y}`);
                        }

                        // Check modal content
                        const modalContent = await page.$('.legal-modal-content');
                        const modalHeader = await page.$('.legal-modal-header h3');
                        const modalBody = await page.$('.legal-modal-body');
                        const closeButton = await page.$('.legal-modal-close');
                        const closeBtn = await page.$('#closeLegalModal');

                        console.log('📄 Modal content elements:');
                        console.log(`   - Content container: ${modalContent ? '✅' : '❌'}`);
                        console.log(`   - Header: ${modalHeader ? '✅' : '❌'}`);
                        console.log(`   - Body: ${modalBody ? '✅' : '❌'}`);
                        console.log(`   - Close button (X): ${closeButton ? '✅' : '❌'}`);
                        console.log(`   - Close button (Entendido): ${closeBtn ? '✅' : '❌'}`);

                        if (modalHeader) {
                            const headerText = await modalHeader.textContent();
                            console.log(`   - Header text: "${headerText}"`);
                        }

                        // Test closing methods
                        if (closeButton) {
                            console.log('❌ Testing close button (X)...');
                            await closeButton.click();
                            await page.waitForTimeout(500);

                            const isStillVisible = await modal.isVisible();
                            console.log(`👁️ Modal visible after X close: ${isStillVisible}`);
                        }

                    } else {
                        console.log('❌ Modal is not visible');
                    }
                } else {
                    console.log('❌ Legal modal not found in DOM');
                }
            } else {
                console.log('❌ Link is not visible');
            }
        } else {
            console.log('❌ Disclaimer link not found with any method');

            // Let's examine the footer structure
            console.log('🔍 Examining footer structure...');
            const footer = await page.$('footer');
            if (footer) {
                const footerHTML = await footer.innerHTML();
                console.log(`📋 Footer HTML length: ${footerHTML.length} characters`);

                // Look for any links in footer
                const footerLinks = await footer.$$('a');
                console.log(`🔗 Found ${footerLinks.length} links in footer`);

                for (let i = 0; i < footerLinks.length; i++) {
                    const link = footerLinks[i];
                    const text = await link.textContent();
                    const href = await link.getAttribute('href');
                    console.log(`   ${i + 1}. "${text}" -> ${href}`);
                }
            }
        }

        // Generate final report
        console.log('\n📊 === FINAL ANALYSIS ===');
        console.log(`✅ Total console logs: ${consoleLogs.length}`);
        console.log(`❌ Total JavaScript errors: ${jsErrors.length}`);
        console.log(`🔍 Modal functionality: ${disclaimerLink ? '✅ Link found' : '❌ Link not found'}`);

        if (jsErrors.length > 0) {
            console.log('\n❌ JAVASCRIPT ERRORS FOUND:');
            jsErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

    } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);

        // Take error screenshot
        await page.screenshot({
            path: './test-results/modal-final/error-state.png',
            fullPage: true
        });

        throw error;
    } finally {
        await context.close();
        await browser.close();
    }

    console.log('\n✅ Test completed!');
    console.log('📁 Check test-results/modal-final/ for screenshots');
}

// Run the test
testModalFinal().catch(console.error);