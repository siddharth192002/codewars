const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require('express');
const app = express();
const cookieparser = require('cookie-parser');
const main = require('./config/db');
const redisClient= require('./config/redis');
const authRouter= require("./routes/userAuth");
const problemRouter=require("./routes/probelmCreator")
const submitRouter=require("./routes/submit");

app.use(express.json());
app.use(cookieparser());



app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use("/submission",submitRouter);





const InitializeConnection =async()=>{


  try{
    await Promise.all([main(),redisClient.connect()]);
    console.log("DB Connect");

    app.listen(process.env.PORT,()=>{
      console.log("srever listening at port number: " +process.env.PORT);
    })
  }
  catch(err)
  {
    console.log("error:"+err)
  }
}

InitializeConnection();

// main()
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log("Server listening at port number: " + process.env.PORT);
//     });
//   })
//   .catch(err => console.log("Error occurred: " + err));