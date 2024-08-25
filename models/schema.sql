CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    no TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price NUMERIC,
    createDate TEXT NOT NULL,
    updateDate TEXT
);
CREATE TABLE sells (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    no TEXT UNIQUE NOT NULL,
    customerNo TEXT NOT NULL,
    customerId INTEGER NOT NULL,
    sellDate TEXT NOT NULL,
    createDate TEXT NOT NULL,
    updateDate TEXT,
    total NUMERIC NOT NULL,
    FOREIGN KEY (customerId) REFERENCES customers (id)
);
CREATE TABLE sellitems (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    mId INTEGER REFERENCES sells (id) NOT NULL,
    mNo TEXT NOT NULL,
    itemId INTEGER REFERENCES items (id) NOT NULL,
    itemNo TEXT NOT NULL,
    itemName TEXT NOT NULL,
    qty INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    createDate TEXT NOT NULL,
    updateDate TEXT
);
CREATE TABLE items_his (
    hId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    hTimestamp TEXT NOT NULL,
    hAction TEXT,
    id INTEGER NOT NULL,
    no TEXT NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC,
    createDate TEXT NOT NULL,
    updateDate TEXT
);
CREATE TABLE sellitems_his (
    hId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    hTimestamp TEXT NOT NULL,
    hAction TEXT,
    id INTEGER NOT NULL,
    mId INTEGER NOT NULL,
    mNo TEXT NOT NULL,
    itemId INTEGER NOT NULL,
    itemNo TEXT NOT NULL,
    itemName TEXT NOT NULL,
    qty INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    createDate TEXT NOT NULL,
    updateDate TEXT
);
CREATE TABLE sells_his (
    hId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    hTimestamp TEXT NOT NULL,
    hAction TEXT,
    id INTEGER NOT NULL,
    no TEXT NOT NULL,
    customerNo TEXT NOT NULL,
    customerId INTEGER NOT NULL,
    sellDate TEXT NOT NULL,
    createDate TEXT NOT NULL,
    updateDate TEXT,
    total NUMERIC NOT NULL
);
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    addr TEXT,
    tel TEXT,
    contact TEXT,
    createDate TEXT NOT NULL,
    updateDate TEXT
);
CREATE TABLE customers_his (
    hId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    hTimestamp TEXT NOT NULL,
    hAction TEXT,
    id INTEGER NOT NULL,
    no TEXT NOT NULL,
    name TEXT NOT NULL,
    addr TEXT,
    tel TEXT,
    contact TEXT,
    createDate TEXT NOT NULL,
    updateDate TEXT
);
CREATE TRIGGER customers_trigger_delete
AFTER DELETE ON customers BEGIN
INSERT INTO customers_his (
        hAction,
        id,
        hTimestamp,
        no,
        name,
        addr,
        tel,
        createDate,
        updateDate,
        contact
    )
VALUES (
        'DELETE',
        OLD.id,
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        OLD.no,
        OLD.name,
        OLD.addr,
        OLD.tel,
        OLD.createDate,
        OLD.updateDate,
        OLD.contact
    );
END;
CREATE TRIGGER customers_trigger_insert
AFTER
INSERT ON customers BEGIN
INSERT INTO customers_his (
        hAction,
        id,
        hTimestamp,
        no,
        name,
        addr,
        tel,
        createDate,
        updateDate,
        contact
    )
VALUES (
        'INSERT',
        NEW.id,
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        NEW.no,
        NEW.name,
        NEW.addr,
        NEW.tel,
        NEW.createDate,
        NEW.updateDate,
        NEW.contact
    );
END;
CREATE TRIGGER customers_trigger_update
AFTER
UPDATE ON customers BEGIN
INSERT INTO customers_his (
        hAction,
        id,
        hTimestamp,
        no,
        name,
        addr,
        tel,
        createDate,
        updateDate,
        contact
    )
VALUES (
        'UPDATE',
        NEW.id,
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        NEW.no,
        NEW.name,
        NEW.addr,
        NEW.tel,
        NEW.createDate,
        NEW.updateDate,
        NEW.contact
    );
END;
CREATE TRIGGER items_trigger_delete
AFTER DELETE ON items BEGIN
INSERT INTO items_his (
        hAction,
        hTimestamp,
        id,
        no,
        name,
        price,
        createDate,
        updateDate
    )
VALUES (
        'DELETE',
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        OLD.id,
        OLD.no,
        OLD.name,
        OLD.price,
        OLD.createDate,
        OLD.updateDate
    );
