const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const sqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  timezone: "Z", 
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

module.exports = sqlPool.promise();

// async function deleteMultipleItems(req, res) {
//   try {
//     const { id } = req.params;
//     const ids = id.split(",");
//     let statement = "?";
//     for (let i = 1; i < ids.length; i++) statement += ",?";
//     await sqlPool.query(
//       `DELETE FROM productcategories WHERE productId in (${statement})`,
//       [...ids.map((i) => parseInt(i))]
//     );
//     const [result] = await sqlPool.query(
//       `DELETE FROM products WHERE id in (${statement})`,
//       [...ids.map((i) => parseInt(i))]
//     );
//     return { data: result };
//   } catch (error) {
//     console.log(error);
//     return { state: error };
//   }
// }
