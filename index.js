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
const BigProductDetail = require("./routers/BigProductDetail")(app);
// 프록시
const cors = require("cors")({ origin: true });
app.use(cors);

app.use("/big", BigProductDetail);
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
      type: "none",
      dcRates: { beauty: 0, cd: 0, dvd: 0, goods: 0, limited: 0, per: 0 },
      shippingRate: { dhl: 0, ems: 0 },
      recipientEmail: "",
      recipientPhoneNumber: "",
      address1: "",
      address2: "",
      address3: "",
      country: "",
      zipcode: "",
      recipient: "",
      shippingMessage: "",
      inCharge: "",
      nickName: "",
      memo: "",
      credit: 1,
      creditDetails: [
        {
          type: "createAccount",
          amount: 1,
          date: new Date(),
          totalAmount: 1,
        },
      ],
    })
    .then(writeResult => {
      console.log("User Created result:", writeResult);
      return;
    })
    .catch(e => {
      console.log(e);
      return;
    });

  admin.firestore().collection("rooms").doc().set({
    userName: user.email,
  });
});

exports.app = functions.https.onRequest(app);
