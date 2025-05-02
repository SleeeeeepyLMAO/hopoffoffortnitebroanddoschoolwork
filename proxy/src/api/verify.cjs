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

var get_cookies = function (request) {
  var cookies = {};
  if (request.headers && request.headers.cookie) {
    request.headers.cookie.split(";").forEach(function (cookie) {
      var parts = cookie.match(/(.*?)=(.*)$/);
      cookies[parts[1].trim()] = (parts[2] || "").trim();
    });
  }
  return cookies;
};

function isPassValid(pass, website) {
  try {
    return passwords[website] == pass;
  } catch {
    return false;
  }
}
function checkPass(req) {
  let cookies = get_cookies(req);
  if (cookies["password"]) {
    return isPassValid(cookies["password"], req.hostname);
  } else {
    return false;
  }
}

function canAddLink(req) {
  console.log(process.env.ADD_LINK_PASS)
  console.log(req.body.auth)
  if (req.body.auth) {
    return req.body.auth == process.env.ADD_LINK_PASS;
  } else {
    return false;
  }
}
module.exports = { checkPass, canAddLink };
