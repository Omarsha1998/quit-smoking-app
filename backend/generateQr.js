const QRCode = require("qrcode");

const apkUrl = "https://quit-smoking-api-zr94.onrender.com/HingaPh.apk";

QRCode.toString(apkUrl, { type: "terminal", small: true }, (err, qr) => {
  if (err) throw err;
  console.log("\n📱 Scan this QR to download the APK:\n");
  console.log(qr);
  console.log("🔗 URL:", apkUrl);
});
