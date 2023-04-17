const express=require('express');
const appRouter = require("./routes/routes");
const RequestResponseMappings = require("./mappings/RequestResponseMappings");
const bodyParser=require('body-parser');
const app=express();
const dotenv=require('dotenv');

dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use('/images',express.static('images'))
app.use('/',appRouter);

app.use('/**',(req,res)=>{
    return RequestResponseMappings.returnErrorMessage(res,{},"Route Could Not be found",404);
})
app.use(function (err, req, res, next) {
  return RequestResponseMappings.returnErrorMessage(res,{},err.message)
})

const port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running at port :`+port);
})

module.exports=app;