#!/usr/bin/env python3
"""
Test if templates are displaying correctly on the live site
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time

def test_templates_page():
    """Test the templates page on the live site"""
    
    # Setup Chrome options
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("=" * 60)
        print("TESTING TEMPLATES PAGE ON LIVE SITE")
        print("=" * 60)
        
        # Navigate to templates page
        url = "https://jahbreak.lukitun.xyz/templates"
        print(f"\n1. Navigating to: {url}")
        driver.get(url)
        
        # Wait for page to load
        time.sleep(3)
        
        # Check page title
        print(f"   Page title: {driver.title}")
        
        # Check if main sections exist
        print("\n2. Checking main sections:")
        
        sections = {
            'Direct Templates': '#directTemplates',
            'Interactive Templates': '#interactiveTemplates', 
            'Socratic Templates': '#socraticTemplates'
        }
        
        for section_name, selector in sections.items():
            try:
                element = driver.find_element(By.CSS_SELECTOR, selector)
                children = driver.find_elements(By.CSS_SELECTOR, f"{selector} .template-card")
                print(f"   ✅ {section_name}: Found {len(children)} templates")
            except NoSuchElementException:
                print(f"   ❌ {section_name}: Section not found")
        
        # Check template cards
        print("\n3. Checking template cards:")
        all_cards = driver.find_elements(By.CSS_SELECTOR, '.template-card')
        print(f"   Total template cards found: {len(all_cards)}")
        
        if all_cards:
            # Check first few cards for content
            print("\n4. Checking template content (first 3 cards):")
            for i, card in enumerate(all_cards[:3]):
                try:
                    # Get template name
                    name_elem = card.find_element(By.CSS_SELECTOR, '.template-name')
                    name = name_elem.text
                    
                    # Get description
                    desc_elem = card.find_element(By.CSS_SELECTOR, '.template-description')
                    description = desc_elem.text
                    
                    # Check for preview content
                    preview_elem = card.find_element(By.CSS_SELECTOR, '.template-preview')
                    preview_text = preview_elem.text
                    
                    # Check if it has actual content or just placeholder
                    has_actual_content = len(preview_text) > 100 and "You are a" in preview_text
                    
                    print(f"\n   Card {i+1}: {name}")
                    print(f"   - Description: {description[:50]}...")
                    print(f"   - Preview length: {len(preview_text)} chars")
                    print(f"   - Has actual template content: {'✅' if has_actual_content else '❌'}")
                    
                    if has_actual_content:
                        # Show first 150 chars of actual content
                        content_start = preview_text.find("You are a")
                        if content_start >= 0:
                            print(f"   - Content preview: {preview_text[content_start:content_start+150]}...")
                    
                except NoSuchElementException as e:
                    print(f"   Card {i+1}: Missing element - {e}")
        
        # Check for any JavaScript errors
        print("\n5. Checking for JavaScript errors:")
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        if errors:
            print("   ❌ JavaScript errors found:")
            for error in errors[:3]:  # Show first 3 errors
                print(f"      - {error['message'][:100]}...")
        else:
            print("   ✅ No JavaScript errors")
        
        # Check if static content file is accessible
        print("\n6. Checking static content file:")
        driver.get("https://jahbreak.lukitun.xyz/static_template_content.js")
        time.sleep(1)
        
        # Check if file loaded (should contain STATIC_TEMPLATE_CONTENT)
        page_source = driver.page_source
        if "STATIC_TEMPLATE_CONTENT" in page_source and '"content":' in page_source:
            print("   ✅ Static template content file is accessible")
        else:
            print("   ❌ Static template content file not found or empty")
        
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        
        if len(all_cards) >= 30:
            print("✅ Templates are loading on the page")
        else:
            print(f"⚠️  Only {len(all_cards)} templates found (expected 32)")
            
    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_templates_page()