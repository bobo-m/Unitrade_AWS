const db = require("../config/mysql_database");
const ErrorHandler = require("../utils/errorHandler");

exports.saveData = async (table_name, postData) => {
  try {
    const insertData = await db.query(
      `INSERT INTO ${table_name} SET ?`,
      postData
    );

    // Get the ID of the last inserted row
    const lastInsertId = insertData[0].insertId;

    const record = await db.query(`SELECT * FROM ${table_name} WHERE id = ?`, [
      lastInsertId,
    ]);
    return record[0][0];
  } catch (error) {
    throw new ErrorHandler(`${error.message}`, 400);
  }
};

exports.updateData = async (table_name, data, condition) => {
  try {
    await db.query(`UPDATE ${table_name} SET ? WHERE ?`, [data, condition]);
  } catch (error) {
    throw new ErrorHandler(`${error.message}`, 400);
  }
};

exports.findByIdAndUpdateData = async (table_name, id, updateData) => {
  try {
    const record = await db.query(`SELECT id FROM ${table_name} WHERE id = ?`, [
      id,
    ]);
    if (!record[0][0]) throw new ErrorHandler("Record not found", 400);

    await db.query(`UPDATE ${table_name} SET ? WHERE id = ?`, [updateData, id]);

    const updatedRecord = await db.query(
      `SELECT * FROM ${table_name} WHERE id = ?`,
      [id]
    );
    return updatedRecord[0][0];
  } catch (error) {
    throw new ErrorHandler(`${error.message}`, 400);
  }
};

exports.findByIdAndDelete = async (table_name, id) => {
  try {
    const record = await db.query(`SELECT id FROM ${table_name} WHERE id = ?`, [
      id,
    ]);
    if (!record[0][0]) throw new ErrorHandler("Record not found", 400);

    await db.query(`DELETE FROM ${table_name} WHERE id = ?`, [id]);
    return record[0][0];
  } catch (error) {
    throw new ErrorHandler(`${error.message}`, 400);
  }
};

exports.findById = async (table_name, id) => {
  try {
    const record = await db.query(`SELECT * FROM ${table_name} WHERE id = ?`, [
      id,
    ]);
    if (!record[0][0]) throw new ErrorHandler("Record not found", 400);

    return record[0][0];
  } catch (error) {
    throw new ErrorHandler(`${error.message}`, 400);
  }
};
exports.findCompanyById = async (company_id) => {
  try {
    // Ensure company_id is valid
    if (!company_id) {
      throw new ErrorHandler("Company ID is required", 400);
    }

    // Debugging: Log company_id and check the query result
    console.log("Searching for company with ID:", company_id);

    // Execute the SQL query directly
    const result = await db.query(
      `SELECT * FROM company_data WHERE company_id = ?`,
      [company_id]
    );

    // Debugging: Log the result to check if we are getting data
    console.log("Company Data Retrieved:", result[0]);

    // If result is empty, handle the error
    if (result[0].length === 0) {
      throw new ErrorHandler("Company not found", 404);
    }

    // Return the company data (the first row)
    return result[0][0]; // Return the first row from the result
  } catch (error) {
    console.error("Error finding company:", error.message); // Log the error for debugging
    throw new ErrorHandler(`Error finding company: ${error.message}`, 400);
  }
};

exports.findBySpecific = async (table_name, field_name, field_value) => {
  try {
    const record = await db.query(
      `SELECT * FROM ${table_name} WHERE ${field_name} = ?`,
      [field_value]
    );
    if (!record[0][0]) throw new ErrorHandler("Record not found", 400);

    return record[0][0];
  } catch (error) {
    throw new ErrorHandler(`${error.message}`, 400);
  }
};

exports.getData = async (table_name, condition, fields = ["*"]) => {
  try {
    // Join fields into a string
    const fieldsString = fields.join(", ");
    // Prepare the condition string
    const conditionString = Object.keys(condition)
      .map((key) => `${key} = ?`)
      .join(" AND ");

    const values = Object.values(condition);
    const query = `SELECT ${fieldsString} FROM ${table_name} WHERE ${conditionString}`;

    const records = await db.query(query, values);
    return records[0]; // Return the array of records
  } catch (error) {
    throw new ErrorHandler(`${error.message}`, 400);
  }
};
