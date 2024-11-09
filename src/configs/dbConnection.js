const { Sequelize, DataTypes } = require("sequelize");

const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_HOST = process.env.DB_HOST;
const HOST = process.env.HOST;
const DB = process.env.DB;

//? Local db connection
// const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
//   host: HOST,
//   dialect: DB,
//   logging: false, 
// });

//? Live db connection
const sequelize = new Sequelize(`${DB}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}.oregon-postgres.render.com/${DB_NAME}?ssl=true`)


const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("* DB Connected *");

    //! Drop all tables
    // await sequelize.drop();

    //! Truncate all tables
    // await sequelize.truncate({ cascade: true });

    //! Sync all tables
    // await sequelize.sync({ force: true });
    // await sequelize.sync({ alter: true });


  } catch (err) {
    console.log("* DB Not Connected *", err);
  }
};

/* testing db connection */
/* const dbConnection = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .authenticate()
      .then(() => {
        console.log("* DB Connected *");
        resolve();
      })
      .catch((err) => {
        console.log("* DB Not Connected *", err);
        reject(err);
      });
    // sequelize.sync({ alter: true });
  });
}; */

module.exports = { sequelize, DataTypes, dbConnection };
