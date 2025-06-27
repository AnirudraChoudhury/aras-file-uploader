# Aras Vault File Uploader – User Guide

Welcome to the **Aras Vault File Uploader**! This guide will walk you through the steps to upload files to your Aras Innovator Vault using the provided web interface. You’ll also learn how to obtain the required Vault ID and Authentication Token using the Aras Innovator RESTful API, including the required password encryption process for Aras Innovator 2025+.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Getting Your Vault ID](#getting-your-vault-id)
4. [Obtaining an Authentication Token (with Password Encryption)](#obtaining-an-authentication-token-with-password-encryption)
5. [Using the File Uploader Interface](#using-the-file-uploader-interface)
6. [Chunked Uploads](#chunked-uploads)
7. [Troubleshooting](#troubleshooting)
8. [Further Reading](#further-reading)

---

## Overview

The Aras Vault File Uploader is a web-based tool that allows you to upload files directly to your Aras Innovator Vault using RESTful APIs. It supports chunked uploads for large files and provides real-time progress and logging.

---

## Prerequisites

- Access to an Aras Innovator 2025+ server with RESTful API enabled.
- A valid Aras user account with permissions to upload files.
- The base URL of your Aras Innovator server (e.g., `http://localhost/vedanix`).

---

## Getting Your Vault ID

To upload files, you need the **Vault ID** of your target vault. Here’s how to retrieve it using the Aras RESTful API:

1. **Send a GET request to the Vaults endpoint:**

   ```
   GET http://<your-aras-server>/server/odata/Vault
   ```

   - Replace `<your-aras-server>` with your server’s address (e.g., `localhost/vedanix`).

2. **Authenticate:**  
   - Use your Aras credentials (see [Obtaining an Authentication Token](#obtaining-an-authentication-token-with-password-encryption)).

3. **Find the Vault ID:**  
   - The response will be a JSON array of vaults.  
   - Look for the `"id"` property of the vault you want to use.  
   - Example response:
     ```json
     {
       "value": [
         {
           "id": "A1B2C3D4E5F6G7H8I9J0",
           "name": "Default",
           ...
         }
       ]
     }
     ```
   - Copy the `id` value for use in the uploader.

---

## Obtaining an Authentication Token (with Password Encryption)

**Important:** For Aras Innovator 2025+, your password must be encrypted with the server’s public key and then Base64-encoded before sending it in the authentication request.

### 1. Retrieve the Server’s Public Key

- Send a GET request to the `/server/publickey` endpoint:
  ```
  GET http://<your-aras-server>/server/publickey
  ```
- The response will include the public key in PEM format.

### 2. Encrypt Your Password

- Use the public key to encrypt your password using RSA encryption (PKCS#1 v1.5 padding).
- The encrypted password must be Base64-encoded.

  **Example using Node.js:**
  ```js
  const crypto = require('crypto');
  const publicKey = `-----BEGIN PUBLIC KEY-----\n...your key here...\n-----END PUBLIC KEY-----`;

  const encrypted = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from('yourPassword')
  );
  const encryptedPassword = encrypted.toString('base64');
  ```

### 3. Request the Token

- Send a POST request to `/server/oauth/token` with the encrypted password:
  ```
  POST http://<your-aras-server>/server/oauth/token
  Content-Type: application/x-www-form-urlencoded

  grant_type=password&username=<your-username>&password=<encrypted-password>&client_id=IOMApp
  ```
- Replace `<encrypted-password>` with your Base64-encoded, RSA-encrypted password.

### 4. Use the Access Token

- The response will include the `access_token` for use in the uploader.

**Note:**
- If you use a tool like Postman, you must encrypt the password externally and paste the Base64 string.
- Many scripting languages (Python, Node.js, PowerShell) support RSA encryption.

---

## Using the File Uploader Interface

1. **Open the Application:**  
   - Launch `index.html` in your browser.

2. **Fill in the Configuration Fields:**
   - **Base Server URL:**  
     Enter your Aras server URL (e.g., `http://localhost/vedanix`).
   - **Auth Token:**  
     Paste the `access_token` you obtained above.
   - **Vault ID:**  
     Paste the Vault ID you retrieved earlier.

3. **Select a File:**  
   - Click the file input or drag and drop a file into the window.

4. **Enable/Disable Chunked Upload:**  
   - By default, chunked upload is enabled (recommended for large files).

5. **Upload:**  
   - Click the **Upload File** button.
   - Monitor progress and logs in the interface.

---

## Chunked Uploads

- **Chunked Upload** splits large files into smaller parts for reliable transfer.
- Recommended for files larger than a few MB.
- You can disable this option for small files.

---

## Troubleshooting

### 500 Error When Using HTTP Aras Server

If your Aras server is running on HTTP (not HTTPS) and you access the uploader via a link (e.g., http://anirudrachoudhury.github.io/aras-file-uploader), you may get a 500 error due to browser security restrictions. To resolve this, follow these steps:

1. **Run the application in your browser using HTTP:**
   - Example: `http://anirudrachoudhury.github.io/aras-file-uploader`
2. **Disable any browser shields or extensions that may block HTTP requests.**

#### Steps to Disable Shields/Extensions (per browser):

1. **Disable Browser Extensions (Especially Ad Blockers)**
   - Chrome/Edge/Firefox:
     - Go to `chrome://extensions` (or `edge://extensions` / `about:addons` in Firefox).
     - Disable extensions one by one (especially uBlock Origin, AdBlock Plus, Privacy Badger).
     - Refresh the page to see if the error disappears.
2. **Check Browser Privacy & Security Settings**
   - Disable Tracking Protection (Firefox):
     - Go to `about:preferences#privacy` → Uncheck "Enhanced Tracking Protection" for the site.
   - Allow Scripts (Brave/Opera):
     - Click the shield icon in the address bar and disable blocking.
3. **Whitelist the Website**
   - If you control the site:
     - AdBlock/uBlock Origin:
       - Click the extension icon → "Don’t run on this site."
     - Brave Browser:
       - Disable "Shields" for the domain.
4. **Test in Incognito/Private Mode**
   - Open the page in Incognito (Chrome/Edge) or Private Window (Firefox).
   - If it works, the issue is caused by an extension.
5. **Check for Malware or Overly Strict Security Software**
   - Temporarily disable:
     - Antivirus/web protection (e.g., Norton, McAfee, Kaspersky).
     - Firewall rules blocking scripts.

- **Authentication Errors:**  
  - Ensure your token is valid and not expired.
  - Double-check your username/password and client ID.

- **Vault Not Found:**  
  - Verify the Vault ID is correct and exists on your server.

- **Upload Fails:**  
  - Check your network connection.
  - Review the log output for error messages.

---

## Further Reading

- [Aras Innovator 2025 RESTful API Documentation (PDF)](https://aras.com/wp-content/uploads/2025/06/Aras-Innovator-2025-Release-RESTful-API.pdf)
- [Aras Innovator Documentation](https://www.aras.com/support/documentation)
- [OAuth2 Authentication Overview](https://oauth.net/2/)

---

**Built with SOLID principles • Modular Architecture • Extensible Design**  
For questions or feedback, contact [Anirudra Choudhury](https://anirudrachoudhury.vercel.app).
