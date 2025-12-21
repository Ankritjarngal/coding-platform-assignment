import db from '../middleware/db.js';

const createTables = async () => {
  try {
    console.log("Creating tables...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS questions (
          quesid SERIAL PRIMARY KEY,
          question TEXT NOT NULL,
          category VARCHAR(100),
          testcases TEXT -- Note: Consider changing to JSONB later
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
          userid SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
          user_email VARCHAR(150) UNIQUE NOT NULL,
          password VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS solutions (
          solutionid SERIAL PRIMARY KEY,
          userid INT,
          quesid INT,
          anskey JSON,
          FOREIGN KEY (userid) REFERENCES users(userid),
          FOREIGN KEY (quesid) REFERENCES questions(quesid)
      );
    `);

    console.log("Tables created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating tables:", err);
    process.exit(1);
  }
};

createTables();