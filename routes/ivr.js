var express = require("express");
var router = express.Router();

var db = require("../lib/db");
var axios = require("axios");
const https = require("https");
const { fnCenterToIdList } = require("../lib/dbIpcc");

const fnZenFindUserByTel = (userData) =>
  new Promise((resolve) => {
    (async () => {
      console.log("fnZenFindUserByTel = ", userData);

      const { tel: phoneNum, Authorization, apiUrl } = userData;
      var config = {
        method: "get",
        url: `https://${apiUrl}/api/v2/search.json?query=role:end-user phone:${phoneNum}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Authorization}`,
        },
      };

      axios(config)
        .then(function (response) {
          resolve({ success: true, data: response.data });
          // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          resolve({ success: false, data: error });
          // console.log(error);
        });
    })();
  });

const fnZenFindOrgById = (userData) =>
  new Promise((resolve) => {
    (async () => {
      console.log("fnZenFindOrgById = ", userData);

      const { organization_id, Authorization, apiUrl } = userData;
      var config = {
        method: "get",
        url: `https://${apiUrl}/api/v2/organizations/${organization_id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Authorization}`,
        },
      };

      axios(config)
        .then(function (response) {
          resolve({ success: true, data: response.data });
          // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          resolve({ success: false, data: error });
          // console.log(error);
        });
    })();
  });

router.get("/", function (req, res, next) {
  (async () => {
    // 조회 기록 쌓는 것도 만들 것
    try {
      const { cmd, tel } = req.query;
      let response = "false";
      const ipccCenters = await fnCenterToIdList(req.query);

      if (ipccCenters && ipccCenters.length === 0) {
        return res.send("false");
      }

      const centerInfo = ipccCenters[0];

      const { json } = centerInfo;

      if (cmd === "isZendesk") {
        const parseJson = JSON.parse(json);

        if (parseJson && parseJson.zdSetting) {
          const { apiTokenKey: Authorization } = parseJson.zdSetting;
          if (!Authorization) {
            response = "false";
          } else {
            response = "true";
          }
        } else {
          response = "false";
        }
      } else if (cmd === "getZdNameAndOrgName") {
        const parseJson = JSON.parse(json);

        if (parseJson && parseJson.zdSetting) {
          const { apiTokenKey: Authorization, apiUrl } = parseJson.zdSetting;

          const resZenUserData = await fnZenFindUserByTel({
            tel,
            Authorization,
            apiUrl,
          });

          const { success = false, data } = resZenUserData;

          if (success) {
            const { results } = data;

            // console.log("results = ", results);
            if (results && results.length > 0) {
              let tmpResText = "";
              const tmpUser = results[0];
              const { name, organization_id } = tmpUser;
              tmpResText = name;

              if (organization_id) {
                const resZenOrgData = await fnZenFindOrgById({
                  organization_id,
                  Authorization,
                  apiUrl,
                });
                console.log("resZenOrgData = ", resZenOrgData);
                const { success: orgSuccess = false, data: orgData = null } =
                  resZenOrgData;

                if (orgSuccess) {
                  const { organization } = orgData;
                  const { name: orgName } = organization;

                  tmpResText += `(${orgName})`;
                }
                response = `true,${tmpResText}`;
              } else {
                response = `true,${tmpResText}`;
              }
            }
          } else {
            response = "false,";
          }
        } else {
          response = "false,";
        }
      } else {
        response = "false";
      }

      res.send(response);
    } catch (error) {
      console.log("error = ", error);
      res.send("false");
    }
  })();
});

router.post("/", function (req, res, next) {
  (async () => {
    // 조회 기록 쌓는 것도 만들 것
    try {
      res.json("server api error!!");
    } catch (error) {
      console.log("error = ", error);
      res.json("server api error!!");
    }
  })();
});

module.exports = router;
