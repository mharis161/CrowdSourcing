import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Use the postgres DB to create our new DB
const client = new Client({
  user: 'postgres',
  password: 'Feroze@1888',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
});

async function createDB() {
  try {
    await client.connect();
    console.log('Connected to Postgres');
    
    // Check if DB exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='crowdforge'");
    if (res.rowCount === 0) {
      console.log('Creating database crowdforge...');
      await client.query('CREATE DATABASE crowdforge');
      console.log('Database created');
    } else {
      console.log('Database crowdforge already exists');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
  } finally {
    await client.end();
  }
}

createDB();
