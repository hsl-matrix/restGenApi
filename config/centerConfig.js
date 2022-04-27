const centerData = {
  genezip: {
    center_id: 8,
    selectQuery:
      "user_id, sippeer_id, concat(DATE_FORMAT(created_at,'/%Y%m%d/%H/'), uid) uid, tel, tm_conn, DATE_FORMAT(answered_at,'%Y-%m-%d %H:%i:%S') answered_at, call_type",
    whereRawQuery: "is_ans = 1",
  },
};

module.exports = { centerData };
