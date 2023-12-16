const mysql = require("mysql");

const dbConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "data_sensors",
});
dbConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL");
    createSensorTableIfNotExists();
    createFingerDataTableIfNotExists();
    createHistoryScanTableIfNotExists();
    createButtonsStateTableIfNotExists();
    createAutoModeStateTableIfNotExists();
  }
});

function createSensorTableIfNotExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS data_value (
      id INT AUTO_INCREMENT PRIMARY KEY,
      MQ2 FLOAT,
      MQ5 FLOAT,
      Soil FLOAT,
      Temp FLOAT,
      Hum FLOAT,
      Rain INT,
      Fire INT,
      Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  dbConnection.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating data_value table:", err);
    }
  });
}

function createFingerDataTableIfNotExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS finger_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      finger_id INT,
      finger_value TEXT,
      name VARCHAR(255),
      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  dbConnection.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating finger_data table:", err);
    }
  });
}

function createHistoryScanTableIfNotExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS history_scan (
      id INT AUTO_INCREMENT PRIMARY KEY,
      finger_id INT,
      name VARCHAR(255),
      finger_data TEXT,
      time_scan TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  dbConnection.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating history_scan table:", err);
    }
  });
}

function createButtonsStateTableIfNotExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS buttons_state (
      Bedroom INT,
      Relay2 INT,
      Livingroom INT,
      Relay3 INT,
      Door INT,
      Kitchen INT,
      Relay1 INT,
      ServoRain INT,
      Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const insertQuery = `
    INSERT INTO buttons_state (Bedroom, Relay2, Livingroom, Relay3, Door, Kitchen, Relay1, ServoRain)
    VALUES (0, 0, 0, 0, 0, 0, 0, 0);
  `;

  dbConnection.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating buttons_state table:", err);
    } else {
      dbConnection.query(insertQuery, (insertErr) => {
        if (insertErr) {
          console.error(
            "Error inserting initial values into buttons_state:",
            insertErr
          );
        } else {
          console.log("Inserted initial values into buttons_state");
        }
      });
    }
  });
}

function createAutoModeStateTableIfNotExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS auto_mode (
      rain INT,
      water INT,
      Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const insertQuery = `
    INSERT INTO auto_mode (rain, water)
    VALUES (0, 0);
  `;
  dbConnection.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating auto_mode table:", err);
    } else {
      dbConnection.query(insertQuery, (insertErr) => {
        if (insertErr) {
          console.error(
            "Error inserting initial values into auto_mode:",
            insertErr
          );
        } else {
          console.log("Inserted initial values into auto_mode");
        }
      });
    }
  });
}

function insertSensorData(sensorData) {
  const { MQ2, MQ5, Soil, Temp, Hum, Rain, Fire } = sensorData;
  const sql = `
    INSERT INTO data_value (MQ2, MQ5, Soil, Temp, Hum, Rain, Fire) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [MQ2, MQ5, Soil, Temp, Hum, Rain, Fire];
  dbConnection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data into MySQL:", err);
    }
  });
}

function insertFingerData(fingerEnrollData) {
  const { fingerName, data } = fingerEnrollData;
  const sql = `
    INSERT INTO finger_data (finger_id, finger_value, name) 
    VALUES (?, ?, ?)
  `;
  const values = [fingerEnrollData.id, JSON.stringify(data), fingerName];
  dbConnection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting finger data into MySQL:", err);
    } else {
      console.log(`Inserted finger data for finger_id ${fingerEnrollData.id}`);
    }
  });
}

function insertHistoryScanData(fingerScanData) {
  const { id } = fingerScanData;
  const selectQuery = `
    SELECT finger_id, name, finger_value 
    FROM finger_data 
    WHERE finger_id = ?;
  `;
  const values = [id];
  dbConnection.query(selectQuery, values, (err, result) => {
    if (err) {
      console.error("Error fetching finger data from MySQL:", err);
    } else {
      const { finger_id, name, finger_value } = result[0];
      const insertQuery = `
        INSERT INTO history_scan (finger_id, name, finger_data) 
        VALUES (?, ?, ?);
      `;
      const insertValues = [finger_id, name, finger_value];
      dbConnection.query(insertQuery, insertValues, (err) => {
        if (err) {
          console.error("Error inserting finger scan data into MySQL:", err);
        } else {
          console.log(
            `Inserted finger scan data for finger_id ${finger_id} into history_scan`
          );
        }
      });
    }
  });
}

function deleteFingerDataById(fingerId) {
  const deleteQuery = `
    DELETE FROM finger_data WHERE finger_id = ?;
  `;
  const values = [fingerId];
  dbConnection.query(deleteQuery, values, (err, result) => {
    if (err) {
      console.error("Error deleting finger data from MySQL:", err);
    } else {
      console.log(`Deleted finger data for finger_id ${fingerId}`);
    }
  });
}

function getAverageSensorData(callback) {
  const selectQuery = `
    SELECT
      DATE(Time) AS Date,
      AVG(MQ2) AS AvgMQ2,
      AVG(MQ5) AS AvgMQ5,
      AVG(Soil) AS AvgSoil,
      AVG(Temp) AS AvgTemp,
      AVG(Hum) AS AvgHum,
      AVG(Rain) AS AvgRain,
      AVG(Fire) AS AvgFire
    FROM data_value
    GROUP BY DATE(Time)
    ORDER BY Date DESC
    LIMIT 100;
  `;
  dbConnection.query(selectQuery, (err, result) => {
    if (err) {
      console.error("Error fetching average sensor data from MySQL:", err);
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
}

function getFingerData(callback) {
  const selectQuery = `
    SELECT id, finger_id, name, time FROM finger_data;
  `;
  dbConnection.query(selectQuery, (err, result) => {
    if (err) {
      console.error("Error fetching finger data from MySQL:", err);
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
}

function getFingerScanData(callback) {
  const selectQuery = `
    SELECT id, finger_id, name, time_scan FROM history_scan;
  `;
  dbConnection.query(selectQuery, (err, result) => {
    if (err) {
      console.error("Error fetching finger data from MySQL:", err);
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
}

function updateButtonsState(buttonLocation, newState) {
  const checkQuery = `
    SELECT COUNT(*) AS count FROM buttons_state;
  `;
  dbConnection.query(checkQuery, (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Error checking buttons_state table:", checkErr);
    } else {
      const rowCount = checkResults[0].count;
      if (rowCount === 0) {
        const insertQuery = `
          INSERT INTO buttons_state (Bedroom, Relay2, Livingroom, Relay3, Door, Kitchen, Relay1, ServoRain) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const initialValues = [0, 0, 0, 0, 0, 0, 0, 0];
        dbConnection.query(insertQuery, initialValues, (insertErr) => {
          if (insertErr) {
            console.error(
              "Error inserting initial values into buttons_state:",
              insertErr
            );
          } else {
            console.log("Inserted initial values into buttons_state");
          }
        });
      }
      const updateQuery = `
        UPDATE buttons_state SET ${buttonLocation} = ?;
      `;
      const values = [newState];
      dbConnection.query(updateQuery, values, (updateErr) => {
        if (updateErr) {
          console.error("Error updating buttons state in MySQL:", updateErr);
        } else {
          console.log(`Updated ${buttonLocation} state to ${newState}`);
        }
      });
    }
  });
}

