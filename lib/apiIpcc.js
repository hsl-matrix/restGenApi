var axios = require("axios");
const https = require("https");

const fnIpccRtplApi = (params, knex) =>
  new Promise((resolve) => {
    //center=genezip&startDate=20210419&endDate=20210419
    try {
      console.log("params = ", params);

      const {
        rtpl_id,
        center_id,
        agtop = "sum",
        dayop = "daily",
        hrop = "sum",
        startDate: fday,
        endDate: tday,
        ftm = "090000",
        ttm = "180000",
      } = params;
      let gUrl = "https://zdipcc01.matrixcloud.co.kr/stat_centers";
      gUrl += "?cmd=getJson&format=json&timeout=30000";
      gUrl += `&rtpl_id=${rtpl_id}&fday=${fday}&tday=${tday}&ftm=${ftm}&ttm=${ttm}&center_id=${center_id}`;
      gUrl += `&agtop=${agtop}&dayop=${dayop}&hrop=${hrop}`;

      console.log("gUrl = ", gUrl);
      var config = {
        method: "get",
        //url: "https://devwww.geniezip.com/interf/addApiCti.do",
        url: gUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then(function (response) {
          //console.log("fnIpccRtplApi response = ", response.data);
          resolve(response.data);
        })
        .catch(function (error) {
          //console.log("fnIpccRtplApi response = ", error);
          resolve(error);
        });
    } catch (error) {
      resolve(error);
    }
  });

const fnIpccRtplListApi = (params, knex) =>
  new Promise((resolve) => {
    //http://zdipcc01.matrixcloud.co.kr/rtpls?_dc=1632357966517&format=json&s%5Bactive%5D=1&s%5Bcenter_id%5D=9
    try {
      const { center_id } = params;

      let gUrl =
        "https://zdipcc01.matrixcloud.co.kr/rtpls?format=json&s%5Bactive%5D=1";
      gUrl += `&s%5Bcenter_id%5D=${center_id}`;
      console.log("gUrl = ", gUrl);
      var config = {
        method: "get",
        url: gUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then(function (response) {
          const { rtpls } = response.data;

          let tmpRtplList = [];

          rtpls.forEach((element) => {
            const { id, rpt_title } = element;
            tmpRtplList.push({ id, rpt_title });
          });

          //console.log("fnIpccRtplApi response = ", response.data);
          resolve(tmpRtplList);
        })
        .catch(function (error) {
          //console.log("fnIpccRtplApi response = ", error);
          resolve(error);
        });
    } catch (error) {
      resolve(error);
    }
  });

const fnConvMetaData = (params, knex) =>
  new Promise((resolve) => {
    const { title, columns } = params;

    let tmpColumns = [];

    columns.forEach((element) => {
      const { gtitle, name, hdr, typ } = element;
      tmpColumns.push({ gtitle, name, hdr, typ });
    });

    const rtnMetaData = { title, columns: tmpColumns };

    resolve(rtnMetaData);
  });

module.exports = { fnIpccRtplApi, fnConvMetaData, fnIpccRtplListApi };
