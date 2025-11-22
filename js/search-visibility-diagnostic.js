/**
 * Search Results Visibility Diagnostic Tool
 * Helps identify and fix search results visibility issues
 */

class SearchVisibilityDiagnostic {
    constructor() {
        this.searchSection = document.querySelector('.search-section');
        this.resultsSection = document.querySelector('.results-section');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultsGrid = document.querySelector('.results-grid');
        this.noResults = document.getElementById('noResults');

        this.init();
    }

    init() {
        console.log('🔍 Inicializando Search Visibility Diagnostic...');

        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runDiagnostic());
        } else {
            this.runDiagnostic();
        }

        // Run diagnostic periodically
        setInterval(() => this.runDiagnostic(), 5000);

        // Add keyboard shortcut for manual diagnostic (Ctrl+Shift+D)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.runDiagnostic(true);
            }
        });
    }

    runDiagnostic(verbose = false) {
        console.log('🔍 Running search visibility diagnostic...');

        const issues = [];

        // 1. Check if elements exist
        if (!this.searchSection) {
            issues.push('❌ Search section not found');
        }
        if (!this.resultsSection) {
            issues.push('❌ Results section not found');
        }
        if (!this.resultsContainer) {
            issues.push('❌ Results container not found');
        }
        if (!this.resultsGrid) {
            issues.push('❌ Results grid not found');
        }

        if (issues.length > 0) {
            console.error('🚨 Critical issues found:', issues);
            this.showDiagnosticAlert(issues, 'error');
            return;
        }

        // 2. Check visibility and display
        const visibilityIssues = this.checkVisibility();
        issues.push(...visibilityIssues);

        // 3. Check positioning and z-index
        const positioningIssues = this.checkPositioning();
        issues.push(...positioningIssues);

        // 4. Check spacing and overlap
        const spacingIssues = this.checkSpacing();
        issues.push(...spacingIssues);

        // 5. Check if results are actually populated
        const contentIssues = this.checkContent();
        issues.push(...contentIssues);

        if (issues.length > 0) {
            console.warn('⚠️ Issues found:', issues);
            this.showDiagnosticAlert(issues, 'warning');

            // Attempt to fix issues automatically
            this.attemptAutoFix(issues);
        } else {
            console.log('✅ No visibility issues detected');
            if (verbose) {
                this.showDiagnosticAlert(['✅ All search visibility checks passed'], 'success');
            }
        }

        // 6. Log current state for debugging
        this.logCurrentState(verbose);
    }

    checkVisibility() {
        const issues = [];

        // Check if results section is visible
        const resultsSectionStyle = window.getComputedStyle(this.resultsSection);
        if (resultsSectionStyle.display === 'none') {
            issues.push('Results section has display: none');
        }
        if (resultsSectionStyle.visibility === 'hidden') {
            issues.push('Results section has visibility: hidden');
        }
        if (resultsSectionStyle.opacity === '0') {
            issues.push('Results section has opacity: 0');
        }

        // Check if results container is visible
        const containerStyle = window.getComputedStyle(this.resultsContainer);
        if (containerStyle.display === 'none') {
            issues.push('Results container has display: none');
        }
        if (containerStyle.visibility === 'hidden') {
            issues.push('Results container has visibility: hidden');
        }
        if (containerStyle.opacity === '0') {
            issues.push('Results container has opacity: 0');
        }

        // Check if results grid is visible
        if (this.resultsGrid) {
            const gridStyle = window.getComputedStyle(this.resultsGrid);
            if (gridStyle.display === 'none') {
                issues.push('Results grid has display: none');
            }
            if (gridStyle.visibility === 'hidden') {
                issues.push('Results grid has visibility: hidden');
            }
            if (gridStyle.opacity === '0') {
                issues.push('Results grid has opacity: 0');
            }
        }

        return issues;
    }

    checkPositioning() {
        const issues = [];

        // Check z-index values
        const searchZ = parseInt(window.getComputedStyle(this.searchSection).zIndex) || 0;
        const resultsZ = parseInt(window.getComputedStyle(this.resultsSection).zIndex) || 0;

        if (searchZ > resultsZ) {
            issues.push(`Search section z-index (${searchZ}) is higher than results section (${resultsZ})`);
        }

        // Check if elements are positioned correctly
        const searchRect = this.searchSection.getBoundingClientRect();
        const resultsRect = this.resultsSection.getBoundingClientRect();

        if (resultsRect.top < searchRect.bottom) {
            issues.push('Results section overlaps with search section');
        }

        // Check if results are within viewport
        if (resultsRect.top > window.innerHeight) {
            issues.push('Results section is below viewport');
        }

        return issues;
    }

    checkSpacing() {
        const issues = [];

        const searchRect = this.searchSection.getBoundingClientRect();
        const resultsRect = this.resultsSection.getBoundingClientRect();

        const gap = resultsRect.top - searchRect.bottom;

        if (gap < 0) {
            issues.push(`Sections overlap by ${Math.abs(gap)}px`);
        } else if (gap > 100) {
            issues.push(`Large gap between sections: ${gap}px`);
        }

        return issues;
    }

    checkContent() {
        const issues = [];

        // Check if results container has content
        if (this.resultsContainer.children.length === 0) {
            issues.push('Results container is empty');
        } else {
            // Check if result cards are visible
            const resultCards = this.resultsContainer.querySelectorAll('.result-item, .enhanced-result-card');
            if (resultCards.length === 0) {
                issues.push('No result cards found in container');
            } else {
                resultCards.forEach((card, index) => {
                    const cardStyle = window.getComputedStyle(card);
                    if (cardStyle.display === 'none') {
                        issues.push(`Result card ${index + 1} has display: none`);
                    }
                    if (cardStyle.visibility === 'hidden') {
                        issues.push(`Result card ${index + 1} has visibility: hidden`);
                    }
                });
            }
        }

        return issues;
    }

    attemptAutoFix(issues) {
        console.log('🔧 Attempting automatic fixes...');

        let fixesApplied = 0;

        issues.forEach(issue => {
            if (issue.includes('display: none')) {
                this.forceDisplayVisible();
                fixesApplied++;
            } else if (issue.includes('visibility: hidden')) {
                this.forceVisibilityVisible();
                fixesApplied++;
            } else if (issue.includes('opacity: 0')) {
                this.forceOpacityVisible();
                fixesApplied++;
            } else if (issue.includes('overlaps')) {
                this.fixOverlap();
                fixesApplied++;
            } else if (issue.includes('z-index')) {
                this.fixZIndex();
                fixesApplied++;
            }
        });

        if (fixesApplied > 0) {
            console.log(`✅ Applied ${fixesApplied} automatic fixes`);
            setTimeout(() => this.runDiagnostic(), 500); // Re-check after fixes
        }
    }

    forceDisplayVisible() {
        this.resultsSection.style.display = 'block';
        this.resultsContainer.style.display = 'block';
        if (this.resultsGrid) {
            this.resultsGrid.style.display = 'grid';
        }

        const resultCards = this.resultsContainer.querySelectorAll('.result-item, .enhanced-result-card');
        resultCards.forEach(card => {
            card.style.display = 'block';
        });
    }

    forceVisibilityVisible() {
        this.resultsSection.style.visibility = 'visible';
        this.resultsContainer.style.visibility = 'visible';
        if (this.resultsGrid) {
            this.resultsGrid.style.visibility = 'visible';
        }

        const resultCards = this.resultsContainer.querySelectorAll('.result-item, .enhanced-result-card');
        resultCards.forEach(card => {
            card.style.visibility = 'visible';
        });
    }

    forceOpacityVisible() {
        this.resultsSection.style.opacity = '1';
        this.resultsContainer.style.opacity = '1';
        if (this.resultsGrid) {
            this.resultsGrid.style.opacity = '1';
        }

        const resultCards = this.resultsContainer.querySelectorAll('.result-item, .enhanced-result-card');
        resultCards.forEach(card => {
            card.style.opacity = '1';
        });
    }

    fixOverlap() {
        const searchRect = this.searchSection.getBoundingClientRect();
        const resultsRect = this.resultsSection.getBoundingClientRect();

        if (resultsRect.top < searchRect.bottom) {
            const overlap = searchRect.bottom - resultsRect.top;
            this.resultsSection.style.marginTop = `${overlap + 20}px`;
        }
    }

    fixZIndex() {
        this.searchSection.style.zIndex = '1';
        this.resultsSection.style.zIndex = '10';
        if (this.resultsGrid) {
            this.resultsGrid.style.zIndex = '15';
        }
    }

    logCurrentState(verbose = false) {
        if (!verbose) return;

        console.log('📊 Current search visibility state:');

        const searchRect = this.searchSection.getBoundingClientRect();
        const resultsRect = this.resultsSection.getBoundingClientRect();

        console.log('Search section:', {
            display: window.getComputedStyle(this.searchSection).display,
            visibility: window.getComputedStyle(this.searchSection).visibility,
            opacity: window.getComputedStyle(this.searchSection).opacity,
            zIndex: window.getComputedStyle(this.searchSection).zIndex,
            rect: searchRect
        });

        console.log('Results section:', {
            display: window.getComputedStyle(this.resultsSection).display,
            visibility: window.getComputedStyle(this.resultsSection).visibility,
            opacity: window.getComputedStyle(this.resultsSection).opacity,
            zIndex: window.getComputedStyle(this.resultsSection).zIndex,
            rect: resultsRect
        });

        console.log('Results container:', {
            childrenCount: this.resultsContainer.children.length,
            display: window.getComputedStyle(this.resultsContainer).display,
            visibility: window.getComputedStyle(this.resultsContainer).visibility,
            opacity: window.getComputedStyle(this.resultsContainer).opacity
        });

        if (this.resultsGrid) {
            console.log('Results grid:', {
                display: window.getComputedStyle(this.resultsGrid).display,
                visibility: window.getComputedStyle(this.resultsGrid).visibility,
                opacity: window.getComputedStyle(this.resultsGrid).opacity
            });
        }
    }

    showDiagnosticAlert(messages, type = 'info') {
        // Create a diagnostic alert element
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background: ${type === 'error' ? '#fee' : type === 'warning' ? '#fff3cd' : '#d4edda'};
            border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#c3e6cb'};
            color: ${type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#155724'};
        `;

        alert.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">
                ${type === 'error' ? '🚨 Error' : type === 'warning' ? '⚠️ Warning' : '✅ Info'} - Search Diagnostic
            </div>
            ${messages.map(msg => `<div style="margin: 5px 0;">${msg}</div>`).join('')}
            <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
                Press Ctrl+Shift+D to run diagnostic again
            </div>
        `;

        document.body.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);

        // Click to dismiss
        alert.addEventListener('click', () => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        });
    }
}

// Initialize the diagnostic tool
document.addEventListener('DOMContentLoaded', () => {
    window.searchVisibilityDiagnostic = new SearchVisibilityDiagnostic();

    // Make it available for manual debugging
    window.runSearchDiagnostic = () => {
        if (window.searchVisibilityDiagnostic) {
            window.searchVisibilityDiagnostic.runDiagnostic(true);
        }
    };

    console.log('🔍 Search Visibility Diagnostic initialized');
    console.log('💡 Press Ctrl+Shift+D or run window.runSearchDiagnostic() to check search visibility');
});