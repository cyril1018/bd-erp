const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

// Get the path to the user data directory
const userDataPath = app.getPath("userData");

const dbPath = path.resolve(userDataPath, "database.db");

// Check if the database file exists
if (!fs.existsSync(dbPath)) {
  console.log("Database does not exist. Creating a new database.");

  // Create and connect to the new database
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error creating database:", err.message);
    } else {
      console.log("Successfully created new database.");

      // Read the SQL file
      const sqlPath = path.join(__dirname, "schema.sql");
      fs.readFile(sqlPath, "utf8", (err, sql) => {
        if (err) {
          console.error("Error reading SQL file:", err.message);
        } else {
          // Execute SQL statements
          db.exec(sql, (err) => {
            if (err) {
              console.error("Error executing SQL statements:", err.message);
            } else {
              console.log("Tables have been successfully created.");
            }
            // Close the database connection after completion
            db.close((err) => {
              if (err) {
                console.error("Error closing database connection:", err.message);
              } else {
                console.log("Database connection closed.");
              }
            });
          });
        }
      });
    }
  });
}

// Connect to the existing database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the existing database.");
  }
});

exports.db = db;
