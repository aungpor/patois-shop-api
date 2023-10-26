const fs = require("fs");
const blockhash = require("blockhash-core");
const { imageFromBuffer, getImageData } = require("@canvas/image");

async function generateIMageHash(imgFullPath) {
  const imgHash = await hash(imgFullPath);
  return imgHash;
}

async function hash(imgPath) {
  try {
    const data = await readFile(imgPath);
    let hash = await blockhash.bmvbhash(getImageData(data), 16);

    return hexToBin(hash);
  } catch (error) {
    console.log(error);
    throw error;

  }
}

function hexToBin(hexString) {
  const hexBinLookup = {
    0: "0000",
    1: "0001",
    2: "0010",
    3: "0011",
    4: "0100",
    5: "0101",
    6: "0110",
    7: "0111",
    8: "1000",
    9: "1001",
    a: "1010",
    b: "1011",
    c: "1100",
    d: "1101",
    e: "1110",
    f: "1111",
    A: "1010",
    B: "1011",
    C: "1100",
    D: "1101",
    E: "1110",
    F: "1111",
  };
  let result = "";
  for (i = 0; i < hexString.length; i++) {
    result += hexBinLookup[hexString[i]];
  }
  return result;
}

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      resolve(imageFromBuffer(data));
    });
  });
}

module.exports = {
  generateIMageHash,
};
