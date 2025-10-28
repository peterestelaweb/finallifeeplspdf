// Simple Product Data Audit
const fs = require('fs');

try {
    const content = fs.readFileSync('/Users/maykacenteno/Library/CloudStorage/GoogleDrive-peterestela@gmail.com/Mi unidad/CURSO VERA BADIAS/PROYECTOS./PROYECTO B-MAD ( MULTIPLES AGENTES )/BMAD-METHOD-main/VERSION-ESTATICA/js/search-local.js', 'utf8');

    console.log('=== PRODUCT DATA AUDIT RESULTS ===\n');

    // Count empty vs non-empty arrays
    const totalProducts = (content.match(/"ingredients":/g) || []).length;
    const emptyIngredients = (content.match(/"ingredients": \[\]/g) || []).length;
    const emptyBenefits = (content.match(/"benefits": \[\]/g) || []).length;
    const productsWithIngredients = totalProducts - emptyIngredients;
    const productsWithBenefits = totalProducts - emptyBenefits;

    console.log(`📊 SUMMARY:`);
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Products WITH Ingredients: ${productsWithIngredients} (${((productsWithIngredients/totalProducts)*100).toFixed(1)}%)`);
    console.log(`Products MISSING Ingredients: ${emptyIngredients} (${((emptyIngredients/totalProducts)*100).toFixed(1)}%)`);
    console.log(`Products WITH Benefits: ${productsWithBenefits} (${((productsWithBenefits/totalProducts)*100).toFixed(1)}%)`);
    console.log(`Products MISSING Benefits: ${emptyBenefits} (${((emptyBenefits/totalProducts)*100).toFixed(1)}%)`);

    // Find products with ingredients
    console.log('\n✅ PRODUCTS WITH INGREDIENTS:');
    const ingredientMatches = content.match(/"filename":\s*"[^"]*"[\s\S]*?"title":\s*"[^"]*"[\s\S]*?"ingredients":\s*\[[^\]]+\]/g) || [];
    ingredientMatches.forEach(match => {
        const titleMatch = match.match(/"title":\s*"([^"]+)"/);
        if (titleMatch) {
            console.log(`  ✓ ${titleMatch[1]}`);
        }
    });

    // Find products with benefits
    console.log('\n✅ PRODUCTS WITH BENEFITS:');
    const benefitMatches = content.match(/"filename":\s*"[^"]*"[\s\S]*?"title":\s*"[^"]*"[\s\S]*?"benefits":\s*\[[^\]]+\]/g) || [];
    benefitMatches.forEach(match => {
        const titleMatch = match.match(/"title":\s*"([^"]+)"/);
        if (titleMatch) {
            console.log(`  ✓ ${titleMatch[1]}`);
        }
    });

    // Search for specific terms
    console.log('\n🔍 SEARCH TERM ANALYSIS:');
    const searchTerms = ['Daily', 'Omega', 'Basicos', 'Vigor', 'Renovar', 'Vitamin', 'Mineral', 'Probiotic', 'Fiber', 'Antioxidant'];

    searchTerms.forEach(term => {
        const regex = new RegExp(`"filename":\\s*"[^"]*${term}[^"]*"[\\s\\S]*?"title":\\s*"([^"]+)"[\\s\\S]*?"ingredients":\\s*(\\[[^\\]]*\\])[\\s\\S]*?"benefits":\\s*(\\[[^\\]]*\\])`, 'gi');
        let match;
        let foundProducts = [];

        while ((match = regex.exec(content)) !== null) {
            foundProducts.push({
                title: match[1],
                hasIngredients: !match[2].includes('[]'),
                hasBenefits: !match[3].includes('[]')
            });
        }

        if (foundProducts.length > 0) {
            console.log(`\n📋 "${term}" (${foundProducts.length} products):`);
            foundProducts.forEach(product => {
                const status = `${product.hasIngredients ? '✅' : '❌'}${product.hasBenefits ? '✅' : '❌'}`;
                console.log(`  ${status} ${product.title}`);
            });
        }
    });

} catch (error) {
    console.error('Error:', error.message);
}