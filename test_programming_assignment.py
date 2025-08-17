#!/usr/bin/env python3
"""
Test script to verify that programming-related questions are assigned to the coding agent
"""

import requests
import json
import time
from datetime import datetime

# Test queries that should be assigned to coding agent
PROGRAMMING_QUERIES = [
    "Write a Python script to scrape websites",
    "Create a JavaScript function to validate email",
    "Build a React component for user authentication", 
    "Develop a Node.js API for user management",
    "Code a sorting algorithm in Python",
    "Make a web scraper for product prices",
    "Implement a REST API in Express.js",
    "Program a calculator in JavaScript",
    "Create an app for task management",
    "Write code to connect to a database",
    "Build a web application with authentication",
    "Develop software for inventory management",
    "Script to automate file processing",
    "Application for data visualization"
]

# Non-programming queries that should NOT be assigned to coding agent
NON_PROGRAMMING_QUERIES = [
    "How to learn a new language?",
    "Best practices for project management",
    "How to improve team communication?",
    "What are the benefits of meditation?",
    "How to write a business proposal?"
]

API_URL = "https://bando.life/api/generate"

def test_programming_assignment():
    """Test that programming queries are assigned to coding agent"""
    
    print("🧪 TESTING PROGRAMMING QUESTION ASSIGNMENT TO CODING AGENT")
    print("=" * 65)
    print(f"🕒 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    programming_correct = 0
    programming_total = len(PROGRAMMING_QUERIES)
    non_programming_correct = 0
    non_programming_total = len(NON_PROGRAMMING_QUERIES)
    
    print("📋 Testing PROGRAMMING queries (should use coding_agent):")
    print("-" * 55)
    
    for i, query in enumerate(PROGRAMMING_QUERIES, 1):
        print(f"{i:2d}. Testing: '{query[:50]}{'...' if len(query) > 50 else ''}'")
        
        try:
            payload = {
                "payload": query,
                "personality": "Software Engineer",
                "mode": "professional"
            }
            
            response = requests.post(API_URL, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check Socratic technique template metadata
                if 'prompt' in data and 'templateMetadata' in data['prompt']:
                    socratic_meta = data['prompt']['templateMetadata'].get('socratic', {})
                    template_used = socratic_meta.get('templateUsed', '')
                    
                    if template_used == 'coding_agent':
                        print(f"    ✅ CORRECT: Using coding_agent")
                        programming_correct += 1
                    else:
                        print(f"    ❌ INCORRECT: Using {template_used} (should be coding_agent)")
                else:
                    print(f"    ❌ ERROR: Missing template metadata")
            else:
                print(f"    ❌ ERROR: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ ERROR: {str(e)}")
        
        time.sleep(1)  # Rate limiting
    
    print()
    print("📋 Testing NON-PROGRAMMING queries (should NOT use coding_agent):")
    print("-" * 58)
    
    for i, query in enumerate(NON_PROGRAMMING_QUERIES, 1):
        print(f"{i:2d}. Testing: '{query[:50]}{'...' if len(query) > 50 else ''}'")
        
        try:
            payload = {
                "payload": query,
                "personality": "General Expert", 
                "mode": "professional"
            }
            
            response = requests.post(API_URL, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check Socratic technique template metadata
                if 'prompt' in data and 'templateMetadata' in data['prompt']:
                    socratic_meta = data['prompt']['templateMetadata'].get('socratic', {})
                    template_used = socratic_meta.get('templateUsed', '')
                    
                    if template_used != 'coding_agent':
                        print(f"    ✅ CORRECT: Using {template_used} (not coding_agent)")
                        non_programming_correct += 1
                    else:
                        print(f"    ❌ INCORRECT: Using coding_agent (should use different template)")
                else:
                    print(f"    ❌ ERROR: Missing template metadata")
            else:
                print(f"    ❌ ERROR: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ ERROR: {str(e)}")
        
        time.sleep(1)  # Rate limiting
    
    print()
    print("📊 RESULTS SUMMARY")
    print("=" * 40)
    
    programming_rate = (programming_correct / programming_total) * 100 if programming_total > 0 else 0
    non_programming_rate = (non_programming_correct / non_programming_total) * 100 if non_programming_total > 0 else 0
    overall_rate = ((programming_correct + non_programming_correct) / (programming_total + non_programming_total)) * 100
    
    print(f"Programming queries correctly assigned: {programming_correct}/{programming_total} ({programming_rate:.1f}%)")
    print(f"Non-programming queries correctly assigned: {non_programming_correct}/{non_programming_total} ({non_programming_rate:.1f}%)")
    print(f"Overall accuracy: {programming_correct + non_programming_correct}/{programming_total + non_programming_total} ({overall_rate:.1f}%)")
    
    print()
    if programming_rate >= 80 and non_programming_rate >= 80:
        print("✅ 🎉 ASSIGNMENT TEST PASSED! Programming questions are correctly routed to coding agent.")
    elif programming_rate >= 80:
        print("⚠️  Programming assignment is good, but some non-programming queries incorrectly use coding agent.")
    elif non_programming_rate >= 80:
        print("⚠️  Non-programming assignment is good, but programming queries are not using coding agent.")
    else:
        print("❌ ASSIGNMENT TEST FAILED! Template assignment needs improvement.")
    
    return programming_rate >= 80 and non_programming_rate >= 80

if __name__ == "__main__":
    test_programming_assignment()