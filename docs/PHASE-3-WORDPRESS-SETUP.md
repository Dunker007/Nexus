# Phase 3: WordPress Publishing Setup

## Overview
Phase 3 adds the ability to publish content directly to dlxstudios.ai via WordPress REST API. The system can now generate content locally AND publish it live to your blog.

## What's Been Built

### 1. WordPressPublisher Module
**Location:** `src/publishers/WordPressPublisher.ps1`

**Features:**
- WordPress REST API integration
- Application Password authentication (secure)
- Auto-create categories and tags
- Draft or publish mode
- Error handling and retry logic
- Connection testing

### 2. Updated Configuration
**Location:** `src/core/Config.json`

Added WordPress section:
```json
"WordPress": {
    "Enabled": false,
    "SiteUrl": "https://dlxstudios.ai",
    "Username": "",
    "AppPassword": "",
    "DefaultStatus": "draft",
    "Categories": ["AI", "Technology"],
    "Tags": ["automation", "artificial intelligence"]
}
```

### 3. Enhanced Orchestrator
The orchestrator now:
1. Generates content with LM Studio
2. Saves markdown locally
3. Publishes HTML locally
4. **Optionally publishes to WordPress** (if enabled)

## How to Enable WordPress Publishing

### Step 1: Create WordPress Application Password

1. **Log into WordPress Admin:**
   - Go to https://dlxstudios.ai/wp-admin

2. **Navigate to User Profile:**
   - Click "Users" → "Profile"
   - Scroll to "Application Passwords" section

3. **Create New Application Password:**
   - Name: "Fresh-Start Orchestrator"
   - Click "Add New Application Password"
   - **IMPORTANT:** Copy the generated password immediately (you can't see it again)
   - It will look like: `xxxx xxxx xxxx xxxx xxxx xxxx`

### Step 2: Update Config.json

Edit `src/core/Config.json`:

```json
"WordPress": {
    "Enabled": true,  // Change to true
    "SiteUrl": "https://dlxstudios.ai",
    "Username": "your-wordpress-username",  // Your admin username
    "AppPassword": "xxxx xxxx xxxx xxxx",  // The app password from Step 1
    "DefaultStatus": "draft",  // "draft" or "publish"
    "Categories": ["AI", "Technology"],
    "Tags": ["automation", "artificial intelligence"]
}
```

**Security Note:** The AppPassword is stored in plain text in Config.json. Keep this file secure and don't commit it to public Git repositories.

### Step 3: Test Connection

Run the orchestrator:
```powershell
pwsh -ExecutionPolicy Bypass -File ".\src\core\Orchestrator.ps1"
```

Expected log output:
```
[2025-11-21 21:00:00] [INFO] WordPress publishing enabled. Initializing...
[2025-11-21 21:00:01] [SUCCESS] WordPress connection successful.
[2025-11-21 21:00:05] [SUCCESS] Published to WordPress! Post ID: 123, URL: https://dlxstudios.ai/...
```

### Step 4: Verify on WordPress

1. Go to https://dlxstudios.ai/wp-admin/edit.php
2. Look for your new post (will be in Draft status by default)
3. Review, edit if needed, then click "Publish"

## Publishing Workflow

### Current Flow (WordPress Enabled)
```
1. Orchestrator starts
2. Generates content via LM Studio
3. Saves markdown → data/published/YYYY-MM-DD/blog-*.md
4. Publishes HTML → data/published/YYYY-MM-DD/*.html
5. Publishes to WordPress → https://dlxstudios.ai (as draft)
6. Manual review in WordPress admin
7. Click "Publish" when ready
```

### Automatic Publishing (Advanced)
To skip the draft step and auto-publish:
```json
"DefaultStatus": "publish"  // Instead of "draft"
```

⚠️ **WARNING:** This will publish content immediately without review. Only use this once you're confident in LM Studio's output quality.

## Troubleshooting

### "Failed to connect to WordPress site"
- Check that `SiteUrl` is correct (https://dlxstudios.ai)
- Verify WordPress username is correct
- Verify Application Password is copied correctly (include all spaces)
- Check that your WordPress site has REST API enabled

### "WordPress publish failed: 401 Unauthorized"
- Application Password is incorrect
- Username is incorrect
- Application Passwords feature may be disabled on your WordPress site

### "WordPress publish failed: 403 Forbidden"
- Your WordPress user doesn't have permission to create posts
- Need at least "Author" role

### Categories/Tags Not Working
- The system will auto-create categories and tags if they don't exist
- If creation fails, posts will publish without them (check user permissions)

## Next Steps: Revenue Tracking

With WordPress publishing enabled, the next phase involves:

### 1. AdSense Integration
- Add AdSense code to WordPress theme
- Track impressions and clicks
- Monitor revenue per post

### 2. Analytics Setup
- Google Analytics integration
- Track post performance
- Identify high-performing topics

### 3. Optimization Loop
- Analyze which topics generate most traffic
- Feed successful topics back to LM Studio prompts
- Iterate on content strategy

### 4. Automation Schedule
- Set up Windows Task Scheduler
- Run orchestrator every 4-6 hours
- Generate 3-5 posts per day
- Build content library

## File Structure After Phase 3

```
Fresh-Start/
├── src/
│   ├── core/
│   │   ├── Orchestrator.ps1 (includes WordPress)
│   │   ├── LMStudio-Client.ps1
│   │   ├── Logger.ps1
│   │   └── Config.json (with WordPress creds)
│   └── publishers/
│       ├── HtmlPublisher.ps1
│       └── WordPressPublisher.ps1 (NEW!)
├── data/
│   ├── logs/
│   │   └── orchestrator.log
│   └── published/
│       └── 2025-11-21/
│           ├── blog-*.md
│           └── *.html
└── docs/
    └── PHASE-3-WORDPRESS-SETUP.md (this file)
```

## Success Metrics for Phase 3

- [ ] WordPress Application Password created
- [ ] Config.json updated with credentials
- [ ] Test post published to WordPress (draft)
- [ ] Categories and tags auto-created
- [ ] Post reviewed and published manually
- [ ] Post visible on dlxstudios.ai
- [ ] Ready for automated scheduling

Once these are complete, you have a **fully automated content pipeline** from local AI to live website!

---

**Status:** ✅ Phase 3 Code Complete - Awaiting WordPress Credentials for Testing
