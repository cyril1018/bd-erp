const sqlite3 = require('sqlite3').verbose();
const path = require('path')

const {app} = require('electron');
const dbPath = path.resolve(app.getPath("userData"), 'database.db');
// 创建数据库连接
//const dbPath = path.join(__dirname, '../database.db');
console.log(dbPath)
const db = new sqlite3.Database(dbPath);
exports.db = db;