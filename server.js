const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
app.use(cors())

var Schema = mongoose.Schema;
var userSchema = new Schema({
  username:{ type: String,required:true},
  log:{ type: [Object], default:[{}]}
  });
       
var User = mongoose.model('User',userSchema);

var exerciseLogSchema = new Schema({
  description:{type: String, required:true},
  duration:{type:Number, required:true},
  date:{type: Date, default:Date.now()}
})

var ExerciseLog = mongoose.model('ExerciseLog',exerciseLogSchema);



app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user',(req,res)=>{
  
   var user = new User({username: req.body.username });
  
   user.save((err,data) =>{
     if(err){
       return err;
     } else{
       res.json({username: data.username, userId:data._id});
     } 
   });
   
});

app.post('/api/exercise/add', (req,res)=>{
    
  User.find({ _id:req.body.userId },  (err,data) =>{
 
   
    var exerciseLog = { description : req.body.description,
                         duration : req.body.duration,
                        date : req.body.date };
    
    data.log = exerciseLog);
    
    data.save((err,data)=>{
      if(err){
        return err;
      }else{
        res.send(data)
      }
    })
  
  });

});

app.get('/api/exercise/users', (req,res)=>{
 
  
  User.find({},( err,data) =>{
      if(err){
        return err
      } else{
        res.json(data);
      }
  });
})

app.get('/api/exercise/log', (req,res)=>{
 
  console.log(req.query.userId)
  User.find({ _id: req.query.userId },( err,data) =>{
      if(err){
        return err
      } else{
        res.json(data);
      }
  });
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
