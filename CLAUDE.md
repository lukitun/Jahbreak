# Claude Code Instructions for Jahbreak

## Testing & Deployment Protocol

**CRITICAL:** All testing for Jahbreak must be done using the live deployment at `jahbreak.lukitun.xyz`

### Before Testing
1. **Always commit latest changes first** - The site auto-deploys from GitHub, so commit all changes before testing
2. **Wait 2-3 minutes** after committing for deployment to complete

### Testing Commands
Use these Selenium scripts for testing:
```bash
# Test current deployment
python3 test_current_deployment.py

# Full Selenium test suite
python3 test_selenium.py
```

### API Domain
- **Main Site**: jahbreak.lukitun.xyz (static frontend only)
- **API Backend**: bando.life (currently down - needs investigation)
- **Note**: Frontend is configured to use bando.life for API calls

### Development Workflow
1. Make code changes
2. Commit to GitHub: `git add . && git commit -m "description"`
3. Wait for auto-deployment (2-3 minutes)
4. Test using `python3 test_selenium.py`
5. Verify functionality at jahbreak.lukitun.xyz

### Project Structure
- `index.html` - Frontend interface
- `backend/` - Node.js API server
- `test_selenium.py` - Main test suite
- `test_current_deployment.py` - Quick deployment test

### Important Notes
- Never test on localhost - always use the live site
- Auto-deployment happens on every GitHub commit
- All tests should pass before considering work complete
- Use the API domain bando.life for backend API calls if needed
- **Always maintain a backup**: Before making any changes, create a copy of the latest human-approved version
- Only proceed with modifications after backing up the current working state