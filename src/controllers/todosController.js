const express = require('express');
const router = express.Router();

const validateID = (req, res, next) => {
  const id = req.params.id
  if(id % 1 != 0){
    res.status(400).json({ status: "error" , message: "id parameter must be a whole number" })
  } else {
    next()
  }
}
const validateInput = (req, res, next) => {
  const {task, completed} = req.body
  if(task == undefined && completed == undefined){
    res.status(400).json({ status: "error" , message: "At least one of task (string) or completed (boolean) must be provided" }); return;
  }

  if(typeof task == "string" || task == undefined){}
  else {
    res.status(400).json({ status: "error" , message: "task must be a string" }); return;
  }
  if(typeof completed == "boolean" || completed == undefined){}
  else {
    res.status(400).json({ status: "error" , message: "completed must be a boolean" }); return;
  }
  next()
}

router.use('/', (req, res, next) => {
  if(process.postgresql != undefined){
    next()
  } else {
    res.status(500).json({status: "error" , message: "no connection to the database"})
  }
})

router.get('/', async (req, res) => {
  try{
    const todos = await process.postgresql.query(`SELECT * FROM todos;`);
    res.status(200).json({ status: "ok", rows: todos.rows })
  } catch{
    res.status(500).json({ status: "error" , message: "something went wrong" })
  }
});

router.get('/:id', validateID, async (req, res) => {
  try{
    const todo = await process.postgresql.query('SELECT * FROM todos WHERE "id" = $1', [req.params.id]);
    if(todo.rows.length != 0){
      res.status(200).json({ status: "ok", row: todo.rows[0] })
    } else {
      res.status(404).json({ status: "error" , message: "row with this id doesn't exist" })
    }
  } catch{
    res.status(500).json({ status: "error" , message: "something went wrong" })
  }
});

router.post('/', async (req, res) => {
  const {task} = req.body
  if(task == undefined || typeof task !== 'string'){
    res.status(400).json({ status: "error" , message: 'task is required and must be a string' });
    return;
  }
  try{
    const query = 'INSERT INTO todos(task) VALUES($1) RETURNING *'
    const post = await process.postgresql.query(query, [task])
    if(post.rowCount != 0){
      res.status(201).json({status: "ok", message: "row has been inserted", row: post.rows[0]})
    } else {
      res.status(500).json({status: "error" , message: "row insertion failed"})
    }
  } catch{
    res.status(500).json({ status: "error" , message: "something went wrong" })
  }
});

router.put('/:id', validateID, validateInput, async (req, res) => {
  try {
    const {task, completed} = req.body
    const todo = await process.postgresql.query('SELECT * FROM todos WHERE "id" = $1', [req.params.id]);
    if(todo.rows.length != 0){
      let Task = (task == undefined) ? todo.rows[0].task : task
      let Completed = (completed == undefined) ? todo.rows[0].completed : completed
      const query = `UPDATE "todos" SET "task" = ($1), "completed" = ($2) WHERE "id" = ($3)`;
      await process.postgresql.query(query, [Task, Completed, req.params.id]); 
      res.status(201).json({status: "ok", message: "row has been updated"})
    } else {
      res.status(404).json({ status: "error" , message: "row with this id doesn't exist" })
    }
  } catch {
    res.status(500).json({ status: "error" , message: "something went wrong" })
  }
});

router.delete('/:id', validateID, async (req, res) => {
  try{
    const del = await process.postgresql.query('DELETE FROM "todos" WHERE "id" = $1', [req.params.id]);
    if(del.rowCount != 0){
      res.status(201).json({status: "ok" , message: `row has been deleted`})
    } else {
      res.status(500).json({status: "error" , message: "row deletetion failed"})
    }
  } catch{
    res.status(500).json({ status: "error" , message: "something went wrong" })
  }
});

module.exports = router;