END;
CREATE TRIGGER items_trigger_insert
AFTER
INSERT ON items BEGIN
INSERT INTO items_his (
        hAction,
        hTimestamp,
        id,
        no,
        name,
        price,
        createDate,
        updateDate
    )
VALUES (
        'INSERT',
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        NEW.id,
        NEW.no,
        NEW.name,
        NEW.price,
        NEW.createDate,
        NEW.updateDate
    );
END;
CREATE TRIGGER items_trigger_update
AFTER
UPDATE ON items BEGIN
INSERT INTO items_his (
        hAction,
        hTimestamp,
        id,
        no,
        name,
        price,
        createDate,
        updateDate
    )
VALUES (
        'UPDATE',
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        NEW.id,
        NEW.no,
        NEW.name,
        NEW.price,
        NEW.createDate,
        NEW.updateDate
    );
END;
CREATE TRIGGER sellitems_trigger_delete
AFTER DELETE ON sellitems BEGIN
INSERT INTO sellitems_his (
        hTimestamp,
        hAction,
        id,
        mId,
        mNo,
        itemId,
        itemNo,
        itemName,
        qty,
        price,
        total,
        createDate,
        updateDate
    )
VALUES (
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        'DELETE',
        OLD.id,
        OLD.mId,
        OLD.mNo,
        OLD.itemId,
        OLD.itemNo,
        OLD.itemName,
        OLD.qty,
        OLD.price,
        OLD.total,
        OLD.createDate,
        OLD.updateDate
    );
END;
CREATE TRIGGER sellitems_trigger_insert
AFTER
INSERT ON sellitems BEGIN
INSERT INTO sellitems_his (
        hTimestamp,
        hAction,
        id,
        mId,
        mNo,
        itemId,
        itemNo,
        itemName,
        qty,
        price,
        total,
        createDate,
        updateDate
    )
VALUES (
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        'INSERT',
        NEW.id,
        NEW.mId,
        NEW.mNo,
        NEW.itemId,
        NEW.itemNo,
        NEW.itemName,
        NEW.qty,
        NEW.price,
        NEW.total,
        NEW.createDate,
        NEW.updateDate
    );
END;
CREATE TRIGGER sellitems_trigger_update
AFTER
UPDATE ON sellitems BEGIN
INSERT INTO sellitems_his (
        hTimestamp,
        hAction,
        id,
        mId,
        mNo,
        itemId,
        itemNo,
        itemName,
        qty,
        price,
        total,
        createDate,
        updateDate
    )
VALUES (
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        'UPDATE',
        NEW.id,
        NEW.mId,
        NEW.mNo,
        NEW.itemId,
        NEW.itemNo,
        NEW.itemName,
        NEW.qty,
        NEW.price,
        NEW.total,
        NEW.createDate,
        NEW.updateDate
    );
END;
CREATE TRIGGER sells_trigger_delete
AFTER DELETE ON sells BEGIN
INSERT INTO sells_his (
        hTimestamp,
        hAction,
        id,
        no,
        customerNo,
        customerId,
        sellDate,
        createDate,
        updateDate,
        total
    )
VALUES (
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        'DELETE',
        OLD.id,
        OLD.no,
        OLD.customerNo,
        OLD.customerId,
        OLD.sellDate,
        OLD.createDate,
        OLD.updateDate,
        OLD.total
    );
END;
CREATE TRIGGER sells_trigger_insert
AFTER
INSERT ON sells BEGIN
INSERT INTO sells_his (
        hTimestamp,
        hAction,
        id,
        no,
        customerNo,
        customerId,
        sellDate,
        createDate,
        updateDate,
        total
    )
VALUES (
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        'INSERT',
        NEW.id,
        NEW.no,
        NEW.customerNo,
        NEW.customerId,
        NEW.sellDate,
        NEW.createDate,
        NEW.updateDate,
        NEW.total
    );
END;
CREATE TRIGGER sells_trigger_update
AFTER
UPDATE ON sells BEGIN
INSERT INTO sells_his (
        hTimestamp,
        hAction,
        id,
        no,
        customerNo,
        customerId,
        sellDate,
        createDate,
        updateDate,
        total
    )
VALUES (
        datetime(CURRENT_TIMESTAMP, '+8 hours'),
        'UPDATE',
        NEW.id,
        NEW.no,
        NEW.customerNo,
        NEW.customerId,
        NEW.sellDate,
        NEW.createDate,
        NEW.updateDate,
        NEW.total
    );
END;