console.log("Server-side code running");

const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const app = express();

const srcpath = path.join(__dirname + "/archivos");
const destpath = path.join(__dirname + "/archivos2");

// listar archivos
filenames = fs.readdirSync(path.join(__dirname + "/archivos"));

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

console.log("\nOrigen: " + srcpath);
console.log("Destino: " + destpath);

copyFiles();

// start the express web server listening on 5000
app.listen(5000, () => {
  console.log("\nServer runing on port", 5000);
});

// serve the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});
