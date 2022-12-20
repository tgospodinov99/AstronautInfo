var express = require('express');
//import express from 'express'
var router = express.Router();
//import fetch from 'node-fetch';
const fetch = require('node-fetch');
const mysql = require('mysql2');
const isAuth = require('../auth/userauth');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'user',
    database: 'spacetravel'
  });


async function currencyAPI() {
    try {
      const response = await fetch("https://api.exchangerate.host/latest");
  
      if(!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
  
      const result = await response.json();
      return result;
    } catch(err) {
      console.log(err);
    }
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday",
 "Thursday", "Friday", "Saturday"];

function daysToObj(daysInCurrentMonth, days, firstDayCurrentMonth){
  const daysObj = {};
  let j = firstDayCurrentMonth;
  for(let i = 1; i < daysInCurrentMonth + 1; i ++){
    if(j > 6){
      j = 0;
    }
    daysObj[i] = days[j];
    j++;
  }
  return daysObj;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, -29).getUTCDay();
}

const date = new Date();

const currentYear = date.getFullYear();
const currentMonth = date.getMonth() + 1;
const firstDayCurrentMonth = getFirstDayOfMonth(currentYear, currentMonth);


const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
const daysObj = daysToObj(daysInCurrentMonth, days, firstDayCurrentMonth);
const valuesInObj = Object.values(daysObj);
//const currJson = await currencyAPI


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', (req, res, next) => {
  res.render('test', {title: "day", "monday": "blue", "tuesday": "red", "wednesday": "green", 
  "thursday": "pink", "friday": "cyan", "saturday": "violet", "sunday": "brown"});
});

router.get('/days', (req, res, next) => {
  res.render('days', {daysObj});
});

router.get('/currency', async (req, res, next) => {
  const result = await currencyAPI();
  const rates = result.rates;
  //const JSONstr = JSON.stringify(rates);
  //const JSONstr = JSON.parse(await result);
  res.render('currency', {rates});
});

router.get('/exchange/:dollars', async (req, res, next) => {
  const result = await currencyAPI();
  const usd = result.rates.USD;
  res.render('exchange', {output: req.params.dollars, USD:usd});
})

router.post('/exchange/submit', (req, res, next) => {
  var dollars = req.body.dollars;
  res.redirect('/exchange/' + dollars);
})

router.get('/astronauts', (req, res, next) => {
  let astronautNames = {};

  connection.connect(function(err) {
    if (err) throw err;
    connection.query("SELECT Name FROM astronauts", function (err, result, fields) {
      if (err) throw err;
      //console.log(result);
      astronautNames = {names: result.map((e) => e.Name)};
      res.render('astronauts', {names: astronautNames.names});
    });
  });
});

router.get('/astronautstable', (req, res, next) => {
  connection.connect(function(err) {
    if (err) throw err;
    res.cookie('randomCookie', 'cookie', {expire: 360000 + Date.now()}); 
    const year = req.query.year;

    const querySucceded = (err, result, fields) => {
      res.render("astronautstable", {fullInfo: result});
    };

    if (year != undefined){
      connection.query("select * from astronauts where year = ?",
      [year], 
      querySucceded);
    } else {
      connection.query("select * from astronauts",
      querySucceded);
    }
  });
});

router.get('/addastronaut', isAuth, (req, res, next) => {
  res.render('addastronaut');
});

router.post('/addastronaut', (req, res, next) => {
  if (!req.body.name && !req.body.gender) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const {name, year, gender} = req.body;

  connection.query(
    'INSERT INTO `astronauts` (`Name`, `Year`, `Gender`) Values (?, ? ,?)',
    [[name], [year], [gender]],
    function(err, results, fields) {
      console.log(results); // results contains rows returned by server
      console.log(fields); // fields contains extra meta data about results, if available
      console.log(err);
    }
  );
  res.redirect('/astronautstable');
})

/*router.post('/astronautstable/filter', (req, res, next) => {
  var year = req.body.year;
  res.redirect('/astronautstable/' + year);
})*/

/*router.get('/exchange', async (req, res, next) => {
  //var dollars = req.params.dollars;
  const result = await currencyAPI();
  const usd = result.rates.USD;
  //res.send('helllooooo');
  res.render('exchange', {output: req.params.dollars, USD:usd});
});

/*router.get('/exchange/:dollars', async (req, res, next) => {
  const result = await currencyAPI();
  const usd = result.rates.USD;
  //res.send("1112312321");
  res.render('exchange', {output: req.params.dollars, USD: usd});
});*/

module.exports = router;
