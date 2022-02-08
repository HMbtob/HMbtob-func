module.exports = app => {
  const express = require("express");
  const axios = require("axios");
  const router = express.Router();

  router.get("/getex", (req, res) => {
    axios
      .get("http://fx.kebhana.com/FER1101M.web")
      .then(ex => {
        console.log(ex);
        res.send(ex);
      })
      .catch(err => res.send(err));
  });
  return router;
};
