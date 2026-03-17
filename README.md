# Minecraft Wiki Server

A local Minecraft Wiki server that serves static HTML pages with custom routing.

## Features

- Serves Minecraft Wiki HTML pages
- Custom routing for Saint Patrick Day Event and Mounts of Mayhem pages
- Vote.js integration for interactive features
- Local development server and Vercel deployment support

## Local Development

Run the local development server:

```bash
python3 serve.py
```

The server will start at `http://localhost:3000/`

## Routes

- `/` - Main Minecraft Wiki page
- `/w/saint_patrick` - Saint Patrick Day Event page (with vote.js)
- `/w/Mounts_of_Mayhem` - Mounts of Mayhem page
- `/vote.js` - Vote script
- `/saint patrick.jpg` - Saint Patrick image

## Deployment

This project is configured for deployment on Vercel.

### Deploy to Vercel

1. Push to GitHub
2. Import the repository in Vercel
3. Deploy automatically

The `api/index.py` file handles serverless function routing for Vercel deployment.

## Files

- `serve.py` - Local development server
- `api/index.py` - Vercel serverless function
- `vercel.json` - Vercel configuration
- `vote.js` - Interactive voting script
- HTML files - Wiki pages
