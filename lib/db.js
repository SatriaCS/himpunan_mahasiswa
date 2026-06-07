import mysql from "mysql2/promise"

export default mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_portal_hima",
    dateStrings: true
})