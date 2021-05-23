// app dep
const cors = require('cors')
const pg = require('pg')
const superagent = require('superagent')
const methodOverride = require('method-override')
const express = require('express')

//env var
require('dotenv').config();
//app set
const PORT =process.env.PORT || 3000
const app=express()
//midelwear
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
//data base


const client = new pg.Client(process.env.DATABASE_URL);
//rout
app.get('/', renderHome)

app.post('/search' , searchResul)
app.get('/search' , renderSearch)
app.post('/save' , saveData)
app.get('/favar' , renderFav)

app.post('/detalis/:data_id' , showDetalis)
app.put('/detalis/:data_id' , update)
app.delete('/detalis/:data_id' , deleteJob)
//callback
function renderHome(req,res) {
    const url ='https://jobs.github.com/positions.json?location=usa'
    superagent.get(url).then((dataFromApi)=>{
        // console.log(dataFromApi.body)
        const apiData =dataFromApi.body.map(data =>{
            return new Usa(data)
        })
        res.render('index' , { allData : apiData})
    }).catch(error =>{console.log(error)})
    
}
function searchResul(req,res) {
    const description =req.body.description
    const url=`https://jobs.github.com/positions.json?description=${description}&location=usa`
    superagent.get(url).then((dataFromApi)=>{
    
        res.render('result' , {allData : dataFromApi.body})
    }).catch(error =>{console.log(error)})
    
}


function renderSearch(req,res) {
    res.render('search')
}

function saveData(req,res) {
    const {title,company,location,url} =req.body
    const sql =' INSERT INTO mytable (title,company,location,url)  VALUES ($1,$2,$3,$4)'
    const value =[title,company,location,url]
    client.query(sql,value).then((dataFromDb)=>{
        res.redirect('/favar')
    }).catch(error =>{console.log(error)})
    
}


function renderFav(req,res) {
const sql ='SELECT * FROM mytable'
client.query(sql).then((dataFromDB)=>{
    res.render('list' , { favData : dataFromDB.rows})
}).catch(error =>{console.log(error)})
    
}
function showDetalis(req,res) {
    const id =req.params.data_id
    const sql ='SELECT * FROM mytable WHERE id=$1'
    const value=[id]
    client.query(sql,value).then((dataFromDB)=>{
        res.render('myjob' , {detalis : dataFromDB.rows})
    }).catch(error =>{console.log(error)})
    
}
function update(req,res) {
    const id =req.params.data_id
    const {title,company,location,url} =req.body
    const sql ='UPDATE mytable SET title=$1 ,company=$2 ,location=$3 , url=$4  , WHERE id=$5'
const value=[title,company,location,url,id]
client.query(sql,value).then(()=>{
    res.redirect(`/detalis/${id}`)
}).catch(error =>{console.log(error)})
    
}
function deleteJob(req,res) {
    const id =req.params.data_id
const sql='DELETE FROM mytable WHERE id =$1 '
client.query(sql,[id]).then(()=>{
    res.redirect('/favar')
}).catch(error =>{console.log(error)})
    
}
//constructor
function Usa (data){
   this. title=data.title
   this. company=data.company

   this.location=data.location
   this.url=data.url
}

//app start
client.connect().then(()=>{
    app.listen(PORT ,()=>{console.log(`listen ${PORT}`)})
})