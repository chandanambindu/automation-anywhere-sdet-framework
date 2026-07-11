const fs = require('fs');
const path = require('path');

function resolveUploadFilePath(candidatePath) {
  if (!candidatePath) {
    return path.resolve(__dirname, '..', 'data', 'files', 'sample-upload.txt');
  }

  if (path.isAbsolute(candidatePath)) {
    return candidatePath;
  }

  return path.resolve(process.cwd(), candidatePath);
}

function ensureFileExists(candidatePath) {
  const resolvedPath = resolveUploadFilePath(candidatePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Upload file was not found: ${resolvedPath}`);
  }

  return resolvedPath;
}

function getUploadFileDetails(candidatePath) {
  const resolvedPath = ensureFileExists(candidatePath);
  return {
    filePath: resolvedPath,
    fileName: path.basename(resolvedPath),
    fileSize: fs.statSync(resolvedPath).size,
  };
}

module.exports = {
  resolveUploadFilePath,
  ensureFileExists,
  getUploadFileDetails,
};
