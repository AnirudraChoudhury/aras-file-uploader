async function downloadFile(fileId, fileName) {
  const baseServer = document.getElementById('baseServerInput').value;
  const authToken = document.getElementById('authTokenInput').value;
    if (!baseServer || !authToken) {
        alert("Please enter the base server URL and authentication token.");
        return;
    }
    const baseUrl = baseServer.replace(/\/$/, '') + "/server/odata";
  const url = `${baseUrl}/File('${fileId}')/$value`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    alert("Download failed: " + err.message);
    console.error(err);
  }
}
