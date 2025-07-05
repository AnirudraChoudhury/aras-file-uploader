// ui-utils.js
// Utility functions for Aras Vault File Uploader

// Format file size for display
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to demonstrate extensibility
function generateGuid() {
  // If GuidGenerator is defined elsewhere, this is a stub
  if (typeof GuidGenerator !== 'undefined' && GuidGenerator.generate) {
    return GuidGenerator.generate();
  }
  // Fallback simple GUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Export for module usage if needed
if (typeof module !== 'undefined') {
  module.exports = { formatFileSize, generateGuid };
}
