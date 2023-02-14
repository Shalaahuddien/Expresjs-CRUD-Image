import { Sequelize } from "sequelize";
// import pg from "pg";

const db = new Sequelize('upload','postgres','1234567',{
    host: 'localhost',
    dialect: 'postgres'
});

export default db;