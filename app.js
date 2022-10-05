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
async function copyFiles(srcpath, destpath) {
  try {
    await fs.copy(srcpath, destpath);
    console.log("\nArchivos copiados!");
  } catch (err) {
    console.error(err);
  }
  console.log("\nOrigen: " + srcpath);
  console.log("Destino: " + destpath);
}

SFTP.connect(folderDownload);

// copyFiles();

// start the express web server listening on 5000
app.listen(5000, () => {
  console.log("\nServer runing on port", 5000);
});

app.get("/downloadfiles", (req, res) => {
  SFTP.downloadSFTPFile().then(async (listFiles) => {
    console.log("File Served To Client");
    // create dir if not exist
    !fs.existsSync(process.env.DESTFILE) && fs.mkdirSync(process.env.DESTFILE);
   await copyFiles(srcpath, process.env.DESTFILE);
   res.send(200)

  });
});

// download files from sftp and send to client
// app.get("/downloadfiles/:namefile", (req, res) => {
//   SFTP.downloadSFTPFile(req.params.namefile).then((res) => {
//     console.log("File Served To Client");    
//     res.download(`${__dirname}/${folderDownload}/${req.params.namefile}`);
//   });
// });

// serve the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});
