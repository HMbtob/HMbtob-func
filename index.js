global.XMLHttpRequest = require("xhr2");
// 파이어베이스
const functions = require("firebase-functions");

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

exports.app = functions.https.onRequest(app);
