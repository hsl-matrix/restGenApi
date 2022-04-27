let defMsg = {
  dataCnt: 0,
  data: [],
  result: false,
  msg: "정상적으로 조회되었습니다.",
};

const convDateFormat = (dt) =>
  [dt.slice(0, 4), "-", dt.slice(4, 6), "-", dt.slice(6, 8)].join("");

module.exports = { defMsg, convDateFormat };
