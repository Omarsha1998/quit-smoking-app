const qrcode = require("qrcode-terminal");

const url = "https://quit-smoking-api-zr94.onrender.com/download.html";

qrcode.generate(url, { small: true }, (qr) => {
  console.log("\n📱 Scan to open and download page:\n");
  console.log(qr);
  console.log("🔗 URL:", url);
});
