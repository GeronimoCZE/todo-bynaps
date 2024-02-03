const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/todos', require('./routes/todos'));

app.use((req, res, next) => {
  const err = new Error("invalid request")
  err.status = 400
  next(err)
})

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ status: 'error', message: err.message })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});