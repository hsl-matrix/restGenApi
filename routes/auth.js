var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var config = require("../config");

/* GET users listing. */
router.post("/", function (req, res, next) {
  const { userid } = req;

  var token = jwt.sign({ id: userid }, config.secret, {
    expiresIn: "3650d", // expires in 24 hours
  });

  res.json({ token });
});

module.exports = router;
