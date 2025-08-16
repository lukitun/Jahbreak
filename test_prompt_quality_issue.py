#!/usr/bin/env python3
"""
Test to demonstrate the prompt quality issue
"""

import requests
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def test_api_directly():
    """Test the API directly to see what it returns"""
    print("🔍 Testing API directly...")
    
    payload = {
        "payload": "Write a comprehensive Python tutorial for beginners",
        "personality": "Python Expert",
        "options": {"mode": "standard"}
    }
    
    try:
        response = requests.post("https://bando.life/api/generate", json=payload)
        data = response.json()
        
        print(f"Status: {response.status_code}")
        print(f"Response type: {type(data)}")
        
        if 'prompt' in data:
            prompt_data = data['prompt']
            print(f"Prompt data type: {type(prompt_data)}")
            
            if isinstance(prompt_data, dict):
                print(f"Keys in prompt: {list(prompt_data.keys())}")
                
                if 'oneShot' in prompt_data:
                    print(f"\n📋 1-SHOT PROMPT ({len(prompt_data['oneShot'])} chars):")
                    print("="*80)
                    print(prompt_data['oneShot'])
                    print("="*80)
                    
                if 'twoShot' in prompt_data:
                    print(f"\n📋 2-SHOT PROMPT ({len(prompt_data['twoShot'])} chars):")
                    print("="*80)
                    print(prompt_data['twoShot'])
                    print("="*80)
                    
            else:
                print(f"Single prompt: {prompt_data}")
                
        print(f"\nMetadata: {data.get('metadata', 'None')}")
        
    except Exception as e:
        print(f"❌ API test failed: {e}")

def test_website_display():
    """Test what the website actually displays"""
    print("\n🔍 Testing website display...")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    wait = WebDriverWait(driver, 30)
    
    try:
        driver.get("https://jahbreak.lukitun.xyz")
        wait.until(EC.title_contains("Jahbreak"))
        
        # Submit the same query
        payload_textarea = wait.until(EC.element_to_be_clickable((By.ID, "payload")))
        payload_textarea.clear()
        payload_textarea.send_keys("Write a comprehensive Python tutorial for beginners")
        
        personality_input = driver.find_element(By.ID, "personality")
        personality_input.clear()
        personality_input.send_keys("Python Expert")
        
        generate_btn = driver.find_element(By.ID, "generateBtn")
        generate_btn.click()
        
        # Wait for results
        WebDriverWait(driver, 45).until(
            lambda d: (
                d.find_element(By.ID, "outputSection").is_displayed() or
                "active" in d.find_element(By.ID, "error").get_attribute("class")
            )
        )
        
        # Get the displayed prompts
        oneshot_output = driver.find_element(By.ID, "oneshotOutput")
        twoshot_output = driver.find_element(By.ID, "twoshotOutput")
        
        oneshot_text = oneshot_output.text
        twoshot_text = twoshot_output.text
        
        print(f"\n📱 WEBSITE 1-SHOT DISPLAY ({len(oneshot_text)} chars):")
        print("="*80)
        print(oneshot_text)
        print("="*80)
        
        print(f"\n📱 WEBSITE 2-SHOT DISPLAY ({len(twoshot_text)} chars):")
        print("="*80)
        print(twoshot_text)
        print("="*80)
        
        print(f"\n🔍 ANALYSIS:")
        print(f"- Prompts are identical: {oneshot_text == twoshot_text}")
        print(f"- 1-shot quality (basic check): {'Good' if len(oneshot_text) > 500 and 'step-by-step' in oneshot_text.lower() else 'Poor'}")
        print(f"- 2-shot quality (basic check): {'Good' if len(twoshot_text) > 500 and 'clarifying' in twoshot_text.lower() else 'Poor'}")
        
        # Check if they contain proper prompt engineering elements
        oneshot_has_elements = all(element in oneshot_text.lower() for element in ['you are', 'guidelines', 'provide'])
        twoshot_has_elements = all(element in twoshot_text.lower() for element in ['you are', 'guidelines', 'provide'])
        
        print(f"- 1-shot has basic elements: {oneshot_has_elements}")
        print(f"- 2-shot has basic elements: {twoshot_has_elements}")
        
        # Check for differences that should exist
        oneshot_direct = 'direct' in oneshot_text.lower() or 'provide detailed' in oneshot_text.lower()
        twoshot_interactive = 'clarifying questions' in twoshot_text.lower() or 'ask 2-3' in twoshot_text.lower()
        
        print(f"- 1-shot has direct approach indicators: {oneshot_direct}")
        print(f"- 2-shot has interactive approach indicators: {twoshot_interactive}")
        
        if oneshot_text == twoshot_text:
            print("❌ ISSUE CONFIRMED: Prompts are identical when they should be different")
        elif len(oneshot_text) < 300 or len(twoshot_text) < 300:
            print("❌ ISSUE CONFIRMED: Prompts are too short and lack detail")
        elif not (oneshot_has_elements and twoshot_has_elements):
            print("❌ ISSUE CONFIRMED: Prompts lack proper structure")
        else:
            print("✅ Prompts appear to be properly differentiated")
            
    except Exception as e:
        print(f"❌ Website test failed: {e}")
    finally:
        driver.quit()

def main():
    print("🚀 JAHBREAK PROMPT QUALITY INVESTIGATION")
    print("="*80)
    
    # Test API directly
    test_api_directly()
    
    # Test website display
    test_website_display()
    
    print(f"\n💡 CONCLUSION:")
    print("If both tests show short, basic prompts with minimal content,")
    print("then the backend prompt generation needs significant improvement.")
    print("The prompts should be comprehensive, detailed, and different between 1-shot and 2-shot.")

if __name__ == "__main__":
    main()