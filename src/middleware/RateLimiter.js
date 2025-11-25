
const redisClient=require('../config/redis');



// ip 1 3600
const submitCoderateLimiter=async(req,res,next)=>{
    const userId=req.result._id;
    const redisKey=`submit_cooldown:${userId}`;
try{
    // kya ye ip exist karta hai
    // nahi karta
    // set method redisClient.set(ip,`1:${Date.now()/1000}`)
    // await redisClient.expire(3600);

    // exist karta hga:
    // 

    const number_of_request=await redisClient.exists(redisKey);
    if(number_of_request)
    {
        return res.status(429).json({
        error: "Please wait for 10 second before submitting again."
        });
    }
        await redisClient.set(redisKey,'cooldown_active',{
        EX:10,// expire after 10 second
       NX:true // only set if not exists
    }) 

    next();

}
catch(err){
        console.log('rate limiter error:',err);
        res.status(500).json({error:'Internal server error'});
}
};


module.exports=submitCoderateLimiter;