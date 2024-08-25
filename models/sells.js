var dbmgr = require('./dbmgr');
var db = dbmgr.db;

exports.get = (qry) => {
  return new Promise((resolve, reject) => {
    let whrs = 'WHERE 1 = 1 ';
    if (qry) {
      if (qry.customerId) {
        whrs += ' AND c.id = ' + qry.customerId;
      }
      else if (qry.customerNoName) {
        whrs += ` AND ( c.no LIKE '%${qry.customerNoName}%' OR c.name LIKE '%${qry.customerNoName}%')`
      }

      if (qry.dateBegin) {
        whrs += ` AND m.sellDate >= '${qry.dateBegin.replaceAll('-', '/')}'`
      }
      if (qry.dateEnd) {
        whrs += ` AND m.sellDate <= '${qry.dateEnd.replaceAll('-', '/')}'`
      }
    }

    let sql = `
    SELECT m.id, m.sellDate, m.no, c.id AS customerId, c.no AS customerNo, c.name AS customerName, c.tel, m.total,
    '[' || group_concat('{"id":"' || si.id || '","no":"' || si.itemNo || '","name":"' || si.itemName || '","price":' || si.price || ',"qty":' || si.qty || ',"total":' || si.total || '}', ',') || ']' AS items
   FROM sells m
   LEFT JOIN customers c ON m.customerId = c.id
   LEFT JOIN sellItems si ON m.id = si.mId
   ${whrs}
   GROUP BY m.id, m.sellDate, c.no, c.name, c.tel, m.total
   ORDER BY m.no DESC;
          `;
    dbmgr.db.all(sql
      , (err, rows) => {
        if (err) {
          reject(err);
        } else {

          rows.forEach((el) => el.items = JSON.parse(el.items));
          resolve(rows);
        }
      });
  });
}
exports.getById = function (id) {
  return new Promise((resolve, reject) => {
    // 查詢 customers 與 sells 表格的連接資料
    const query1 = `
      SELECT c.*
      FROM customers c
      INNER JOIN sells s ON c.id = s.customerId
      WHERE s.id = ?
    `;

    // 查詢 sells 表格的特定資料
    const query2 = `
      SELECT *
      FROM sells
      WHERE id = ?
    `;

    // 查詢 sellitems 表格的特定資料
    const query3 = `
      SELECT *
      FROM sellitems
      WHERE mId = ?
    `;

    const result = {
      customer: {},
      sell: {},
      items: []
    };

    // 執行第一個查詢
    db.get(query1, [id], (err, row1) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        result.customer = row1;

        // 執行第二個查詢
        db.get(query2, [id], (err, row2) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            result.sell = row2;

            // 執行第三個查詢
            db.all(query3, [id], (err, rows3) => {
              if (err) {
                console.error(err);
                reject(err);
              } else {
                result.items = rows3;

                // 回傳結果
                resolve(result);
              }
            });
          }
        });
      }
    });
  });
};

const getNewNo = () => {
  let now = new Date();
  let y = now.getFullYear().toString().substring(2);
  let m = (now.getMonth() + 1).toString();
  let d = now.getDate().toString();

  if (m.length == 1) {
    m = '0' + m;
  }

  if (d.length == 1) {
    d = '0' + d;
  }

  const date = `${y}${m}${d}`;
  return new Promise((resolve, reject) => {
    db.get("SELECT MAX(CAST(SUBSTR(no, 2) AS INTEGER)) AS max_value FROM sells WHERE no LIKE 'O" + date + "%'", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      const maxNumber = row.max_value || 0; // 如果沒有符合條件的記錄，則將最大值設為0
      let newNumber = maxNumber + 1;
      if (newNumber == 1)
        newNumber = date + '001';

      const res = 'O' + newNumber;
      resolve(res);
    });
  });
}
exports.getNewNo = getNewNo;

const isDate = function (value) {
  return value instanceof Date && !isNaN(value);
}
const dateToStr = function (date) {
  if (!isDate(date)) {
    return date;
  }
  let y = date.getFullYear().toString();
  let m = (date.getMonth() + 1).toString();
  let d = date.getDate().toString();
  if (m.length == 1) {
    m = '0' + m;
  }
  if (d.length == 1) {
    d = '0' + d;
  }

  return `${y}-${m}-${d}`
}

