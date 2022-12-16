const dbConfig = require("./db.config");
const Sequelize = require("sequelize");



/*const sequelize = new Sequelize(
 'spacetravel',
 'root',
  {
    host: 'localhost',
    dialect: 'mysql'
  }
);*/

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
 }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
 });

 const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./models/user")(sequelize, Sequelize);

module.exports = db;

 