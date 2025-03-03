const db = require("../config/mysql_database"); // Assuming you're using MySQL pool

exports.UserDataModel = {
  async create(userData) {
    const query = `
      INSERT INTO user_data (user_id, upi_id, referral_by, referral_code, parent_id, leftchild_id, rightchild_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await db.query(query, [
      userData.user_id,
      userData.upi_id,
      userData.referral_by,
      userData.referral_code,
      userData.parent_id,
      userData.leftchild_id,
      userData.rightchild_id,
    ]);
    return result;
  },

  async updateData(table, data, condition) {
    const query = `UPDATE ${table} SET ? WHERE ?`;
    const result = await db.query(query, [data, condition]);
    return result;
  },
};

// QueryModel for saving user data
exports.QueryModel = {
  async saveData(table, data) {
    const query = `INSERT INTO ${table} SET ?`;
    const result = await db.query(query, data);
    return result;
  },
};
