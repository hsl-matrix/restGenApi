var express = require("express");
var moment = require("moment");
var router = express.Router();
var verifyToken = require("../lib/verifyToken");

var db = require("../lib/db");
var cron = require("node-cron");
var axios = require("axios");
const https = require("https");

// 레디스 설정
const redis = require("redis");
const client = redis.createClient();

client.on("error", function (error) {
  console.error(error);
});

const {
  fnGetCallList,
  fnCenterList,
  fnUserList,
  fnGroupList,
  fnTeamList,
  fnDnisList,
  fnQueueList,
  fnCallBackList,
  fnGetBrandList,
  fnGetIvrTagList,
} = require("../lib/dbIpcc");
const {
  fnIpccRtplApi,
  fnConvMetaData,
  fnIpccRtplListApi,
} = require("../lib/apiIpcc");
const { fnSendSmsApi } = require("../lib/apiSms");
const { defMsg, convDateFormat } = require("../lib/util");

let knex = db.knex;
const { centerData } = require("../config/centerConfig");

const listCallLogs = (params) =>
  new Promise((resolve) => {
    const today = moment().format("YYYYMMDD");
    const { startDate = today, endDate = today, center } = params;
    const { center_id, selectQuery, whereRawQuery } = centerData[center] || {};
    console.log("centerData  = ", params);

    const createdAtStart = moment(convDateFormat(startDate))
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const createdAtEnd = moment(convDateFormat(endDate))
      .endOf("day")
      .format("YYYY-MM-DD HH:mm:ss");

    const createAt = [createdAtStart, createdAtEnd];
    let qq = knex("call_logs");

    if (createAt) qq.whereBetween("created_at", createAt);
    if (center_id) {
      qq.where("center_id", center_id);
    } else {
      qq.where("center_id", 99999);
    }
    if (selectQuery) qq.select(knex.raw(selectQuery));
    //if (selectQuery) qq.select(knex.raw("uid"));
    if (whereRawQuery) qq.whereRaw(whereRawQuery);
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

const fnGenezipApi = (params) =>
  new Promise((resolve) => {
    //center=genezip&startDate=20210419&endDate=20210419

    console.log(" fnGenezipApi================================== ", params);
    var data = {
      data: {
        ctiList: params,
      },
    };

    var config = {
      method: "post",
      //url: "https://devwww.geniezip.com/interf/addApiCti.do",
      url: "https://www.geniezip.com/interf/addApiCti.do",
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        console.log("fnGenezipApi response = ", response.data);
        resolve(response);
      })
      .catch(function (error) {
        console.log("fnGenezipApi response = ", error);
        resolve(error);
      });
  });

cron.schedule("0 58 23 * * *", async () => {
  console.log("fnGenezipApi cron  ");
  const resList = await listCallLogs({ center: "genezip" });
  const listCnt = resList.length;
  console.log("fnGenezipApi1 = ", listCnt);
  let resApi = null;
  if (listCnt > 0) {
    resApi = await fnGenezipApi(resList);
  }

  console.log("fnGenezipApi2 = ", resApi);
});

router.get("/", verifyToken, function (req, res, next) {
  (async () => {
    // 조회 기록 쌓는 것도 만들 것
    try {
      const { center } = req.query;
      const today = moment().format("YYYYMMDD");
      const { cmd, startDate = today, endDate = today } = req.query;

      const tmpStartDt = moment(convDateFormat(startDate));
      const tmpEndDt = moment(convDateFormat(endDate));

      const checkSchDateDiff = tmpEndDt.diff(tmpStartDt, "days") + 1;

      // 7일 이내만 가능하도록 설정
      if (checkSchDateDiff > 7 && cmd !== "rtplList") {
        return res.json({ ...defMsg, msg: "검색은 7일이내만 가능합니다." });
      }
      const ipccSelKnex = await getSelDbCenters(center || 0);
      knex = db[ipccSelKnex];

      const centerList = await fnCenterList({ center }, knex);

      if (centerList.length === 0) {
        return res.json({
          ...defMsg,
          msg: "해당하는 센터가 없습니다.",
        });
      }

      const centerInfo = centerList[0];

      const { id: center_id } = centerInfo;

      const userList = await fnUserList({ center_id }, knex);
      const groupList = await fnGroupList({ center_id }, knex);
      const teamList = await fnTeamList({ center_id }, knex);
      const dnisList = await fnDnisList({ center_id }, knex);
      const queueList = await fnQueueList({ center_id }, knex);

      let response = null;
      //console.log(" userList = ", userList);
      if (cmd === "callList") {
        const tmpCallList = await fnGetCallList(
          { ...req.query, userList },
          knex
        );

        response = {
          ...tmpCallList,
          extra: {
            groups: groupList,
            teams: teamList,
            users: userList,
            dnis: dnisList,
            queues: queueList,
          },
        };
      } else if (cmd === "lastCallList") {
        const tmpCallList = await fnGetCallList(
          { ...req.query, userList },
          knex
        );

        response = {
          ...tmpCallList,
        };
      } else if (cmd === "rtplList") {
        const rtplListRes = await fnIpccRtplListApi({ center_id }, knex);
        response = {
          ...defMsg,
          data: rtplListRes,
          dataCnt: rtplListRes.length,
          result: true,
        };
        //response = rtplListRes;
      } else if (cmd === "rtpl") {
        const params = { ...req.query, center_id };
        const rtplRes = await fnIpccRtplApi(params, knex);

        const { data, meta, users = [] } = rtplRes;
        let extra = {};

        extra["meta"] = await fnConvMetaData(meta, knex);
        extra["users"] = rtplRes && rtplRes.users ? [...users] : [];

        //console.log("rtplRes = ", convRes);
        response = {
          ...defMsg,
          data,
          dataCnt: data.length,
          extra,
          result: true,
        };
      } else if (cmd === "cbkList") {
        const cbkListRes = await fnCallBackList(
          { ...req.query, center_id },
          knex
        );
        response = {
          ...defMsg,
          data: cbkListRes,
          dataCnt: cbkListRes.length,
          result: true,
        };
        //response = rtplListRes;
      } else if (cmd === "userList") {
        response = {
          ...defMsg,
          data: userList,
          dataCnt: userList.length,
          result: true,
        };
        //response = rtplListRes;
      } else {
        response = { ...defMsg, msg: "잘못된 요청입니다." };
      }

      res.json({
        ...response,
      });
    } catch (error) {
      console.log("error = ", error);
      res.json("server api error!!");
    }
  })();
});

const getSmsTime = (params) =>
  new Promise((resolve) => {
    const { cutoTel, callback, contents } = params;
    client.get(`${cutoTel}_${callback}`, function (err, reply) {
      if (err) return resolve(false);
      try {
        const {
          contents: oldContents,
          cutoTel: oldCutoTel,
          time: oldTime,
        } = JSON.parse(reply.toString());
        let diffTime = 60;
        const tt1 = new Date(oldTime);
        const tt2 = new Date();
        diffTime = (tt2 - tt1) / 1000;
        if (
          cutoTel === oldCutoTel &&
          contents === oldContents &&
          diffTime < 60
        ) {
          console.log("diffTime false= ", diffTime);
          resolve(false);
        } else {
          console.log("diffTime true= ", diffTime);
          resolve(true);
        }
      } catch (error) {
        resolve(true);
      }
    });
  });

let getSelDbCenters = (centerCode) =>
  new Promise((resolve) => {
    var selSql = `centerid, ipcc_addr, CONCAT('knex', IFNULL(SUBSTRING_INDEX(ipcc_addr,'.', -1),'')) knexDiv`;
    var qq = knex("centers_info")
      .select(knex.raw(selSql))
      .whereRaw(`centerid = '${centerCode}'`)
      .limit(1);

    var rtnRows = qq.then(
      (rows) => {
        console.log("rtnRows!!", JSON.stringify(rows));
        let rtnKnex = "knex";
        if (rows.length > 0) {
          rtnKnex = rows[0].knexDiv;
        }
        return Promise.resolve(rtnKnex);
      },
      (err) => {
        console.log("GROUP GET ERROR!!", err);
        return Promise.resolve("knex");
      }
    );

    resolve(rtnRows);
  });

router.post("/", async function (req, res, next) {
  (async () => {
    // 조회 기록 쌓는 것도 만들 것
    try {
      console.log("req.body = ", req.body);
      const { cmd, code: center } = req.body;
      let response = null;

      const ipccSelKnex = await getSelDbCenters(center || 0);
      knex = db[ipccSelKnex];
      if (cmd === "sendSms") {
        const { cutoTel, callback } = req.body;
        let diffTime = await getSmsTime(req.body);

        if (diffTime) {
          client.set(
            `${cutoTel}_${callback}`,
            JSON.stringify({ ...req.body, time: new Date() }),
            redis.print
          );

          const resApi = await fnSendSmsApi(req.body);
          console.log("resApi = ", resApi);
          response = {
            ...defMsg,
            data: resApi,
            msg: "정상 처리 되었습니다.",
            result: true,
          };
        } else {
          response = {
            ...defMsg,
            msg: "중복 발생으로 차단하였습니다.",
          };
        }
      } else if (cmd === "getCenterInfo") {
        const { code: center } = req.body;
        if (!center)
          return { ...defMsg, msg: "센터 아이디를 찾을 수 없습니다." };

        const resApi = await fnCenterList({ center }, knex);

        const { json } = resApi[0] || {};
        const parseData = (json && JSON.parse(json)) || null;

        if (parseData) {
          const { zdSetting } = parseData || {};

          const { center } = zdSetting;
          response = {
            ...defMsg,
            data: center,
            msg: "정상 처리 되었습니다.",
          };
        } else {
          response = {
            ...defMsg,
            msg: "잘못된 요청입니다.",
          };
        }
      } else if (cmd === "getBrandList") {
        const { code: center } = req.body;
        if (!center)
          return { ...defMsg, msg: "센터 아이디를 찾을 수 없습니다." };

        const resApi = await fnCenterList({ center }, knex);

        const { id = null } = resApi[0] || {};

        if (id) {
          const brandList = await fnGetBrandList({ center_id: id }, knex);

          response = {
            ...defMsg,
            data: brandList,
            msg: "정상 처리 되었습니다.",
          };
        } else {
          response = {
            ...defMsg,
            msg: "잘못된 요청입니다.",
          };
        }
      } else if (cmd === "getIvrTagList") {
        const { code: center } = req.body;
        if (!center)
          return { ...defMsg, msg: "센터 아이디를 찾을 수 없습니다." };

        const resApi = await fnCenterList({ center }, knex);

        const { id = null } = resApi[0] || {};

        if (id) {
          const tagList = await fnGetIvrTagList({ center_id: id }, knex);

          response = {
            ...defMsg,
            data: tagList,
            msg: "정상 처리 되었습니다.",
          };
        } else {
          response = {
            ...defMsg,
            msg: "잘못된 요청입니다.",
          };
        }
      } else {
        response = { ...defMsg, msg: "잘못된 요청입니다." };
      }

      res.json({
        ...response,
      });
    } catch (error) {
      console.log("error = ", error);
      res.json("server api error!!");
    }
  })();
});

module.exports = router;
