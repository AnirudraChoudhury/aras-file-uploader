# Aras File Uploader

## Overview

This project is a web-based tool for uploading files to an Aras Innovator Vault using the RESTful API. It supports chunked uploads, a modern UI, and real-time progress/logging.

## File Structure

```
index.html                  # Main web interface
js/
  aras-file-uploader.js     # JavaScript logic for file upload
docs/
  userguide.md              # End-user guide (see below)
README.md                   # Project documentation
```

## Features

- Upload files to Aras Innovator Vault via RESTful API
- Chunked upload support for large files
- Modern, responsive UI (Tailwind CSS)
- Real-time progress and logging
- Modular architecture

## Usage

1. **Open `index.html` in your browser.**
2. **Fill in the configuration fields:**
   - Base Server URL (e.g., `http://localhost/vedanix`)
   - Auth Token (see [User Guide](docs/userguide.md) for how to obtain)
   - Vault ID (see [User Guide](docs/userguide.md) for how to obtain)
3. **Select a file and click Upload File.**
4. **Monitor progress and logs in the interface.**

## How to Get Auth Token and Vault ID

See the [User Guide](docs/userguide.md) for step-by-step instructions, including the required password encryption process for Aras Innovator 2025+.

## Extending the Codebase

- Add new chunking strategies by extending the upload logic
- Implement custom loggers or UI enhancements as needed

## Documentation

- [User Guide](docs/userguide.md): End-user instructions, including authentication and vault setup
- [Aras Innovator 2025 RESTful API Documentation (PDF)](https://aras.com/wp-content/uploads/2025/06/Aras-Innovator-2025-Release-RESTful-API.pdf)

## License

MIT

## Troubleshooting: HTTP Server & 500 Error

If you run the application from the link (e.g., http://anirudrachoudhury.github.io/aras-file-uploader) and your Aras server is running on HTTP (not HTTPS), you may encounter a 500 error due to browser security restrictions. To resolve this:

1. **Run the application in your browser using HTTP:**
   - Example: `http://anirudrachoudhury.github.io/aras-file-uploader`
2. **Disable any browser shields or extensions that may block HTTP requests.**

### Steps to Disable Shields/Extensions (per browser):

#### 1. Disable Browser Extensions (Especially Ad Blockers)
- **Chrome/Edge/Firefox:**
  - Go to `chrome://extensions` (or `edge://extensions` / `about:addons` in Firefox).
  - Disable extensions one by one (especially uBlock Origin, AdBlock Plus, Privacy Badger).
  - Refresh the page to see if the error disappears.

#### 2. Check Browser Privacy & Security Settings
- **Disable Tracking Protection (Firefox):**
  - Go to `about:preferences#privacy` → Uncheck "Enhanced Tracking Protection" for the site.
- **Allow Scripts (Brave/Opera):**
  - Click the shield icon in the address bar and disable blocking.

#### 3. Whitelist the Website
- **If you control the site:**
  - **AdBlock/uBlock Origin:**
    - Click the extension icon → "Don’t run on this site."
  - **Brave Browser:**
    - Disable "Shields" for the domain.

#### 4. Test in Incognito/Private Mode
- Open the page in Incognito (Chrome/Edge) or Private Window (Firefox).
- If it works, the issue is caused by an extension.

#### 5. Check for Malware or Overly Strict Security Software
- Temporarily disable:
  - Antivirus/web protection (e.g., Norton, McAfee, Kaspersky).
  - Firewall rules blocking scripts.
