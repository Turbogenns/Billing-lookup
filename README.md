# Ontario Billing Code Lookup Tool

A web app to help anesthetists and surgeons quickly find OHIP billing codes and modifiers.

## Quick Start

### Prerequisites
- Claude API key (from https://console.anthropic.com)
- Vercel account (free tier works)
- Git installed

### Local Testing (Optional)

1. Clone or download this directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` file with:
   ```
   ANTHROPIC_API_KEY=your-api-key-here
   ```
4. Run locally:
   ```bash
   npm run dev
   ```
5. Visit http://localhost:3000

### Deploy to Vercel (Recommended - 5 minutes)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/billing-lookup.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repo
   - Click "Import"

3. **Add API Key:**
   - Go to "Environment Variables" in Vercel dashboard
   - Add: `ANTHROPIC_API_KEY` = your Claude API key
   - Click "Deploy"

4. **Done!** Your app will be live at: `your-project.vercel.app`

## How to Test with Anesthetists

1. Share the Vercel link with 3-5 anesthetists
2. Ask them to:
   - Describe 2-3 procedures they've done recently
   - Tell you if the suggested codes match what they would bill
   - Note any codes the tool missed or got wrong
3. Collect feedback using the thumbs up/down in the app

## What to Look For

✓ **Success indicators:**
- Users find the tool faster than pulling up the PDF
- Codes suggested match actual billing
- Users ask follow-up questions naturally

✗ **Problem areas:**
- Code suggestions are wrong
- Tool is missing common modifiers
- Users prefer searching the PDF directly

## Next Steps (After Validation)

If anesthetists like it:
1. Partner with a developer
2. Integrate real Ontario SOB PDF (full document)
3. Add Google Sheets for structured feedback
4. Build out modifier logic more completely
5. Add user accounts for usage tracking

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Backend:** Node.js + Vercel serverless functions
- **AI:** Claude API (Anthropic)
- **Hosting:** Vercel (free tier)

## File Structure

```
billing-lookup/
├── api/
│   └── lookup.js          (Backend API endpoint)
├── public/
│   └── index.html         (Frontend UI)
├── package.json
├── vercel.json
├── .gitignore
└── README.md
```

## Notes for MVP

- The billing code reference is simplified for testing
- Feedback is logged to console (not yet to Google Sheets)
- Full Ontario SOB PDF can be added later
- This is intentionally bare-bones—focus on validation, not polish

## Troubleshooting

**"API error: 401"**
- Check your Claude API key is correct in Vercel environment variables

**Blank page**
- Check browser console for JavaScript errors
- Verify `api/lookup.js` deployed successfully

**Billing codes not matching**
- This is expected with the simplified billing reference
- Once validated, we'll integrate the full PDF

## Questions?

This is your tool to test the concept. Iterate based on anesthetist feedback!
