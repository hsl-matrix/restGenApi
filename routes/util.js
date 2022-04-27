var express = require("express");
var router = express.Router();
const { exec, spawn } = require("child-process-async");

router.get("/", function (req, res, next) {
  (async () => {
    const { cmd } = req.query;

    try {
      if (cmd === "rstJns") {
        //restart Janus
        const { stdout, stderr } = await exec(
          "systemctl restart janus-gateway.service"
        );

        res.json(stdout);
      }
    } catch (error) {
      console.log("error = ", error);
      res.json("server api error!!");
    }
  })();
});

module.exports = router;
