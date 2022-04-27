var express = require("express");
var router = express.Router();
var verifyToken = require("../lib/verifyToken");

/* GET home page. */
router.get("/", verifyToken, function (req, res, next) {
  const testJson = { a: 1, b: 2 };
  res.json(testJson);
});

module.exports = router;
