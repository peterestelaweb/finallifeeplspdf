#!/usr/bin/env python3
"""
Script para tomar screenshots automatizadas y medir espaciado
Requiere: pip install playwright
"""

import asyncio
import os
from playwright.async_api import async_playwright

async def take_screenshots_and_measure():
    """
    Tomar screenshots y medir el espaciado entre bloques de búsqueda y resultados
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # Cambiar a True para modo sin cabeza
        page = await browser.new_page()

        # Ruta al archivo HTML
        html_path = f"file://{os.path.abspath('index.html')}"

        print("🔍 Abriendo la página...")
        await page.goto(html_path)
        await page.wait_for_load_state('networkidle')

        print("📏 Midiendo espaciado inicial...")
        await measure_spacing(page, "initial")

        print("📸 Tomando screenshot de desktop...")
        await page.screenshot(path="screenshots/desktop-full.png", full_page=True)

        # Zoom en el área entre bloques
        await page.evaluate("""
            const searchSection = document.querySelector('.search-section');
            const resultsSection = document.querySelector('.results-section');
            if (searchSection && resultsSection) {
                const searchRect = searchSection.getBoundingClientRect();
                const resultsRect = resultsSection.getBoundingClientRect();
                const centerPoint = (searchRect.bottom + resultsRect.top) / 2;
                window.scrollTo(0, centerPoint - 300);
            }
        """)

        await page.screenshot(path="screenshots/desktop-focused.png", full_page=False)
        print("✅ Screenshot desktop guardado")

        print("📱 Simulando vista móvil...")
        await page.set_viewport_size({"width": 375, "height": 812})  # iPhone X dimensions
        await page.wait_for_timeout(2000)

        print("📏 Midiendo espaciado en móvil...")
        await measure_spacing(page, "mobile")

        print("📸 Tomando screenshot de móvil...")
        await page.screenshot(path="screenshots/mobile-full.png", full_page=True)

        # Zoom en el área móvil
        await page.evaluate("""
            const searchSection = document.querySelector('.search-section');
            const resultsSection = document.querySelector('.results-section');
            if (searchSection && resultsSection) {
                const searchRect = searchSection.getBoundingClientRect();
                const resultsRect = resultsSection.getBoundingClientRect();
                const centerPoint = (searchRect.bottom + resultsRect.top) / 2;
                window.scrollTo(0, centerPoint - 200);
            }
        """)

        await page.screenshot(path="screenshots/mobile-focused.png", full_page=False)
        print("✅ Screenshot móvil guardado")

        print("🔍 Probando búsqueda con 'Omega3'...")
        await page.fill('#searchInput', 'Omega3')
        await page.wait_for_timeout(1000)
        await page.keyboard.press('Enter')
        await page.wait_for_timeout(3000)

        print("📸 Tomando screenshot con resultados...")
        await page.screenshot(path="screenshots/search-results-desktop.png", full_page=False)

        print("📏 Midiendo espaciado con resultados...")
        await measure_spacing(page, "with-results")

        # Vista móvil con resultados
        await page.set_viewport_size({"width": 375, "height": 812})
        await page.wait_for_timeout(1000)
        await page.screenshot(path="screenshots/search-results-mobile.png", full_page=False)

        print("✨ Verificando visibilidad de resultados...")
        await check_results_visibility(page)

        print("🎯 Análisis final de espaciado...")
        await final_spacing_analysis(page)

        await browser.close()
        print("✅ Todas las screenshots y mediciones completadas!")

async def measure_spacing(page, label):
    """
    Medir el espaciado exacto entre bloques
    """
    measurements = await page.evaluate("""
        () => {
            const searchSection = document.querySelector('.search-section');
            const resultsSection = document.querySelector('.results-section');

            if (!searchSection || !resultsSection) {
                return { error: 'No se encontraron los elementos' };
            }

            const searchRect = searchSection.getBoundingClientRect();
            const resultsRect = resultsSection.getBoundingClientRect();

            return {
                searchBottom: searchRect.bottom,
                resultsTop: resultsRect.top,
                gap: resultsRect.top - searchRect.bottom,
                searchHeight: searchRect.height,
                resultsHeight: resultsRect.height,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight
            };
        }
    """)

    print(f"\n📊 Mediciones - {label}:")
    if 'error' in measurements:
        print(f"   ❌ Error: {measurements['error']}")
    else:
        print(f"   🔍 Bottom búsqueda: {measurements['searchBottom']:.2f}px")
        print(f"   📋 Top resultados: {measurements['resultsTop']:.2f}px")
        print(f"   📏 Espaciado: {measurements['gap']:.2f}px")
        print(f"   📐 Tamaño búsqueda: {measurements['searchHeight']:.2f}px")
        print(f"   📊 Tamaño resultados: {measurements['resultsHeight']:.2f}px")
        print(f"   📱 Viewport: {measurements['viewportWidth']}x{measurements['viewportHeight']}")

        if measurements['gap'] <= 5:
            print("   ✅ Espaciado CORRECTO (≤ 5px)")
        else:
            print(f"   ⚠️ Espaciado EXCESIVO ({measurements['gap']:.2f}px > 5px)")

async def check_results_visibility(page):
    """
    Verificar si los resultados son visibles cuando aparecen
    """
    visibility = await page.evaluate("""
        () => {
            const resultsGrid = document.querySelector('.results-grid');
            const noResults = document.querySelector('#noResults');
            const resultCount = document.querySelector('#resultCount');
            const searchInput = document.querySelector('#searchInput');

            let hasResultCards = false;
            let hasNoResults = false;

            if (resultsGrid) {
                const cards = resultsGrid.querySelectorAll('.result-card');
                hasResultCards = cards.length > 0;
            }

            if (noResults) {
                hasNoResults = noResults.style.display !== 'none';
            }

            return {
                hasResultCards,
                hasNoResults,
                resultCount: resultCount ? resultCount.textContent : '0',
                searchValue: searchInput ? searchInput.value : '',
                resultsVisible: hasResultCards || hasNoResults
            };
        }
    """)

    print(f"\n👁️ Visibilidad de Resultados:")
    print(f"   📝 Valor búsqueda: '{visibility['searchValue']}'")
    print(f"   📊 Contador: {visibility['resultCount']}")
    print(f"   🃏 Tarjetas encontradas: {visibility['hasResultCards']}")
    print(f"   ❌ Sin resultados visible: {visibility['hasNoResults']}")
    print(f"   👀 Resultados visibles: {visibility['resultsVisible']}")

async def final_spacing_analysis(page):
    """
    Análisis final del espaciado
    """
    analysis = await page.evaluate("""
        () => {
            // Obtener todos los estilos computados
            const searchSection = document.querySelector('.search-section');
            const resultsSection = document.querySelector('.results-section');
            const searchContainer = document.querySelector('.search-container');
            const resultsContainer = document.querySelector('.results-container');

            if (!searchSection || !resultsSection) {
                return { error: 'Elementos no encontrados' };
            }

            const searchStyles = window.getComputedStyle(searchSection);
            const resultsStyles = window.getComputedStyle(resultsSection);

            return {
                searchSection: {
                    marginBottom: searchStyles.marginBottom,
                    paddingBottom: searchStyles.paddingBottom,
                    minHeight: searchStyles.minHeight
                },
                resultsSection: {
                    marginTop: resultsStyles.marginTop,
                    paddingTop: resultsStyles.paddingTop,
                    minHeight: resultsStyles.minHeight
                },
                computedGap: resultsSection.getBoundingClientRect().top - searchSection.getBoundingClientRect().bottom
            };
        }
    """)

    print(f"\n🎯 Análisis Final de Espaciado:")
    if 'error' in analysis:
        print(f"   ❌ Error: {analysis['error']}")
    else:
        print(f"   🔍 Búsqueda - MarginBottom: {analysis['searchSection']['marginBottom']}")
        print(f"   🔍 Búsqueda - PaddingBottom: {analysis['searchSection']['paddingBottom']}")
        print(f"   🔍 Búsqueda - MinHeight: {analysis['searchSection']['minHeight']}")
        print(f"   📋 Resultados - MarginTop: {analysis['resultsSection']['marginTop']}")
        print(f"   📋 Resultados - PaddingTop: {analysis['resultsSection']['paddingTop']}")
        print(f"   📋 Resultados - MinHeight: {analysis['resultsSection']['minHeight']}")
        print(f"   📏 Espaciado computado: {analysis['computedGap']:.2f}px")

async def main():
    """
    Función principal
    """
    print("🚀 Iniciando análisis de espaciado y screenshots...")

    # Crear directorio de screenshots
    os.makedirs('screenshots', exist_ok=True)

    await take_screenshots_and_measure()

    print("\n📋 Resumen:")
    print("   ✅ Screenshots guardadas en /screenshots/")
    print("   ✅ Mediciones completadas")
    print("   ✅ Análisis de espaciado realizado")
    print("\n🎯 Para revisar los resultados:")
    print("   1. Abre las screenshots en la carpeta /screenshots/")
    print("   2. Revisa las mediciones en la consola")
    print("   3. Si el espaciado es > 5px, los CSS fixes pueden necesitar ajuste")

if __name__ == "__main__":
    asyncio.run(main())