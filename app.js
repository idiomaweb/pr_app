console.log("Server-side code running");

const express = require("express");
const path = require("path");
const fs = require("fs-extra");
require("dotenv").config();
const SFTP = require("./services/SFTP");
const app = express();
const folderDownload = "/archivos";

const srcpath = path.join(__dirname + folderDownload);

// create dir if not exist
!fs.existsSync(srcpath) && fs.mkdirSync(srcpath);
// listar archivos
filenames = fs.readdirSync(srcpath);

console.log("\nCurrent directory filenames:");
filenames.forEach((file) => {
  console.log(file);
});

// Async/Await:
async function copyFiles() {
  try {
    await fs.copy(srcpath, destpath);
    console.log("\nArchivos copiados!");
  } catch (err) {
    console.error(err);
  }
}

SFTP.connect(folderDownload);

console.log("\nOrigen: " + srcpath);
// console.log("Destino: " + destpath);

// copyFiles();

// start the express web server listening on 5000
app.listen(5000, () => {
  console.log("\nServer runing on port", 5000);
});

// download files from sftp and send to client
app.get("/downloadfiles/:namefile", (req, res) => {
  SFTP.downloadSFTPFile("Archivo de texto.txt").then(() => {
    console.log("File Served To Client");
    res.download(`${__dirname}/${folderDownload}/${req.params.namefile}`);
  });
});

// serve the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});
