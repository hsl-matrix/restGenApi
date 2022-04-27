var jwt = require("jsonwebtoken");
var config = require("../config");

let defMsg = {
  dataCnt: 0,
  data: null,
  result: false,
  msg: "",
};

function verifyToken(req, res, next) {
  var token = req.headers["x-access-token"];
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err)
      return res.status(500).send({
        ...defMsg,
        msg: "잘못된 토큰입니다. 관리자에 문의 바랍니다.",
      });

    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;
