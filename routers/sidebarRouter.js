module.exports = app => {
  const express = require("express");
  const router = express.Router();
  const axios = require("axios");

  //   사이드바 빅커머스 오더 카운츠
  router.get("/sidebarMenu", (req, res) => {
    console.log("hisdasd");
    async function callOrdersApi() {
      await axios
        .get("https://api.bigcommerce.com/stores/7uw7zc08qw/v2/orders/count", {
          headers: {
            "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
            accept: "application/json",
            "content-type": "application/json",
          },
        })
        .then(order => {
          const status = { order };
          console.log(status.order.data);
          res.send(status.order.data);
        })
        .catch(error => console.log(error));
    }
    callOrdersApi();
  });

  // 빅커머스 스톡테이블 로우 정보 by status_id
  router.get("/:status_id", (req, res) => {
    async function callOrdersApi() {
      await axios
        .get("https://api.bigcommerce.com/stores/7uw7zc08qw/v2/orders/", {
          params: { status_id: req.params.status_id },
          headers: {
            "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
            accept: "application/json",
            "content-type": "application/json",
          },
        })
        .then(order => {
          const status = { order };
          console.log(order);
          res.send(status.order.data);
        })
        .catch(error => console.log(error));
    }
    callOrdersApi();
  });

  return router;
};
