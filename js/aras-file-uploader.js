// SOLID Principles Applied:
// S - Single Responsibility: Each class has one responsibility
// O - Open/Closed: Classes are open for extension, closed for modification
// L - Liskov Substitution: Interfaces can be substituted
// I - Interface Segregation: Small, focused interfaces
// D - Dependency Inversion: Depend on abstractions, not concretions

// Utility class for GUID generation (Single Responsibility)
class GuidGenerator {
  static generate() {
    function randomDigit() {
      if (crypto && crypto.getRandomValues) {
        var rands = new Uint8Array(1);
        crypto.getRandomValues(rands);
        return (rands[0] % 16).toString(16);
      } else {
        return ((Math.random() * 16) | 0).toString(16);
      }
    }
    var crypto = window.crypto || window.msCrypto;
    return 'xxxxxxxxxxxx4xxx8xxxxxxxxxxxxxxx'.replace(/x/g, randomDigit).toUpperCase();
  }
}

// Logger interface (Interface Segregation)
class ILogger {
  log(message) {
    throw new Error('Method must be implemented');
  }

  error(message, error) {
    throw new Error('Method must be implemented');
  }
}

// Concrete logger implementation
class DOMLogger extends ILogger {
  constructor(elementId) {
    super();
    this.element = document.getElementById(elementId);
  }

  log(message) {
    if (this.element) {
      this.element.textContent += message + '\n';
    }
    console.log(message);
  }

  error(message, error) {
    const errorMsg = `${message}: ${error?.message || error}`;
    this.log(errorMsg);
    console.error(message, error);
  }
}

// Configuration class (Single Responsibility)
class ArasConfig {
  constructor(baseUrl, vaultUrl, authToken, vaultId) {
    this.baseUrl = baseUrl;
    this.vaultUrl = vaultUrl;
    this.authHeaders = {
      "Authorization": `Bearer ${authToken}`
    };
    this.vaultId = vaultId;
  }
}

// HTTP client abstraction (Dependency Inversion)
class IHttpClient {
  async post(url, headers, body) {
    throw new Error('Method must be implemented');
  }
}

// Concrete HTTP client implementation
class FetchHttpClient extends IHttpClient {
  async post(url, headers, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });
    return response;
  }
}

// Transaction management (Single Responsibility)
class VaultTransactionManager {
  constructor(config, httpClient, logger) {
    this.config = config;
    this.httpClient = httpClient;
    this.logger = logger;
  }

  async beginTransaction() {
    this.logger.log('Beginning vault transaction...');

    const headers = {
      ...this.config.authHeaders,
      'VAULTID': this.config.vaultId
    };

    const response = await this.httpClient.post(
      `${this.config.vaultUrl}/vault.BeginTransaction`,
      headers,
      null
    );

    if (!response.ok) {
      throw new Error(`Failed to begin transaction: ${response.status}`);
    }

    const { transactionId } = await response.json();
    this.logger.log(`Transaction ID: ${transactionId}`);
    return transactionId;
  }

  async commitTransaction(transactionId, fileId, fileName, fileSize) {
    this.logger.log('Committing transaction...');

    const boundary = "batch_" + fileId;
    const headers = {
      ...this.config.authHeaders,
      'VAULTID': this.config.vaultId,
      'transactionid': transactionId,
      'Content-Type': `multipart/mixed; boundary=${boundary}`,
      'Accept': '*/*'
    };

    const commitBody = this._buildCommitBody(boundary, fileId, fileName, fileSize);

    const response = await this.httpClient.post(
      `${this.config.vaultUrl}/vault.CommitTransaction`,
      headers,
      commitBody
    );

    if (!response.ok) {
      throw new Error(`Transaction commit failed: ${response.status} ${response.statusText}`);
    }

    this.logger.log('Transaction committed successfully.');
    return response;
  }

  _buildCommitBody(boundary, fileId, fileName, fileSize) {
    const EOL = "\r\n";
    let body = "--" + boundary + EOL;
    body += "Content-Type: application/http" + EOL + EOL;
    body += "POST " + this.config.baseUrl + "/File HTTP/1.1" + EOL;
    body += "Content-Type: application/json" + EOL + EOL;
    body += `{"id":"${fileId}",`;
    body += `"filename":"${fileName}",`;
    body += `"file_size":${fileSize},`;
    body += `"Located":[{"file_version":1,"related_id":"${this.config.vaultId}"}]}`;
    body += EOL + "--" + boundary + "--";
    return body;
  }
}

