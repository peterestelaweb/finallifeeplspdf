const { chromium } = require('playwright');

async function testProductUpdates() {
    const browser = await chromium.launch({
        headless: false, // Show browser for visibility
        slowMo: 1000 // Slow down actions for better visibility
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Navigate to the application
    await page.goto('http://localhost:9007/index.html');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const searchTests = [
        {
            name: 'Vigor/Be Focused Test',
            searchTerms: ['Vigor', 'Be Focused'],
            expectedProducts: ['energy', 'vigor'],
            screenshotName: 'vigor-be-focused-test'
        },
        {
            name: 'Antioxidant/Xtra Test',
            searchTerms: ['Antioxidant', 'Xtra'],
            expectedProducts: ['xtra', 'antioxidant'],
            screenshotName: 'antioxidant-xtra-test'
        },
        {
            name: 'Daily Test',
            searchTerms: ['Daily'],
            expectedProducts: ['daily', 'biobasics'],
            screenshotName: 'daily-test'
        },
        {
            name: 'Heart/Cardio Test',
            searchTerms: ['Heart', 'Cardio'],
            expectedProducts: ['heart', 'cardio'],
            screenshotName: 'heart-cardio-test'
        },
        {
            name: 'Brain/Cognitive Test',
            searchTerms: ['Brain', 'Cognitive'],
            expectedProducts: ['brain', 'cognitive'],
            screenshotName: 'brain-cognitive-test'
        },
        {
            name: 'Co Q 10 Test',
            searchTerms: ['Co Q 10', 'CoQ10'],
            expectedProducts: ['coq10', 'co q'],
            screenshotName: 'coq10-test'
        },
        {
            name: 'Digestive Test',
            searchTerms: ['Digestive'],
            expectedProducts: ['digestive'],
            screenshotName: 'digestive-test'
        }
    ];

    console.log('🧪 Starting product update verification tests...\n');

    for (const test of searchTests) {
        console.log(`📝 Running: ${test.name}`);

        for (const searchTerm of test.searchTerms) {
            console.log(`  🔍 Searching for: "${searchTerm}"`);

            // Find the search input
            const searchInput = await page.locator('input[type="text"], #searchInput, .search-input').first();
            await searchInput.clear();
            await searchInput.fill(searchTerm);

            // Wait for search results to appear
            await page.waitForTimeout(1500);

            // Take screenshot before checking results
            await page.screenshot({
                path: `screenshots/${test.screenshotName}-${searchTerm.toLowerCase().replace(/\s+/g, '-')}-before.png`,
                fullPage: false
            });

            // Check if any results appeared
            const results = await page.locator('.result-item, .product-card, .search-result').count();
            console.log(`    📊 Found ${results} results`);

            if (results > 0) {
                // Check for ingredient information
                const ingredientsFound = await page.locator('.ingredients-list').count();
                console.log(`    🧪 Products with ingredients: ${ingredientsFound}`);

                // Check for benefit information
                const benefitsFound = await page.locator('.benefits-list').count();
                console.log(`    ⭐ Products with benefits: ${benefitsFound}`);

                // Check for actual ingredient content (not just "Información no disponible")
                const realIngredients = await page.locator('.ingredients-list li:text("Información no disponible")').count();
                const totalIngredientSlots = await page.locator('.ingredients-list li').count();
                const realIngredientCount = totalIngredientSlots - realIngredients;
                console.log(`    📊 Real ingredient entries: ${realIngredientCount}/${totalIngredientSlots}`);

                // Check for actual benefit content (not just "Consultar ficha técnica")
                const realBenefits = await page.locator('.benefits-list li:text("Consultar ficha técnica")').count();
                const totalBenefitSlots = await page.locator('.benefits-list li').count();
                const realBenefitCount = totalBenefitSlots - realBenefits;
                console.log(`    📊 Real benefit entries: ${realBenefitCount}/${totalBenefitSlots}`);

                // Take detailed screenshot of first result
                if (results > 0) {
                    const firstResult = await page.locator('.result-item, .product-card, .search-result').first();
                    await firstResult.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(500);

                    // Highlight the first result for visibility
                    await firstResult.evaluate(el => {
                        el.style.border = '3px solid #10b981';
                        el.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
                    });

                    await page.screenshot({
                        path: `screenshots/${test.screenshotName}-${searchTerm.toLowerCase().replace(/\s+/g, '-')}-detailed.png`,
                        fullPage: false
                    });

                    // Remove highlight
                    await firstResult.evaluate(el => {
                        el.style.border = '';
                        el.style.boxShadow = '';
                    });
                }
            } else {
                console.log(`    ❌ No results found for "${searchTerm}"`);
            }

            // Clear search for next test
            await searchInput.clear();
            await page.waitForTimeout(500);
        }

        console.log(`✅ Completed: ${test.name}\n`);
    }

    // Take final overview screenshot
    await page.screenshot({
        path: 'screenshots/final-overview.png',
        fullPage: true
    });

    console.log('🎉 All tests completed! Screenshots saved in /screenshots folder.');

    await browser.close();
}

// Create screenshots directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

// Run the test
testProductUpdates().catch(console.error);