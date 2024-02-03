const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'nikolas', // change for your superuser or user name with granted permisions
  host: '127.0.0.1',
  database: 'bynaps',
  password: 'test1234', // change for your password or leave empty if have no password
  port: 5432,
});

pool.connect().then(async (client) => {
      await client.query('CREATE TABLE IF NOT EXISTS todos (id serial primary key, task text not null, completed boolean default false);');
      process.postgresql = client
    },
    () => { process.postgresql = undefined }
)
pool.on('error', (err, client) => {
  process.postgresql = undefined
  console.error('Unexpected error on idle client', err) // your callback here
  process.exit(-1)
})

router.use('/', require('../controllers/todosController'));

module.exports = router;