// File chunking strategy (Strategy Pattern - Open/Closed Principle)
class IChunkingStrategy {
  getChunks(file, chunkSize) {
    throw new Error('Method must be implemented');
  }
}

class StandardChunkingStrategy extends IChunkingStrategy {
  getChunks(file, chunkSize) {
    const chunks = [];
    let start = 0;
    if (file.size <= chunkSize) {
      // If the file is small enough, return a single chunk
      chunks.push({
        start: 0,
        end: file.size,
        data: file.slice(0, file.size),
        isLast: true
      });
      return chunks;
    }
    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      chunks.push({
        start,
        end,
        data: file.slice(start, end),
        isLast: end === file.size
      });
      start = end;
    }

    return chunks;
  }
}

// File uploader (Single Responsibility)
class ChunkedFileUploader {
  constructor(config, httpClient, logger, chunkingStrategy) {
    this.config = config;
    this.httpClient = httpClient;
    this.logger = logger;
    this.chunkingStrategy = chunkingStrategy;
    this.defaultChunkSize = 1024 * 1024; // 1MB
  }

  async uploadFile(file, fileId, transactionId, chunkSize = this.defaultChunkSize) {


    this.logger.log(`Starting chunked upload for: ${file.name} (${file.size} bytes)`);

    const chunks = this.chunkingStrategy.getChunks(file, chunkSize);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      await this._uploadChunk(chunk, file, fileId, transactionId, i + 1, chunks.length);
    }

    this.logger.log('All chunks uploaded successfully.');

}
  
  async _uploadChunk(chunk, file, fileId, transactionId, chunkNumber, totalChunks) {
  const headers = {
    ...this.config.authHeaders,
    'VAULTID': this.config.vaultId,
    'transactionid': transactionId,
    'Content-Disposition': `attachment; filename*=utf-8''${encodeURIComponent(file.name)}`,
    'Content-Range': `bytes ${chunk.start}-${chunk.end - 1}/${file.size}`,
    'Content-Type': 'application/octet-stream'
  };

  const response = await this.httpClient.post(
    `${this.config.vaultUrl}/vault.UploadFile?fileId=${fileId}`,
    headers,
    chunk.data
  );

  if (!response.ok) {
    throw new Error(`Chunk upload failed: ${response.status}`);
  }

  this.logger.log(`Chunk ${chunkNumber}/${totalChunks} uploaded successfully.`);
}
}

// Main service class (Facade Pattern - combines all components)
class ArasFileUploadService {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.httpClient = new FetchHttpClient();
    this.transactionManager = new VaultTransactionManager(config, this.httpClient, logger);
    this.fileUploader = new ChunkedFileUploader(
      config,
      this.httpClient,
      logger,
      new StandardChunkingStrategy()
    );
  }

  async uploadFile(file) {
    try {
      this.logger.log(`Starting upload process for: ${file.name}`);

      // Generate unique file ID
      const fileId = GuidGenerator.generate();

      // Begin transaction
      const transactionId = await this.transactionManager.beginTransaction();

      // Upload file in chunks
      await this.fileUploader.uploadFile(file, fileId, transactionId);

      // Commit transaction
      await this.transactionManager.commitTransaction(transactionId, fileId, file.name, file.size);

      this.logger.log('Upload completed successfully!');

    } catch (error) {
      this.logger.error('Upload failed', error);
      throw error;
    }
  }
}

// Factory for creating the service (Dependency Inversion)
class ArasFileUploadServiceFactory {
  static create(baseUrl, vaultUrl, authToken, vaultId, logElementId = 'log') {
    const config = new ArasConfig(baseUrl, vaultUrl, authToken, vaultId);
    const logger = new DOMLogger(logElementId);
    return new ArasFileUploadService(config, logger);
  }
}

// Export for use in HTML
window.ArasFileUploadServiceFactory = ArasFileUploadServiceFactory;
window.GuidGenerator = GuidGenerator;
