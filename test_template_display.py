#!/usr/bin/env python3
"""
Test script to verify templates are displaying actual content
"""

import json
import subprocess
import sys

def test_template_api():
    """Test that the API returns actual template content"""
    print("Testing template API...")
    
    # Start the backend server
    print("Starting backend server...")
    server_process = subprocess.Popen(
        ["node", "server.js"],
        cwd="/root/jahbreak/backend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    import time
    time.sleep(2)  # Wait for server to start
    
    try:
        # Test the templates endpoint
        import requests
        
        print("Fetching templates from API...")
        response = requests.get("http://localhost:3001/api/templates")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                templates = data.get('templates', {})
                
                # Check each category
                for category in ['direct', 'interactive', 'socratic']:
                    cat_templates = templates.get(category, [])
                    print(f"\n{category.upper()} Templates: {len(cat_templates)}")
                    
                    # Check first template has actual content
                    if cat_templates:
                        first = cat_templates[0]
                        has_content = 'actualContent' in first
                        content_length = len(first.get('actualContent', '')) if has_content else 0
                        
                        print(f"  First template: {first.get('name')}")
                        print(f"  Has actualContent: {has_content}")
                        print(f"  Content length: {content_length} chars")
                        
                        if has_content and content_length > 100:
                            print(f"  ✅ Template has actual prompt content")
                            # Show first 200 chars
                            print(f"  Preview: {first['actualContent'][:200]}...")
                        else:
                            print(f"  ❌ Template missing actual content!")
                
                print("\n✅ API test completed successfully")
            else:
                print("❌ API returned unsuccessful response")
        else:
            print(f"❌ API returned status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")
    finally:
        # Stop the server
        server_process.terminate()
        server_process.wait()

def check_static_content():
    """Check if static template content file exists and is valid"""
    print("\nChecking static template content...")
    
    try:
        with open('/root/jahbreak/static_template_content.js', 'r') as f:
            content = f.read()
            
        # Check if it contains expected structure
        has_direct = 'direct' in content
        has_interactive = 'interactive' in content  
        has_socratic = 'socratic' in content
        has_actual_content = '"content":' in content
        
        print(f"  Has direct templates: {has_direct}")
        print(f"  Has interactive templates: {has_interactive}")
        print(f"  Has socratic templates: {has_socratic}")
        print(f"  Contains actual content: {has_actual_content}")
        
        if all([has_direct, has_interactive, has_socratic, has_actual_content]):
            print("  ✅ Static content file is valid")
        else:
            print("  ❌ Static content file is incomplete")
            
    except FileNotFoundError:
        print("  ❌ Static content file not found")
    except Exception as e:
        print(f"  ❌ Error checking static content: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("TEMPLATE DISPLAY TEST")
    print("=" * 60)
    
    # Check static content first
    check_static_content()
    
    # Test API
    test_template_api()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("Templates should now display actual prompt content")
    print("=" * 60)