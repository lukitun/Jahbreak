#!/usr/bin/env python3
"""
Test current deployment status of jahbreak.lukitun.xyz
Checks what version is currently deployed vs what we have locally
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(10)
    return driver

def check_deployment_status(base_url):
    """Check what's currently deployed"""
    print(f"🔍 Checking deployment status of {base_url}")
    
    driver = setup_driver()
    
    try:
        driver.get(base_url)
        
        # Check page title
        title = driver.title
        print(f"📄 Page title: {title}")
        
        # Check if Templates link exists
        try:
            templates_link = driver.find_element(By.XPATH, "//a[@href='/templates']")
            print("✅ Templates link found - NEW VERSION DEPLOYED")
        except:
            print("❌ Templates link NOT found - OLD VERSION DEPLOYED")
        
        # Check API configuration by looking at page source
        page_source = driver.page_source
        
        if "window.location.origin" in page_source:
            print("✅ API config uses window.location.origin - NEW VERSION")
        elif "bando.life" in page_source:
            print("❌ API config still uses bando.life - OLD VERSION")
        else:
            print("❓ Unable to determine API configuration")
        
        # Check navigation structure
        try:
            header_actions = driver.find_element(By.CLASS_NAME, "header-actions")
            links = header_actions.find_elements(By.TAG_NAME, "a")
            print(f"🔗 Navigation links found: {len(links)}")
            for i, link in enumerate(links):
                href = link.get_attribute("href")
                text = link.text.strip()
                print(f"   {i+1}. {text} → {href}")
        except Exception as e:
            print(f"❌ Could not analyze navigation: {e}")
        
        # Try to access templates page
        try:
            driver.get(f"{base_url}/templates")
            if "Template Explorer" in driver.title:
                print("✅ Templates page accessible - NEW VERSION")
            else:
                print("❌ Templates page not accessible - OLD VERSION")
        except Exception as e:
            print(f"❌ Templates page failed to load: {e}")
        
        # Test basic page functionality
        driver.get(base_url)
        try:
            payload_field = driver.find_element(By.ID, "payload")
            generate_button = driver.find_element(By.ID, "generateBtn")
            print("✅ Main functionality elements found")
        except Exception as e:
            print(f"❌ Main functionality issue: {e}")
        
        # Summary
        print("\n📊 DEPLOYMENT STATUS SUMMARY:")
        print("=" * 50)
        
        templates_link_exists = False
        api_config_updated = False
        
        try:
            driver.get(base_url)
            driver.find_element(By.XPATH, "//a[@href='/templates']")
            templates_link_exists = True
        except:
            pass
        
        if "window.location.origin" in page_source:
            api_config_updated = True
        
        if templates_link_exists and api_config_updated:
            print("🎉 FULLY DEPLOYED - All changes are live")
        elif templates_link_exists and not api_config_updated:
            print("⚠️ PARTIALLY DEPLOYED - Templates added but API config not updated")
        elif not templates_link_exists and api_config_updated:
            print("⚠️ PARTIALLY DEPLOYED - API config updated but templates not added")
        else:
            print("❌ NOT DEPLOYED - Changes not visible on live site")
            print("   Action needed: Deploy latest version to jahbreak.lukitun.xyz")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    check_deployment_status("https://jahbreak.lukitun.xyz")