function getButtonsState(callback) {
  const selectQuery = `
    SELECT * FROM buttons_state;
  `;
  dbConnection.query(selectQuery, (err, result) => {
    if (err) {
      console.error("Error fetching buttons state from MySQL:", err);
      callback(err, null);
    } else {
      const buttonsState = result.length > 0 ? result[0] : null;
      callback(null, buttonsState);
    }
  });
}

function updateAutoMode(topic, newState) {
  const autoModeType = topic.split("/")[1];
  const checkQuery = `
    SELECT COUNT(*) AS count FROM auto_mode;
  `;
  dbConnection.query(checkQuery, (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Error checking auto_mode table:", checkErr);
    } else {
      const rowCount = checkResults[0].count;
      if (rowCount === 0) {
        const insertQuery = `
          INSERT INTO auto_mode (rain, water) 
          VALUES (?, ?);
        `;
        const initialValues = [0, 0];
        dbConnection.query(insertQuery, initialValues, (insertErr) => {
          if (insertErr) {
            console.error(
              "Error inserting initial values into auto_mode:",
              insertErr
            );
          } else {
            console.log("Inserted initial values into auto_mode");
            const updateQuery = `
              UPDATE auto_mode SET ${autoModeType} = ?;
            `;
            const values = [newState];
            dbConnection.query(updateQuery, values, (updateErr) => {
              if (updateErr) {
                console.error(
                  `Error updating ${autoModeType} state in MySQL:`,
                  updateErr
                );
              } else {
                console.log(`Updated ${autoModeType} state to ${newState}`);
              }
            });
          }
        });
      } else {
        const updateQuery = `
          UPDATE auto_mode SET ${autoModeType} = ?;
        `;
        const values = [newState];
        dbConnection.query(updateQuery, values, (updateErr) => {
          if (updateErr) {
            console.error(
              `Error updating ${autoModeType} state in MySQL:`,
              updateErr
            );
          } else {
            console.log(`Updated ${autoModeType} state to ${newState}`);
          }
        });
      }
    }
  });
}

function getAutoMode(callback) {
  const selectQuery = `
    SELECT * FROM auto_mode;
  `;
  dbConnection.query(selectQuery, (err, result) => {
    if (err) {
      console.error("Error fetching auto mode from MySQL:", err);
      callback(err, null);
    } else {
      const autoMode = result.length > 0 ? result[0] : null;
      callback(null, autoMode);
    }
  });
}

module.exports = {
  insertSensorData,
  insertFingerData,
  insertHistoryScanData,
  deleteFingerDataById,
  getFingerData,
  getFingerScanData,
  updateButtonsState,
  getButtonsState,
  updateAutoMode,
  getAutoMode,
  getAverageSensorData,
};
