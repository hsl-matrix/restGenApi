var db = require("../lib/db");
var moment = require("moment");
var knex = db.knex;
const { defMsg, convDateFormat } = require("../lib/util");

const listCallLogs = (params, knex) =>
  new Promise((resolve) => {
    const today = moment().format("YYYYMMDD");
    const {
      startDate = today,
      endDate = today,
      center_id,
      userid = null,
      userList,
      uid = null,
    } = params;
    selectQuery = `uid, seq, call_type, group_id, team_id, user_id, sippeer_id,
      dnis, callerid,tel,queue_id,tm_que,tm_ring,tm_conn,
      DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S') created_at, DATE_FORMAT(queueed_at,'%Y-%m-%d %H:%i:%S') queueed_at,
      DATE_FORMAT(ring_at,'%Y-%m-%d %H:%i:%S') ring_at, DATE_FORMAT(answered_at,'%Y-%m-%d %H:%i:%S') answered_at, call_type,
      DATE_FORMAT(updated_at,'%Y-%m-%d %H:%i:%S') updated_at
      `;
    console.log("centerData  = ", params);

    const createdAtStart = moment(convDateFormat(startDate))
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const createdAtEnd = moment(convDateFormat(endDate))
      .endOf("day")
      .format("YYYY-MM-DD HH:mm:ss");

    const createAt = [createdAtStart, createdAtEnd];
    let qq = knex("call_logs");

    if (createAt && !uid) qq.whereBetween("created_at", createAt);
    if (center_id) {
      qq.where("center_id", center_id);
    } else {
      qq.where("center_id", 99999);
    }

    if (userid) {
      const findUser = userList.find((usr) => usr.userid === userid);
      if (findUser && findUser.user_id) {
        qq.where("user_id", findUser.user_id);
        qq.orderBy("created_at", "desc");
        qq.limit(10);
      } else {
        qq.where("user_id", 99999);
      }
    }

    if (uid) {
      qq.where("uid", uid);
    }

    if (selectQuery) qq.select(knex.raw(selectQuery));
    //if (selectQuery) qq.select(knex.raw("uid"));
    //if (whereRawQuery) qq.whereRaw(whereRawQuery);
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

const fnUserList = (params, knex) =>
  new Promise((resolve) => {
    const { center_id } = params;
    selectQuery = `center_id, group_id, team_id, user_id, sippeer_id, userid, name, mode, state`;

    let qq = knex("users");

    if (center_id) {
      qq.where("center_id", center_id);
    } else {
      qq.where("center_id", 99999);
    }
    if (selectQuery) qq.select(knex.raw(selectQuery));

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

const fnCenterList = (params, knexSel) =>
  new Promise((resolve) => {
    const { center } = params;
    console.log("center = ", center);
    let qq = knexSel("centers").where("userid", center);
    qq.limit(1);

    var rtnRows = qq.then(
      (rows) => {
        console.log(qq.toSQL());
        return Promise.resolve(rows);
      },
      (err) => {
        console.log(qq.toSQL());
        //console.log("Mongo ERROR!!", err, qq.toSQL());
        return Promise.resolve([]);
      }
    );

    resolve(rtnRows);
  });

const fnCenterToIdList = (params) =>
  new Promise((resolve) => {
    const { center_id } = params;
    console.log("center = ", center_id);
    let qq = knex("centers").select("id", "json").where("id", center_id);
    qq.limit(1);

    var rtnRows = qq.then(
      (rows) => {
        console.log(qq.toSQL());
        return Promise.resolve(rows);
      },
      (err) => {
        console.log(qq.toSQL());
        //console.log("Mongo ERROR!!", err, qq.toSQL());
        return Promise.resolve([]);
      }
    );

    resolve(rtnRows);
  });

const fnGroupList = (params, knex) =>
  new Promise((resolve) => {
    const { center_id } = params;
    selectQuery = `id, memo as name`;

    let qq = knex("groups");

    if (center_id) {
      qq.where("center_id", center_id);
    } else {
      qq.where("center_id", 99999);
    }
    if (selectQuery) qq.select(knex.raw(selectQuery));

    var rtnRows = qq.then(
      (rows) => {
        ///console.log(qq.toSQL());
        return Promise.resolve(rows);
      },
      (err) => {
        //console.log("Mongo ERROR!!", err, qq.toSQL());
        return Promise.resolve([]);
      }
    );

    resolve(rtnRows);
  });

const fnTeamList = (params, knex) =>
  new Promise((resolve) => {
    const { center_id } = params;
    selectQuery = `id, memo as name, group_id`;

    let qq = knex("teams");

    if (center_id) {
      qq.where("center_id", center_id);
    } else {
      qq.where("center_id", 99999);
    }
    if (selectQuery) qq.select(knex.raw(selectQuery));

    var rtnRows = qq.then(
      (rows) => {
        ///console.log(qq.toSQL());
        return Promise.resolve(rows);
      },
      (err) => {
        //console.log("Mongo ERROR!!", err, qq.toSQL());
        return Promise.resolve([]);
      }
    );

    resolve(rtnRows);
  });

const fnQueueList = (params, knex) =>
  new Promise((resolve) => {
    const { center_id } = params;
    selectQuery = `id, memo as name`;

    let qq = knex("queues");

    if (center_id) {
      qq.where("center_id", center_id);
    } else {
      qq.where("center_id", 99999);
    }
    if (selectQuery) qq.select(knex.raw(selectQuery));

    var rtnRows = qq.then(
      (rows) => {
        ///console.log(qq.toSQL());
        return Promise.resolve(rows);
      },
      (err) => {
        //console.log("Mongo ERROR!!", err, qq.toSQL());
        return Promise.resolve([]);
      }
    );

    resolve(rtnRows);
  });

const fnDnisList = (params, knex) =>
  new Promise((resolve) => {
    const { center_id } = params;
    selectQuery = `dnis, memo as name`;

    let qq = knex("dnis");

    if (center_id) {
      qq.where("center_id", center_id);
    } else {
      qq.where("center_id", 99999);
    }
    if (selectQuery) qq.select(knex.raw(selectQuery));

    var rtnRows = qq.then(
      (rows) => {
        ///console.log(qq.toSQL());
        return Promise.resolve(rows);
      },
      (err) => {
        //console.log("Mongo ERROR!!", err, qq.toSQL());
        return Promise.resolve([]);
      }
    );

    resolve(rtnRows);
  });

const fnCallBackList = (params, knex) =>
  new Promise((resolve) => {
    const today = moment().format("YYYYMMDD");
    const { center_id, startDate = today, endDate = today } = params;
    selectQuery = `
      id, ani, cid, state,
      DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S') created_at, 
      DATE_FORMAT(updated_at,'%Y-%m-%d %H:%i:%S') updated_at
    `;

    const createdAtStart = moment(convDateFormat(startDate))
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const createdAtEnd = moment(convDateFormat(endDate))
      .endOf("day")
      .format("YYYY-MM-DD HH:mm:ss");

    const createAt = [createdAtStart, createdAtEnd];
    let qq = knex("callbacks");

    if (createAt) qq.whereBetween("created_at", createAt);

    if (center_id) {
      qq.where("center_id", center_id);
    } else {
      qq.where("center_id", 99999);
    }
    if (selectQuery) qq.select(knex.raw(selectQuery));

    var rtnRows = qq.then(
      (rows) => {
        ///console.log(qq.toSQL());
        return Promise.resolve(rows);
      },
      (err) => {
        //console.log("Mongo ERROR!!", err, qq.toSQL());
        return Promise.resolve([]);
      }
    );

    resolve(rtnRows);
  });

const fnGetCallList = (params, knex) =>
  new Promise((resolve) => {
    try {
      (async () => {
        const centerList = await fnCenterList(params, knex);

        if (centerList.length === 0) {
          return resolve({
            ...defMsg,
            msg: "해당하는 센터가 없습니다.",
          });
        }

        const centerInfo = centerList[0];

        const { id: center_id } = centerInfo;

        console.log("centerList = ", center_id);

        const resList = await listCallLogs({ ...params, center_id }, knex);

        const dataCnt = resList.length;

        resolve({
          ...defMsg,
          result: true,
          msg: "정상적으로 조회 되었습니다.",
          dataCnt: dataCnt,
          data: resList,
        });
      })();
    } catch (error) {
      console.log("error = ", error);
      resolve({
        ...defMsg,
        msg: "에러가 발생하였습니다. 관리자에 문의 바랍니다.",
      });
    }
  });

const fnGetBrandList = (params, knexSel) =>
  new Promise((resolve) => {
    const { center_id } = params;
    selectQuery = `dnis, IFNULL(JSON_VALUE(jsonData, '$.brand_id'),'') as brand_id`;

    let qq = knexSel("dnis");

    if (center_id) {
      qq.where("center_id", center_id);
    } else {
      qq.where("center_id", 99999);
    }
    if (selectQuery) qq.select(knex.raw(selectQuery));

    var rtnRows = qq.then(
      (rows) => {
        ///console.log(qq.toSQL());
        return Promise.resolve(rows);
      },
      (err) => {
        //console.log("Mongo ERROR!!", err, qq.toSQL());
        return Promise.resolve([]);
      }
    );

    resolve(rtnRows);
  });

const fnGetIvrTagList = (params, knexSel) =>
  new Promise((resolve) => {
    const { center_id } = params;
    selectQuery = `id, name, memo`;

    let qq = knexSel("ivr_tags");

    if (center_id) {
      qq.where("center_id", center_id);
    } else {
      qq.where("center_id", 99999);
    }
    if (selectQuery) qq.select(knex.raw(selectQuery));

    var rtnRows = qq.then(
      (rows) => {
        ///console.log(qq.toSQL());
        return Promise.resolve(rows);
      },
      (err) => {
        //console.log("Mongo ERROR!!", err, qq.toSQL());
        return Promise.resolve([]);
      }
    );

    resolve(rtnRows);
  });

module.exports = {
  fnGetCallList,
  fnCenterList,
  fnUserList,
  fnGroupList,
  fnTeamList,
  fnDnisList,
  fnQueueList,
  fnCallBackList,
  fnCenterToIdList,
  fnGetBrandList,
  fnGetIvrTagList,
};
