// Test script to show no results message
console.log('🔍 Mostrando mensaje de no resultados para prueba...');

// Show no results message
const noResultsElement = document.getElementById('noResults');
const resultsContainer = document.getElementById('resultsContainer');

if (noResultsElement) {
    noResultsElement.style.display = 'block';
    console.log('✅ No results message shown');
} else {
    console.error('❌ No results element not found');
}

if (resultsContainer) {
    resultsContainer.style.display = 'none';
    console.log('✅ Results container hidden');
} else {
    console.error('❌ Results container not found');
}

// Test suggestion tags
const suggestionTags = document.querySelectorAll('.suggestion-tag');
console.log(`📋 Found ${suggestionTags.length} suggestion tags`);

suggestionTags.forEach((tag, index) => {
    tag.addEventListener('click', () => {
        console.log(`🏷️ Clicked suggestion tag: ${tag.textContent}`);
    });
});

console.log('🎯 Test script loaded - search for something that has no results to see the new design!');