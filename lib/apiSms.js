var axios = require("axios");

const fnSendSmsApi = (params) =>
  new Promise((resolve) => {
    console.log(params);
    try {
      const {
        cmd,
        callback = "16684108",
        cutoTel,
        contents = "테스트입니다.",
      } = params;

      const reg = /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/ ]/gim;
      const tel = cutoTel.replace(reg, "");

      var data = JSON.stringify({
        cmd: cmd,
        title: "",
        contents,
        callback,
        cutoTel: tel,
      });

      let gUrl = "http://localhost:3300/api";

      var config = {
        method: "post",
        url: gUrl,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          console.log("fnSendSmsApi response = ", response.data);
          resolve(response.data);
        })
        .catch(function (error) {
          console.log("fnSendSmsApi response = ", error);
          resolve(error);
        });
    } catch (error) {
      resolve(error);
    }
  });

module.exports = { fnSendSmsApi };
