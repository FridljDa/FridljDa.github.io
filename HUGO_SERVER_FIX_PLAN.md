# Hugo Server Fix - Detailed Prompt for New Agent

## Problem Summary
The Hugo server fails to start with the error: `can't evaluate field GoogleAnalytics in type interface {}`. This is a compatibility issue between Hugo Blox theme v5.9.7 and Hugo v0.151.0.

## Root Cause Analysis
Looking at the terminal output, the error occurs in the theme's analytics partial:
```
error calling partial: "/Users/danielfridljand/Desktop/FridljDa.github.io/layouts/partials/analytics/google_analytics.html:1:12": execute of template failed: template: _partials/analytics/google_analytics.html:1:12: executing "_partials/analytics/google_analytics.html" at <.Site.GoogleAnalytics>: can't evaluate field GoogleAnalytics in type page.Site
```

The Hugo Blox theme expects `GoogleAnalytics` to be available in the site configuration, but it's not properly configured.

## Required Fix (Minimal Approach)

### Step 1: Create Custom Analytics Partial
Create the directory structure and file:
```bash
mkdir -p layouts/partials/analytics
```

Create `layouts/partials/analytics/google_analytics.html` with this exact content:
```html
{{- $ga := .Site.Params.marketing.analytics.google_analytics -}}
{{- if $ga -}}
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id={{ $ga }}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{ $ga }}');
</script>
{{- end -}}
```

### Step 2: Ensure Analytics Configuration
Verify that `config/_default/params.yaml` contains:
```yaml
marketing:
  analytics:
    google_analytics: false
    baidu_tongji: false
    google_tag_manager: false
    microsoft_clarity: false
```

### Step 3: Test the Fix
Run:
```bash
hugo server -D
```

## Expected Result
- Hugo server should start successfully without the GoogleAnalytics error
- Site should be accessible at `http://localhost:1313`
- No other errors should occur

## What NOT to Do
Do NOT make these changes (they are unnecessary):
- ❌ Don't add `googleAnalytics: 'UA-000000000-0'` to `hugo.yaml`
- ❌ Don't change `paginate: 10` to `pagination: { pagerSize: 10 }`
- ❌ Don't copy any theme files like `about.biography.html`
- ❌ Don't update Hugo modules
- ❌ Don't modify any other configuration files

## Technical Explanation
The fix works by:
1. Creating a custom analytics partial that properly checks for the analytics configuration
2. Using `.Site.Params.marketing.analytics.google_analytics` instead of the non-existent `.Site.GoogleAnalytics`
3. Only rendering analytics code when a valid Google Analytics ID is provided
4. This bypasses the theme's broken analytics partial that expects `GoogleAnalytics` to exist in the site configuration

## Verification
After implementing the fix, you should see:
- Hugo server starts without errors
- No "can't evaluate field GoogleAnalytics" error messages
- Site loads properly in browser at `http://localhost:1313`

This is a minimal, targeted fix that addresses only the specific compatibility issue without making unnecessary changes to the Hugo configuration or theme files.

## Additional Context
The terminal output shows that there are actually TWO different errors that occurred during the troubleshooting:

1. **GoogleAnalytics Error** (lines 132-141): This was the main issue that prevented the server from starting. The error shows that the custom analytics partial was being used but still had the wrong reference to `.Site.GoogleAnalytics`.

2. **data.GetCSV Error** (lines 27-30): This is a separate compatibility issue where the Hugo Blox theme uses a deprecated function that was removed in Hugo v0.123.0. However, this error appears to be non-blocking in some cases, as the site was successfully served using a Python HTTP server on the pre-built static files.

The fix described above addresses the GoogleAnalytics error, which is the primary blocker for the Hugo development server.
