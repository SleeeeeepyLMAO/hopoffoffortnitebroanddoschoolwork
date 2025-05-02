let passwords;
const path = require("node:path");
const fs = require("node:fs");
const filePath = path.join(__dirname, "some.pass");
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  try {
    passwords = JSON.parse(data);
  } catch (err) {
    console.error("Error parsing JSON:", err);
  }
});
fs.watch(filePath, () => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    try {
      passwords = JSON.parse(data);
      console.log("file change");
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  });
});

function addPass(data) {
  try {
    console.log(data.link);
    console.log(data.password);
    temp = passwords;
    temp[data.link] = data.password;
    console.log(temp);
    try {
      fs.writeFileSync(filePath, JSON.stringify(temp));
    } catch (err) {
      console.error(err);
      return 500;
    }
    return 200;
  } catch (err) {
    console.error(err);
    return 500;
  }
}

module.exports = addPass;
