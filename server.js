const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
app.use(cors())

var Schema = mongoose.Schema;
var userSchema = new Schema({
  username:{ type: String,required:true}  
})

var USER = mongoose.model('USER',userSchema);



app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user',(req,res)=>{
  
   var user = new USER({username: req.body.username });
  
   user.save((err,data) =>{
     if(err){
       return err;
     } else{
       res.json({username: data.username, Id:data._id});
     } 
   });
   
});

app.get('/api/exercise/users', (req,res)=>{
  var user = new USER({});
   res.send(USER.find({}));
  
  
    
})



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
