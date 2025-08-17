# JAHBREAK PROJECT - ESSENTIAL FILES

## 📁 Root Directory Files
- **index.html** - Main frontend interface for the Jahbreak app
- **templates.html** - Template explorer page showing all available templates  
- **README.md** - Project documentation and overview
- **CLAUDE.md** - Development instructions and deployment protocol
- **deploy-to-bando.sh** - Deployment script for backend to bando.life server
- **_redirects** - Netlify redirects configuration for SPA routing
- **.gitignore** - Git ignore rules

## 📁 Backend Directory (/backend/)

### Core Server Files
- **server.js** - Express.js server main entry point
- **package.json** - Node.js dependencies and scripts
- **package-lock.json** - Locked dependency versions
- **ecosystem.config.js** - PM2 process management configuration

### Environment & Config
- **.env** - Environment variables (API keys, etc.)
- **.env.example** - Template for environment variables

### Libraries (/lib/)
- **promptTemplates.js** - Role definitions and expertise mappings
- **templateSelector.js** - AI-powered template selection system using Groq

### API Routes (/routes/)
- **generate.js** - Main prompt generation endpoint
- **templates.js** - Template listing and preview endpoints  
- **feedback.js** - User feedback collection endpoint

### Data Storage (/data/)
- **usage.json** - Usage analytics and metrics
- **feedback.json** - User feedback and ratings

### Template Files (/templates/)
- **direct_txt/** - 11 direct approach template files (.txt)
- **interactive_txt/** - 10 interactive approach template files (.txt)
- **socratic_txt/** - 11 Socratic approach template files (.txt)

### Testing
- **test-templates.js** - Template system validation script

## 📁 Test Files (Root)
- **test_comprehensive.py** - Complete end-to-end testing suite
- **test_live_templates.py** - Template display validation

## Template Files Breakdown

### Direct Templates (11 files)
Immediate, actionable guidance templates:
- comprehensive_framework.txt
- expert_masterclass.txt  
- practical_blueprint.txt
- strategic_roadmap.txt
- quick_solution.txt
- detailed_analysis.txt
- step_by_step_tutorial.txt
- troubleshooting_guide.txt
- best_practices_guide.txt
- resource_compilation.txt
- implementation_checklist.txt

### Interactive Templates (10 files)
Question-based discovery templates:
- focused_dialogue.txt
- comprehensive_discovery.txt
- iterative_refinement.txt
- diagnostic_interview.txt
- needs_assessment.txt
- collaborative_planning.txt
- decision_framework.txt
- learning_assessment.txt
- goal_setting_session.txt
- creative_workshop.txt

### Socratic Templates (11 files)
Self-discovery through questioning templates:
- guided_inquiry.txt
- critical_thinking.txt
- reflective_learning.txt
- assumption_challenging.txt
- root_cause_analysis.txt
- perspective_exploration.txt
- value_discovery.txt
- wisdom_extraction.txt
- belief_examination.txt
- pattern_recognition.txt
- coding_agent.txt

## Total: 55 Essential Files
- 7 root configuration/frontend files
- 16 backend core files  
- 32 template files (.txt format)

All files serve a specific purpose in the Jahbreak advanced prompt engineering system.