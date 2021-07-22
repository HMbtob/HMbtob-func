global.XMLHttpRequest = require("xhr2");
// 파이어베이스
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
// 라우터 분리
const express = require("express");
const app = express();
const sidebarRouter = require("./routers/sidebarRouter")(app);
const crRouter = require("./routers/crRouter")(app);

// 프록시
const cors = require("cors")({ origin: true });
app.use(cors);

app.use("/sidebar", sidebarRouter);
app.use("/cr", crRouter);

exports.userCreate = functions.auth.user().onCreate((user, context) => {
  admin
    .firestore()
    .collection("accounts")
    .doc(user.email)
    .set({
      displayName: user.displayName,
      email: user.email,
      uid: user.uid,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      type: "customer",
      dcRates: { beauty: 0, cd: 0, dvd: 0, goods: 0, limited: 0, per: 0 },
    })
    .then(writeResult => {
      console.log("User Created result:", writeResult);
      return;
    })
    .catch(e => {
      console.log(e);
      return;
    });
});
exports.app = functions.https.onRequest(app);
