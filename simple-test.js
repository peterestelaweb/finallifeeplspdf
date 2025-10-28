/**
 * Simple test script to verify Search Spacing Controller functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Search Overlap Fix Verification\n');

// Check if required files exist
const requiredFiles = [
    'css/search-overlap-fix.css',
    'js/search-spacing-controller.js',
    'index.html'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        console.log(`✅ ${file} (${stats.size} bytes)`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing. Cannot proceed with tests.');
    process.exit(1);
}

// Check if HTML includes the required CSS and JS files
console.log('\n📄 Checking HTML includes...');
const htmlContent = fs.readFileSync('index.html', 'utf8');

const checks = {
    cssIncluded: htmlContent.includes('css/search-overlap-fix.css'),
    jsIncluded: htmlContent.includes('js/search-spacing-controller.js'),
    searchSectionExists: htmlContent.includes('search-section'),
    resultsSectionExists: htmlContent.includes('results-section')
};

Object.entries(checks).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
});

if (!checks.cssIncluded || !checks.jsIncluded) {
    console.log('\n❌ Required files are not included in HTML. Cannot proceed with tests.');
    process.exit(1);
}

// Analyze CSS content
console.log('\n🎨 Analyzing CSS file...');
const cssContent = fs.readFileSync('css/search-overlap-fix.css', 'utf8');

const cssFeatures = {
    hasSearchSectionStyles: cssContent.includes('.search-section'),
    hasResultsSectionStyles: cssContent.includes('.results-section'),
    hasDynamicClasses: cssContent.includes('.has-results'),
    hasMobileStyles: cssContent.includes('@media (max-width: 768px)'),
    hasOverlapPrevention: cssContent.includes('z-index'),
    hasSpacingAdjustments: cssContent.includes('margin-top') && cssContent.includes('padding-top')
};

Object.entries(cssFeatures).forEach(([feature, exists]) => {
    console.log(`${exists ? '✅' : '❌'} ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
});

// Analyze JavaScript content
console.log('\n⚙️ Analyzing JavaScript file...');
const jsContent = fs.readFileSync('js/search-spacing-controller.js', 'utf8');

const jsFeatures = {
    hasClassDefinition: jsContent.includes('class SearchSpacingController'),
    hasConstructor: jsContent.includes('constructor()'),
    hasObserver: jsContent.includes('MutationObserver'),
    hasSpacingAdjustment: jsContent.includes('adjustSpacing'),
    hasOverlapDetection: jsContent.includes('ensureNoOverlap'),
    hasMobileSupport: jsContent.includes('mobileThreshold'),
    hasAutoInit: jsContent.includes('DOMContentLoaded'),
    hasDebugSupport: jsContent.includes('debugSpacing'),
    hasConsoleLogging: jsContent.includes('console.log')
};

Object.entries(jsFeatures).forEach(([feature, exists]) => {
    console.log(`${exists ? '✅' : '❌'} ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
});

// Summary
console.log('\n📊 Test Summary:');

const totalChecks = Object.values(checks).length + Object.values(cssFeatures).length + Object.values(jsFeatures).length;
const passedChecks = Object.values(checks).filter(Boolean).length +
                    Object.values(cssFeatures).filter(Boolean).length +
                    Object.values(jsFeatures).filter(Boolean).length;

console.log(`Total checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${totalChecks - passedChecks}`);
console.log(`Success rate: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (passedChecks === totalChecks) {
    console.log('\n✅ All static checks passed! Search Overlap Fix appears to be properly implemented.');
    console.log('\n📋 Manual Testing Instructions:');
    console.log('1. Open http://localhost:9001/index.html in your browser');
    console.log('2. Open Developer Tools (F12) and look for console messages from Search Spacing Controller');
    console.log('3. Search for "Daily" and check if there\'s any overlap');
    console.log('4. Test other searches: "Basicos", "Renovar", "Vigor"');
    console.log('5. Test on mobile by resizing browser or using device emulation');
    console.log('6. Use window.debugSpacing() in browser console for debugging');
    console.log('7. Check browser console for any errors');
} else {
    console.log('\n❌ Some checks failed. Please review the implementation.');
    process.exit(1);
}

console.log('\n🎯 Testing complete!');