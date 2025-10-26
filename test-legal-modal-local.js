const { chromium } = require('playwright');

async function testLegalModalLocal() {
    console.log('🔍 Starting Legal Modal Functionality Test (Local Server)...');

    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
            dir: './test-results/modal-test-local/',
            size: { width: 1920, height: 1080 }
        }
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
        // Test 1: Navigate to the local server
        console.log('🌐 Navigating to local server...');
        await page.goto('http://localhost:8000', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for page to load completely
        await page.waitForSelector('.container', { timeout: 10000 });
        console.log('✅ Page loaded successfully');

        // Test 2: Take screenshot before clicking
        console.log('📸 Taking screenshot before clicking legal link...');
        await page.screenshot({
            path: './test-results/modal-test-local/before-click.png',
            fullPage: true
        });

        // Test 3: Find and verify the legal disclaimer link
        console.log('🔍 Looking for legal disclaimer link in footer...');
        const disclaimerLink = await page.$('#disclaimerLink');

        if (!disclaimerLink) {
            throw new Error('Legal disclaimer link not found');
        }

        const linkText = await disclaimerLink.textContent();
        console.log(`✅ Found legal link: "${linkText}"`);

        // Test 4: Check if modal exists in DOM but is hidden
        console.log('🔍 Checking if modal exists in DOM...');
        const modal = await page.$('#legalModal');

        if (!modal) {
            throw new Error('Legal modal not found in DOM');
        }

        // Check initial modal state
        const initialDisplay = await modal.evaluate(el => el.style.display);
        const initialOpacity = await modal.evaluate(el => el.style.opacity);
        console.log(`📋 Initial modal state - display: ${initialDisplay}, opacity: ${initialOpacity}`);

        // Test 5: Click the legal link and wait for modal to appear
        console.log('🖱️ Clicking legal disclaimer link...');
        await disclaimerLink.click();

        // Wait for modal to become visible
        await page.waitForTimeout(500); // Wait for animation

        // Check modal state after click
        const afterClickDisplay = await modal.evaluate(el => el.style.display);
        const afterClickOpacity = await modal.evaluate(el => el.style.opacity);
        console.log(`📋 Modal state after click - display: ${afterClickDisplay}, opacity: ${afterClickOpacity}`);

        // Test 6: Take screenshot after clicking
        console.log('📸 Taking screenshot after clicking legal link...');
        await page.screenshot({
            path: './test-results/modal-test-local/after-click.png',
            fullPage: true
        });

        // Test 7: Check modal visibility and positioning
        console.log('📐 Testing modal visibility and positioning...');

        const modalRect = await modal.boundingBox();
        if (!modalRect) {
            throw new Error('Modal bounding box not found - modal may not be visible');
        }

        console.log(`📐 Modal dimensions: ${modalRect.width}x${modalRect.height}`);
        console.log(`📐 Modal position: x=${modalRect.x}, y=${modalRect.y}`);

        // Check if modal is properly centered
        const viewportSize = page.viewportSize();
        const isCentered = Math.abs(modalRect.x + modalRect.width/2 - viewportSize.width/2) < 50 &&
                          Math.abs(modalRect.y + modalRect.height/2 - viewportSize.height/2) < 50;

        console.log(`📐 Modal centered: ${isCentered}`);

        // Test 8: Check modal content
        console.log('📄 Checking modal content...');
        const modalContent = await page.$('.legal-modal-content');
        const modalHeader = await page.$('.legal-modal-header h3');
        const modalBody = await page.$('.legal-modal-body');
        const closeButton = await page.$('.legal-modal-close');
        const closeBtn = await page.$('#closeLegalModal');

        console.log(`📄 Modal content elements found:`);
        console.log(`   - Content container: ${modalContent ? '✅' : '❌'}`);
        console.log(`   - Header: ${modalHeader ? '✅' : '❌'}`);
        console.log(`   - Body: ${modalBody ? '✅' : '❌'}`);
        console.log(`   - Close button (X): ${closeButton ? '✅' : '❌'}`);
        console.log(`   - Close button (Entendido): ${closeBtn ? '✅' : '❌'}`);

        if (modalHeader) {
            const headerText = await modalHeader.textContent();
            console.log(`   - Header text: "${headerText}"`);
        }

        // Test 9: Test closing methods

        // Method 1: Close button (X)
        console.log('❌ Testing close button (X)...');
        if (closeButton) {
            await closeButton.click();
            await page.waitForTimeout(400); // Wait for animation

            const afterCloseDisplay = await modal.evaluate(el => el.style.display);
            const afterCloseOpacity = await modal.evaluate(el => el.style.opacity);
            console.log(`📋 Modal state after X close - display: ${afterCloseDisplay}, opacity: ${afterCloseOpacity}`);
        }

        // Reopen modal for further tests
        await disclaimerLink.click();
        await page.waitForTimeout(500);

        // Method 2: Close button (Entendido)
        console.log('🔘 Testing close button (Entendido)...');
        if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(400);

            const afterBtnDisplay = await modal.evaluate(el => el.style.display);
            const afterBtnOpacity = await modal.evaluate(el => el.style.opacity);
            console.log(`📋 Modal state after Entendido close - display: ${afterBtnDisplay}, opacity: ${afterBtnOpacity}`);
        }

        // Reopen modal for click outside test
        await disclaimerLink.click();
        await page.waitForTimeout(500);

        // Method 3: Click outside modal
        console.log('👆 Testing click outside modal...');
        await modal.click({ position: { x: 10, y: 10 } }); // Click near edge of modal overlay
        await page.waitForTimeout(400);

        const afterOutsideDisplay = await modal.evaluate(el => el.style.display);
        const afterOutsideOpacity = await modal.evaluate(el => el.style.opacity);
        console.log(`📋 Modal state after outside click - display: ${afterOutsideDisplay}, opacity: ${afterOutsideOpacity}`);

        // Reopen modal for Escape key test
        await disclaimerLink.click();
        await page.waitForTimeout(500);

        // Method 4: Escape key
        console.log('⌨️ Testing Escape key...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);

        const afterEscapeDisplay = await modal.evaluate(el => el.style.display);
        const afterEscapeOpacity = await modal.evaluate(el => el.style.opacity);
        console.log(`📋 Modal state after Escape - display: ${afterEscapeDisplay}, opacity: ${afterEscapeOpacity}`);

        // Test 10: Final screenshot
        console.log('📸 Taking final screenshot...');
        await page.screenshot({
            path: './test-results/modal-test-local/final-state.png',
            fullPage: true
        });

    } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);

        // Take error screenshot
        await page.screenshot({
            path: './test-results/modal-test-local/error-state.png',
            fullPage: true
        });

        throw error;
    } finally {
        await context.close();
        await browser.close();
    }

    // Generate report
    console.log('\n📊 === TEST REPORT ===');
    console.log(`✅ Console logs captured: ${consoleLogs.length}`);
    console.log(`❌ JavaScript errors: ${jsErrors.length}`);

    if (jsErrors.length > 0) {
        console.log('\n❌ JAVASCRIPT ERRORS:');
        jsErrors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
    }

    console.log('\n✅ Tests completed successfully!');
    console.log('📁 Check test-results/modal-test-local/ for screenshots and video');
}

// Run the test
testLegalModalLocal().catch(console.error);