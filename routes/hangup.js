var express = require("express");
var moment = require("moment");
var router = express.Router();
var verifyToken = require("../lib/verifyToken");
var db = require("../lib/db");

var knex = db.knexTest;

const insertHangup = (params) =>
  new Promise((resolve) => {
    const { uid, user_id } = params;

    var qq = knex("hanguptest").insert({ uid, user_id });

    //qq.limit(1);
    var rtnRows = qq.then(
      (rows) => {
        console.log(qq.toSQL());
        return Promise.resolve(rows);
      },
      (err) => {
        console.log("Mongo ERROR!!", err, qq.toSQL());
        return Promise.resolve([]);
      }
    );

    resolve(rtnRows);
  });

router.get("/", function (req, res, next) {
  (async () => {
    try {
      const resList = await insertHangup(req.query);
      res.json("success");
    } catch (error) {
      console.log("error = ", error);
      res.json("server api error!!");
    }
  })();
});

module.exports = router;