exports.add = async function (data) {
  try {
    // 開始事務
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error('Error starting transaction:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    var m = (data.date.getMonth() + 1).toString();
    var d = data.date.getDate().toString();
    if (m.length == 1) {
      m = '0' + m;
    }
    if (d.length == 1) {
      d = '0' + d;
    }
    let sellDate = dateToStr(data.date).replaceAll('-', '/');
    let no = await getNewNo();
    let nowStr = getNowStr();

    // 執行第一個插入操作
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO sells(no, customerNo, customerId, sellDate, createDate, total) VALUES(?, ?, ?, ?, ?, ?)`, [no, data.customer.no, data.customer.id, sellDate, nowStr, data.total], function (err) {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve(this.lastID); // 獲取插入行的自增ID
        }
      });
    });

    // 獲取第一個插入行的自增ID
    const lastInsertedId = await new Promise((resolve, reject) => {
      db.get('SELECT last_insert_rowid() AS id', (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve(row.id);
        }
      });
    });

    // 執行其他插入操作
    for (const i of data.items) {
      await new Promise((resolve, reject) => {
        let sql = `INSERT INTO sellitems(mId, mNo, itemId, itemNo, itemName, qty, price, total, createDate) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [lastInsertedId, no, i.item.id, i.item.no, i.item.name, i.qty, i.price, i.total, nowStr], function (err) {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    // 提交事務
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing transaction:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    console.log('Transaction committed successfully.');
    return {
      isSuccess: true
    }
  } catch (err) {
    // 回滾事務
    await new Promise((resolve, reject) => {
      db.run('ROLLBACK', (rollbackErr) => {
        if (rollbackErr) {
          console.error('Error rolling back transaction:', rollbackErr.message);
          reject(rollbackErr);
        } else {
          resolve();
        }
      });
    });
    return {
      isSuccess: false,
      msg: err.message
    }
    console.error('Error:', err.message);
  }
};

const getNowStr = function () {
  let now = new Date();
  let m = (now.getMonth() + 1).toString();
  if (m.length == 1) {
    m = '0' + m;
  }
  let d = now.getDate().toString();
  if (d.length == 1) {
    d = '0' + d;
  }
  let h = now.getHours().toString();

  if (h.length == 1) {
    h = '0' + h;
  }

  let min = now.getMinutes().toString();
  if (min.length == 1) {
    min = '0' + min;
  }

  let s = now.getSeconds().toString();
  if (s.length == 1) {
    s = '0' + s;
  }
  return `${now.getFullYear()}-${m}-${d} ${h}:${min}:${s}`
}


exports.update = async function (data) {
  try {
    // 開始事務
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error('Error starting transaction:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    let nowStr = getNowStr();

    // 執行修改總價
    await new Promise((resolve, reject) => {
      db.run(`UPDATE sells SET total = ?, sellDate = ?, updateDate = ? WHERE id = ?`, [data.total, dateToStr(data.date).replaceAll('-', '/'), nowStr, data.id], function (err) {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // 執行插入操作
    for (const i of data.items.filter(x => x.id == 0)) {
      await new Promise((resolve, reject) => {
        let sql = `INSERT INTO sellitems(mId, mNo, itemId, itemNo, itemName, qty, price, total, createDate) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [data.id, data.no, i.item.id, i.item.no, i.item.name, i.qty, i.price, i.total, nowStr], function (err) {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    // 執行修改操作
    for (const i of data.items.filter(x => x.id != 0)) {
      await new Promise((resolve, reject) => {
        let sql = `UPDATE sellitems
        SET itemId = ?, itemNo = ?, itemName = ?, qty = ?, price = ?, total = ?, updateDate = ?
        WHERE mId = ? AND id = ? `;
        db.run(sql, [i.item.id, i.item.no, i.item.name, i.qty, i.price, i.total, nowStr, data.id, i.id], function (err) {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    // 執行刪除操作
    for (const i of data.delItemIds) {
      await new Promise((resolve, reject) => {
        let sql = `DELETE FROM sellitems WHERE mId = ? AND id = ?`;
        db.run(sql, [data.id, i], function (err) {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    // 提交事務
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing transaction:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    console.log('Transaction committed successfully.');
    return {
      isSuccess: true
    }
  } catch (err) {
    // 回滾事務
    await new Promise((resolve, reject) => {
      db.run('ROLLBACK', (rollbackErr) => {
        if (rollbackErr) {
          console.error('Error rolling back transaction:', rollbackErr.message);
          reject(rollbackErr);
        } else {
          resolve();
        }
      });
    });
    return {
      isSuccess: false,
      msg: err.message
    }
    console.error('Error:', err.message);
  }
};

exports.delete = function (id) {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.run('BEGIN TRANSACTION');
      db.run('DELETE FROM sells WHERE id = ?', [id], function (err) {
        if (err) {
          console.error(err.message);
          db.run('ROLLBACK');
          reject({
            isSuccess: false,
            msg: err.message
          });
        } else {
          db.run('DELETE FROM sellitems WHERE mId = ?', [id], function (err) {
            if (err) {
              console.error(err.message);
              db.run('ROLLBACK');
              reject({
                isSuccess: false,
                msg: err.message
              });
            } else {
              db.run('COMMIT');
              resolve({
                isSuccess: true
              });
            }
          });
        }
      });
    });
  });
};