global.XMLHttpRequest = require("xhr2");
// 파이어베이스
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
// 라우터 분리
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({ origin: true }));
const sidebarRouter = require("./routers/sidebarRouter")(app);
const crRouter = require("./routers/crRouter")(app);
const BigProductDetail = require("./routers/BigProductDetail")(app);
const Exchange = require("./routers/Exchange")(app);
// 프록시

app.use("/big", BigProductDetail);
app.use("/sidebar", sidebarRouter);
app.use("/cr", crRouter);
app.use("/ex", Exchange);
exports.userCreate = functions.auth.user().onCreate((user, context) => {
  admin
    .firestore()
    .collection("accounts")
    .doc(user.email)
    .set({
      createdAt: new Date(),
      displayName: user.displayName,
      email: user.email,
      uid: user.uid,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      type: "none",
      dcRates: {
        cd: Number(0),
        dvdBlueRay: Number(0),
        goods: Number(0),
        photoBook: Number(0),
        officialStore: Number(0),
        beauty: Number(0),
        specialOrder: Number(0),
      },
      dcAmount: {
        cdA: Number(0),
        dvdBlueRayA: Number(0),
        goodsA: Number(0),
        photoBookA: Number(0),
        officialStoreA: Number(0),
        beautyA: Number(0),
        specialOrderA: Number(0),
      },
      shippingRate: { dhl: 10000 },
      recipientEmail: "",
      recipientPhoneNumber: "",
      street: "",
      city: "",
      states: "",
      country: "Albania (AL)",
      zipcode: "",
      recipient: "",
      memo: "",
      inCharge: "",
      nickName: "",
      shippingMessage: "",
      taxId: "",
      credit: 0,
      companyName: "",
      creditDetails: [
        {
          type: "createAccount",
          amount: 0,
          date: new Date(),
          totalAmount: 0,
        },
      ],
      currency: "KRW",
      alias: user.email.substring(0, 3),
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
