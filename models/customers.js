var dbmgr = require('./dbmgr');
var db = dbmgr.db;

exports.getAll = () => {
  return new Promise((resolve, reject) => {
    dbmgr.db.all("SELECT * FROM customers", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

exports.getByKeyword = (key) => {

  if (key === '')
    return exports.getAll();
  return new Promise((resolve, reject) => {
    dbmgr.db.all("SELECT * FROM customers WHERE name LIKE '%" + key + "%' OR tel LIKE '%" + key + "%' --OR addr LIKE '%" + key + "%'", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

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

const add = async function (data) {
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


    let tel = '';
    data.tel.filter((x) => x.val).forEach(element => {
      tel = tel ? tel + ';' + element.val : element.val;
    });;
    let nowStr = getNowStr();

    // 執行插入操作
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO customers(no, name, addr, tel, contact, createDate) VALUES(?, ?, ?, ?, ?, ?)`, [data.no, data.name, data.addr, tel, data.contact, nowStr], function (err) {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });

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

    let msg = err.message;
    if (err.message == 'SQLITE_CONSTRAINT: UNIQUE constraint failed: customers.no') {
      msg = '此編號已使用';
    }
    return {
      isSuccess: false,
      msg: msg
    }
    console.error('Error:', err.message);
  }
};

const update = async function (data) {
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


    let tel = '';
    data.tel.filter((x) => x.val).forEach(element => {
      tel = tel ? tel + ';' + element.val : element.val;
    });;
    let nowStr = getNowStr();

    // 執行修改操作
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE customers
        SET name = ?
          , addr = ?
          , tel = ?
          , contact = ?
          , updateDate = ?
        WHERE id = ?`, [data.name, data.addr, tel, data.contact, nowStr, data.id], function (err) {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });

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
}

exports.delete = async function (id) {
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

    // 執行刪除操作
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM customers WHERE id = ?`, [id], function (err) {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });

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
}

exports.save = async function (data) {
  if (data.id == 0) {
    return await add(data);
  }
  else {
    return await update(data);
  }
}