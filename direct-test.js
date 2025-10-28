/**
 * Direct test script for Search Overlap Fix
 * This script directly tests the Search Spacing Controller functionality
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testSearchOverlapFix() {
    console.log('🚀 Starting Search Overlap Fix Tests...\n');

    const browser = await puppeteer.launch({
        headless: false, // Show browser for manual verification
        defaultViewport: { width: 1200, height: 800 }
    });

    try {
        const page = await browser.newPage();

        // Enable console logging from the page
        page.on('console', msg => {
            console.log('📱 [Browser]', msg.text());
        });

        page.on('pageerror', error => {
            console.log('❌ [Page Error]', error.message);
        });

        // Navigate to the test page
        console.log('📍 Navigating to test page...');
        await page.goto('http://localhost:9001/index.html', { waitUntil: 'networkidle0' });

        // Wait for the Search Spacing Controller to initialize
        await page.waitForTimeout(2000);

        // Test 1: Check if Search Spacing Controller is loaded
        console.log('\n🧪 Test 1: Checking Search Spacing Controller...');
        const controllerStatus = await page.evaluate(() => {
            return {
                hasController: !!window.searchSpacingController,
                hasDebugFunction: !!window.debugSpacing,
                controllerState: window.searchSpacingController ? window.searchSpacingController.getCurrentState() : null
            };
        });

        console.log('Controller Status:', controllerStatus);

        if (!controllerStatus.hasController) {
            console.log('❌ Search Spacing Controller not found. Attempting manual initialization...');
            await page.evaluate(() => {
                if (window.debugSpacing) {
                    window.debugSpacing();
                }
            });
            await page.waitForTimeout(1000);
        }

        // Test 2: Test "Daily" search (main test case from user)
        console.log('\n🧪 Test 2: Testing "Daily" search...');
        await testSearchTerm(page, 'Daily', 'Desktop');

        // Test 3: Test "Basicos" search
        console.log('\n🧪 Test 3: Testing "Basicos" search...');
        await testSearchTerm(page, 'Basicos', 'Desktop');

        // Test 4: Test "Renovar" search
        console.log('\n🧪 Test 4: Testing "Renovar" search...');
        await testSearchTerm(page, 'Renovar', 'Desktop');

        // Test 5: Test "Vigor" search
        console.log('\n🧪 Test 5: Testing "Vigor" search...');
        await testSearchTerm(page, 'Vigor', 'Desktop');

        // Test 6: Test no results scenario
        console.log('\n🧪 Test 6: Testing no results scenario...');
        await testSearchTerm(page, 'NonExistentProduct123', 'Desktop');

        // Test 7: Test mobile viewport
        console.log('\n🧪 Test 7: Testing mobile viewport...');
        await page.setViewport({ width: 375, height: 667 });
        await testSearchTerm(page, 'Daily', 'Mobile');

        // Test 8: Test tablet viewport
        console.log('\n🧪 Test 8: Testing tablet viewport...');
        await page.setViewport({ width: 768, height: 1024 });
        await testSearchTerm(page, 'Daily', 'Tablet');

        console.log('\n✅ All tests completed successfully!');

        // Take final screenshot
        await page.screenshot({
            path: 'search-overlap-test-final.png',
            fullPage: true
        });
        console.log('📸 Final screenshot saved as search-overlap-test-final.png');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Don't close browser immediately for manual verification
        console.log('\n🔍 Browser will remain open for manual verification. Press Ctrl+C to exit.');

        // Wait for user to manually close or timeout after 5 minutes
        await new Promise(resolve => {
            setTimeout(resolve, 300000); // 5 minutes
        });

        await browser.close();
    }
}

async function testSearchTerm(page, searchTerm, viewport) {
    try {
        console.log(`🔍 Searching for "${searchTerm}" on ${viewport}...`);

        // Clear search first
        await page.click('#clearSearch', { timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(500);

        // Enter search term
        await page.type('#searchInput', searchTerm, { delay: 100 });
        await page.waitForTimeout(1000);

        // Trigger search events
        await page.evaluate((term) => {
            const input = document.getElementById('searchInput');
            if (input) {
                input.value = term;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('keyup', { bubbles: true }));
            }
        }, searchTerm);

        // Wait for results to load
        await page.waitForTimeout(2000);

        // Analyze the results and spacing
        const analysis = await page.evaluate((searchTerm, viewport) => {
            const searchSection = document.querySelector('.search-section');
            const resultsSection = document.querySelector('.results-section');
            const resultsGrid = document.querySelector('.results-grid');
            const resultItems = resultsGrid ? resultsGrid.querySelectorAll('.result-item, .enhanced-result-card') : [];
            const noResults = document.getElementById('noResults');

            let spacingInfo = {};
            if (searchSection && resultsSection) {
                const searchRect = searchSection.getBoundingClientRect();
                const resultsRect = resultsSection.getBoundingClientRect();
                spacingInfo = {
                    gap: resultsRect.top - searchRect.bottom,
                    searchHeight: searchRect.height,
                    resultsMarginTop: parseInt(window.getComputedStyle(resultsSection).marginTop),
                    resultsPaddingTop: parseInt(window.getComputedStyle(resultsSection).paddingTop),
                    searchBottom: searchRect.bottom,
                    resultsTop: resultsRect.top
                };
            }

            // Check controller status
            const controllerStatus = window.searchSpacingController ? {
                exists: true,
                currentState: window.searchSpacingController.getCurrentState(),
                hasResultsClass: resultsSection.classList.contains('has-results'),
                hasManyResultsClass: resultsSection.classList.contains('has-many-results'),
                hasNoResultsClass: resultsSection.classList.contains('has-no-results')
            } : { exists: false };

            return {
                searchTerm,
                viewport,
                hasResults: resultItems.length > 0,
                resultCount: resultItems.length,
                hasNoResults: noResults && noResults.style.display !== 'none',
                spacingInfo,
                controllerStatus,
                resultsSectionClasses: Array.from(resultsSection.classList),
                viewportSize: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            };
        }, searchTerm, viewport);

        // Analyze results
        console.log(`📊 Results for "${searchTerm}":`, {
            hasResults: analysis.hasResults,
            resultCount: analysis.resultCount,
            hasNoResults: analysis.hasNoResults,
            gap: analysis.spacingInfo.gap,
            controllerExists: analysis.controllerStatus.exists
        });

        // Check for overlap
        if (analysis.spacingInfo.gap < 0) {
            console.log(`🚨 OVERLAP DETECTED! Gap: ${analysis.spacingInfo.gap}px`);
        } else if (analysis.spacingInfo.gap < 5) {
            console.log(`⚠️ Small gap: ${analysis.spacingInfo.gap}px`);
        } else {
            console.log(`✅ Good spacing: ${analysis.spacingInfo.gap}px`);
        }

        // Verify controller is working
        if (analysis.controllerStatus.exists) {
            console.log('✅ Search Spacing Controller is active');

            // Force adjustment and check again
            await page.evaluate(() => {
                if (window.searchSpacingController) {
                    window.searchSpacingController.forceAdjustment();
                }
            });
            await page.waitForTimeout(500);
        } else {
            console.log('❌ Search Spacing Controller not found');
        }

        // Take screenshot for this test
        const filename = `search-test-${searchTerm}-${viewport.toLowerCase()}.png`;
        await page.screenshot({
            path: filename,
            fullPage: false
        });
        console.log(`📸 Screenshot saved: ${filename}`);

        // Clear search for next test
        await page.click('#clearSearch', { timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(500);

        return analysis;

    } catch (error) {
        console.error(`❌ Error testing "${searchTerm}":`, error.message);
        return null;
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    testSearchOverlapFix().catch(console.error);
}

module.exports = { testSearchOverlapFix, testSearchTerm };