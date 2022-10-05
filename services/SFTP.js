const ClientSFTP = require("ssh2-sftp-client");
const path = require("path");
const optionSFTP = {
  host: process.env.SFTPHOST,
  port: process.env.SFTPPORT,
  username: process.env.SFTPUSERNAME,
  password: process.env.SFTPPASSWORD,
};
const SFTPdir = process.env.DIRSFTP;
class SFTPClient {
  remoteDir = ".";
  folderToDownloadFiles = "";
  constructor() {
    this.client = new ClientSFTP();
  }

  async connect(folderToDownloadFiles) {
    this.folderToDownloadFiles = folderToDownloadFiles;
    console.log(`Connecting to ${optionSFTP.host}:${optionSFTP.port}`);
    try {
      const res = await this.client.connect(optionSFTP);
      console.log("Connected sftp");
      this.remoteDir = SFTPdir;
      console.log("Selected SFTP server dir: ", SFTPdir);
    } catch (err) {
      console.error("Failed to connect SFTP:", err);
    }
  }
  async listFiles() {
    console.log(`Listing ${this.remoteDir} ...`);
    let fileObjects;
    try {
      fileObjects = await this.client.list(this.remoteDir);
    } catch (err) {
      console.log("Listing failed:", err);
    }
    const fileNames = [];

    for (const file of fileObjects) {
      if (file.type === "d") {
        console.log(
          `${new Date(file.modifyTime).toISOString()} PRE ${file.name}`
        );
      } else {
        console.log(
          `${new Date(file.modifyTime).toISOString()} ${file.size} ${file.name}`
        );
      }
      fileNames.push(file.name);
    }
    return fileNames;
  }

  async downloadMultipleFiles() {
    let fileObjects;
    try {
      fileObjects = await this.client.list(this.remoteDir);
    } catch (err) {
      console.log("Listing failed:", err);
    }
    const listFiles = [];
    return new Promise(async (resolve) => {
      for await (const file of fileObjects) {
        const urlFile = this.remoteDir + "/" + file.name;
        try {
          this.client.get(
            urlFile,
            path.join(
              __dirname,
              "/../",
              this.folderToDownloadFiles + "/" + file.name
            )
          );
          listFiles.push(file.name);
          console.log(`File ${file.name} downloaded in server`);
        } catch (err) {
          console.error("Downloading failed:", err);
        }
      }
      resolve(listFiles);
    });
  }

  /**
   * @param {string} nameFile
   * @returns {Promise<string[]>}
   */
  downloadSFTPFile(nameFile) {
    const urlFile = this.remoteDir + "/" + nameFile;
    return new Promise(async (resolve) => {
      console.log(`Downloading ${urlFile}  ...`);
      if (nameFile) {
        try {
          await this.client.get(
            urlFile,
            path.join(
              __dirname,
              "/../",
              this.folderToDownloadFiles + "/" + nameFile
            )
          );
          console.log("File downloaded in server");
          resolve();
        } catch (err) {
          console.error("Downloading failed:", err);
        }
      } else {
        this.downloadMultipleFiles().then((listFiles) => {
          resolve(listFiles);
        });
      }
    });
  }

  async disconnect() {
    await this.client.end();
  }
}
module.exports = new SFTPClient();
