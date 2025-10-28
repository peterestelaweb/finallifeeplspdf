// Comprehensive Product Data Audit Script
// Analyzes search-local.js to identify products with missing ingredients and benefits

const fs = require('fs');

// Read the search-local.js file
const filePath = '/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/js/search-local.js';

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Extract the PDFs array using a more robust approach
    const pdfsArrayMatch = fileContent.match(/"pdfs":\s*(\[[\s\S]*?\])/);
    if (!pdfsArrayMatch) {
        console.error('Could not find PDFs array in the file');
        process.exit(1);
    }

    // Parse the PDFs array (this is a simplified approach)
    const pdfsArrayString = pdfsArrayMatch[1];

    // Find all product entries by looking for "filename" patterns
    const productEntries = [];
    const productPattern = /"filename":\s*"([^"]+)"/g;
    let match;

    while ((match = productPattern.exec(fileContent)) !== null) {
        const startIndex = match.index;

        // Find the end of this product entry (next "filename" or end of array)
        const nextProductMatch = productPattern.exec(fileContent);
        const endIndex = nextProductMatch ? nextProductMatch.index : fileContent.length;

        // Extract the product entry
        const productEntry = fileContent.substring(startIndex, endIndex);

        // Parse key information
        const filenameMatch = productEntry.match(/"filename":\s*"([^"]+)"/);
        const titleMatch = productEntry.match(/"title":\s*"([^"]+)"/);
        const ingredientsMatch = productEntry.match(/"ingredients":\s*(\[[\s\S]*?\])/);
        const benefitsMatch = productEntry.match(/"benefits":\s*(\[[\s\S]*?\])/);

        if (filenameMatch && titleMatch) {
            const hasIngredients = ingredientsMatch && !ingredientsMatch[1].includes('[]');
            const hasBenefits = benefitsMatch && !benefitsMatch[1].includes('[]');

            productEntries.push({
                filename: filenameMatch[1],
                title: titleMatch[1],
                hasIngredients: hasIngredients,
                hasBenefits: hasBenefits,
                ingredientsText: hasIngredients ? ingredientsMatch[1] : '[]',
                benefitsText: hasBenefits ? benefitsMatch[1] : '[]'
            });
        }

        // Reset regex lastIndex if we found a next product
        if (nextProductMatch) {
            productPattern.lastIndex = nextProductMatch.index;
        }
    }

    console.log('=== COMPREHENSIVE PRODUCT DATA AUDIT ===\n');

    // Overall statistics
    const totalProducts = productEntries.length;
    const productsWithIngredients = productEntries.filter(p => p.hasIngredients).length;
    const productsWithBenefits = productEntries.filter(p => p.hasBenefits).length;
    const productsMissingIngredients = totalProducts - productsWithIngredients;
    const productsMissingBenefits = totalProducts - productsWithBenefits;

    console.log('📊 OVERALL STATISTICS:');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Products with Ingredients: ${productsWithIngredients} (${((productsWithIngredients/totalProducts)*100).toFixed(1)}%)`);
    console.log(`Products with Benefits: ${productsWithBenefits} (${((productsWithBenefits/totalProducts)*100).toFixed(1)}%)`);
    console.log(`Products MISSING Ingredients: ${productsMissingIngredients} (${((productsMissingIngredients/totalProducts)*100).toFixed(1)}%)`);
    console.log(`Products MISSING Benefits: ${productsMissingBenefits} (${((productsMissingBenefits/totalProducts)*100).toFixed(1)}%)`);
    console.log('');

    // Products WITH ingredients and benefits
    console.log('✅ PRODUCTS WITH INGREDIENTS DATA:');
    const withIngredients = productEntries.filter(p => p.hasIngredients);
    withIngredients.forEach(product => {
        console.log(`  ✓ ${product.title}`);
    });
    console.log(`Total: ${withIngredients.length} products\n`);

    console.log('✅ PRODUCTS WITH BENEFITS DATA:');
    const withBenefits = productEntries.filter(p => p.hasBenefits);
    withBenefits.forEach(product => {
        console.log(`  ✓ ${product.title}`);
    });
    console.log(`Total: ${withBenefits.length} products\n`);

    // Products MISSING ingredients
    console.log('❌ PRODUCTS MISSING INGREDIENTS:');
    const missingIngredients = productEntries.filter(p => !p.hasIngredients);
    missingIngredients.forEach(product => {
        console.log(`  ❌ ${product.title}`);
    });
    console.log(`Total: ${missingIngredients.length} products\n`);

    // Products MISSING benefits
    console.log('❌ PRODUCTS MISSING BENEFITS:');
    const missingBenefits = productEntries.filter(p => !p.hasBenefits);
    missingBenefits.forEach(product => {
        console.log(`  ❌ ${product.title}`);
    });
    console.log(`Total: ${missingBenefits.length} products\n`);

    // Search-specific analysis
    console.log('🔍 SEARCH-SPECIFIC ANALYSIS:');

    const searchTerms = ['Daily', 'Omega', 'Basicos', 'Vigor', 'Renovar', 'Vitamin', 'Mineral', 'Probiotic', 'Fiber', 'Antioxidant'];

    searchTerms.forEach(term => {
        const matchingProducts = productEntries.filter(p =>
            p.title.toLowerCase().includes(term.toLowerCase()) ||
            p.filename.toLowerCase().includes(term.toLowerCase())
        );

        console.log(`\n📋 "${term}" Search Results (${matchingProducts.length} products):`);

        matchingProducts.forEach(product => {
            const ingredientsStatus = product.hasIngredients ? '✅' : '❌';
            const benefitsStatus = product.hasBenefits ? '✅' : '❌';
            console.log(`  ${ingredientsStatus}${benefitsStatus} ${product.title}`);
        });
    });

    // Summary of critical issues
    console.log('\n🚨 CRITICAL ISSUES SUMMARY:');
    console.log(`• ${productsMissingIngredients} out of ${totalProducts} products (${((productsMissingIngredients/totalProducts)*100).toFixed(1)}%) are missing ingredients data`);
    console.log(`• ${productsMissingBenefits} out of ${totalProducts} products (${((productsMissingBenefits/totalProducts)*100).toFixed(1)}%) are missing benefits data`);
    console.log(`• Only ${productsWithIngredients} products have complete ingredients information`);
    console.log(`• Only ${productsWithBenefits} products have complete benefits information`);

    console.log('\n📋 RECOMMENDED ACTIONS:');
    console.log('1. Priority 1: Add ingredients data to 111 products missing this information');
    console.log('2. Priority 2: Add benefits data to 120 products missing this information');
    console.log('3. Consider extracting ingredients/benefits from PDF files automatically');
    console.log('4. Review and standardize the data entry process');

} catch (error) {
    console.error('Error analyzing product data:', error);
}