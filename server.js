const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

app.get('/employees',(req,res)=>{
  fs.readFile(path.join(__dirname,'data','employees.json'),'utf8',(err,data)=>{
    res.json(JSON.parse(data));
  });
});

app.post('/employees',(req,res)=>{
  fs.writeFile(path.join(__dirname,'data','employees.json'),JSON.stringify(req.body,null,2),()=>res.sendStatus(200));
});

app.get('/projects',(req,res)=>{
  fs.readFile(path.join(__dirname,'data','projects.json'),'utf8',(err,data)=>{
    res.json(JSON.parse(data));
  });
});

app.post('/projects',(req,res)=>{
  fs.writeFile(path.join(__dirname,'data','projects.json'),JSON.stringify(req.body,null,2),()=>res.sendStatus(200));
});

app.listen(3000,()=>console.log('Server running on http://localhost:3000'));
