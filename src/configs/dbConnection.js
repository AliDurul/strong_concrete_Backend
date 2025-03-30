const { Sequelize, DataTypes } = require("sequelize");

const pg_user = process.env.PGUSER
const pg_password = process.env.PGPASSWORD
const pg_host = process.env.PGHOST
const pg_db = process.env.PGDATABASE

//? Local db connection
// const sequelize = new Sequelize(pg_db, pg_user, pg_password, {
//   host: pg_host,
//   dialect: 'postgres',
//   logging: false,
// });

//? Live db connection
const sequelize = new Sequelize(`postgresql://${pg_user}:${pg_password}@${pg_host}/${pg_db}?sslmode=require`, {
  dialectModule: require('pg')
});



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
