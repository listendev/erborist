const fs = require('fs');
const path = require('path');

const getAllFilesInDir = (fullPath, withName) => {
  const files = [];
  fs.readdirSync(fullPath).forEach((file) => {
    const absolutePath = path.join(fullPath, file);
    if (fs.statSync(absolutePath).isDirectory()) {
      const filesFromNestedFolder = getAllFilesInDir(absolutePath, withName);
      filesFromNestedFolder.forEach((f) => {
        if (f === path.join(absolutePath, withName)) {
          files.push(f);
        }
      });
    } else if (file === withName) {
      return files.push(absolutePath);
    }
  });

  return files;
};

exports.rmFile = (dir, filename) => {
  getAllFilesInDir(dir, filename).map((file) => fs.unlinkSync(file));
};
