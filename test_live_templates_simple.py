#!/usr/bin/env python3
"""
Simple test to check if templates are displaying actual content
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_templates():
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("Testing jahbreak.lukitun.xyz/templates...")
        driver.get("https://jahbreak.lukitun.xyz/templates")
        time.sleep(5)  # Wait for dynamic content to load
        
        # Get all template previews
        previews = driver.find_elements(By.CSS_SELECTOR, '.template-preview')
        
        print(f"\nFound {len(previews)} template cards")
        
        if previews:
            # Check first 3 templates
            print("\nChecking first 3 templates for actual content:")
            for i in range(min(3, len(previews))):
                preview_text = previews[i].text
                
                # Check if it contains actual template prompt
                has_prompt = "You are a" in preview_text or "User Query" in preview_text
                content_length = len(preview_text)
                
                print(f"\nTemplate {i+1}:")
                print(f"  Content length: {content_length} chars")
                print(f"  Has actual prompt: {'✅ YES' if has_prompt else '❌ NO'}")
                
                if has_prompt:
                    # Show first 200 chars after removing the label
                    content = preview_text.replace("Actual LLM Prompt Template:", "").strip()
                    print(f"  Preview: {content[:200]}...")
                elif content_length > 50:
                    print(f"  Content: {preview_text[:200]}...")
                else:
                    print(f"  Content: {preview_text}")
        
        # Summary
        print("\n" + "="*50)
        if len(previews) >= 30:
            # Check how many have actual content
            actual_content_count = 0
            for preview in previews:
                text = preview.text
                if "You are a" in text or len(text) > 500:
                    actual_content_count += 1
            
            print(f"RESULT: {len(previews)} templates found")
            print(f"        {actual_content_count} have actual prompt content")
            
            if actual_content_count == 0:
                print("\n⚠️  Templates are loading but showing descriptions only")
                print("    The actual prompt content is not being displayed")
            else:
                print("\n✅ Templates are displaying actual prompt content")
        else:
            print(f"⚠️  Only {len(previews)} templates found")
            
    finally:
        driver.quit()

if __name__ == "__main__":
    test_templates()