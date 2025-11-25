const problem= require("../models/problem");
const Submission = require("../models/submission");
const User=require("../models/user");

const { getLanguageById, submitBatch, submitToken } = require("../utils/ProblemUtility");



const CreateProblem= async(req,res)=>{
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator}=req.body;

    try{

        for(const {language,completeCode} of referenceSolution)
        {
            //source_code:
            // language_id:
            //stdin:
            //expectedOutput:
            const languageId=getLanguageById(language);

            // creating batch
            // I am creating batch submission 
            const submissions=visibleTestCases.map((testcase)=>({
                source_code:completeCode,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
            }));

            const submitResult = await submitBatch(submissions);
            // console.log(submitResult);

            const resultToken = submitResult.map((value)=>value.token);
            
            // [dce7bbc5-a8c9-4159-a28f-ac264e48c371,1ed737ca-ee34-454d-a06f-bbc73836473e,9670af73-519f-4136-869c-340086d406db]

            const testResult = await submitToken(resultToken);

            // console.log(testResult);

            for(const test of testResult)
            {
                if(test.status_id!=3)
                {
                    return res.status(400).send("error occured");
                }
            }
        } 
        // we can store in it our database

        const userProblem = await problem.create({
            ...req.body,
            problemCreator:req.result._id
        });

        res.status(201).json({ message: "Problem saved successfully", problem: userProblem });

    }
    catch(err)
    {
        res.status(400).json({ message: err.message });
    }

}


const updateProblem=async(req,res)=>{
    const {id} = req.params
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator}=req.body;

    try{
        if(!id)
        {
            return res.status(400).send("Missing ID Field");
        }
        const DsaProblem=await problem.findById(id);
        if(!DsaProblem)
        {
            return res.status(404).send("id is not present in server")
        }


        for(const {language,completeCode} of referenceSolution)
        {
            //source_code:
            // language_id:
            //stdin:
            //expectedOutput:
            const languageId=getLanguageById(language);

            // creating batch
            // I am creating batch submission 
            const submissions=visibleTestCases.map((testcase)=>({
                source_code:completeCode,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
            }));

            const submitResult = await submitBatch(submissions);
            // console.log(submitResult);

            const resultToken = submitResult.map((value)=>value.token);
            
            // [dce7bbc5-a8c9-4159-a28f-ac264e48c371,1ed737ca-ee34-454d-a06f-bbc73836473e,9670af73-519f-4136-869c-340086d406db]

            const testResult = await submitToken(resultToken);

            // console.log(testResult);

            for(const test of testResult)
            {
                if(test.status_id!=3)
                {
                    return res.status(400).send("error occured");
                }
            }
        } 
        
        const newProblem= await problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});

        res.status(200).send(newProblem);
        

    }
    catch(err) {
    res.status(400).send("error: " + err.message);
    }
}



const deleteProblem=async(req,res)=>{
    const {id}=req.params;
    try{
        
        if(!id)
        {
            return res.status(400).send("ID is Missing");
        }
        const deletedProblem=await problem.findByIdAndDelete(id);

        if(!deletedProblem)
        {
            return res.status(404).send("Problem is missing");
        }

        res.status(200).send("successfully deleted");
    }
    catch(err)
    {
        res.status(500).send("error:"+err);
    }
}




const getProblemById=async(req,res)=>{
    const {id}=req.params;
    try{
        
        if(!id)
        {
            return res.status(400).send("ID is Missing");
        }
        const getProblem=await problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');


        // -hiddenTestCase
        if(!getProblem)
        {
            return res.status(404).send("Problem is missing");
        }

        res.status(200).send(getProblem);
    }
    catch(err)
    {
        res.status(500).send("error :"+err);
    }
}


const getAllProblem=async(req,res)=>{
    try{
        
        const getProblem = await problem.find({}).select('_id title difficulty tags');

        if(getProblem.length==0)
        {
            return res.status(404).send("Problem is missing");
        }

        res.status(200).send(getProblem);
    }
    catch(err)
    {
        res.status(500).send("error :"+err);
    }
}


const solvedProblemByUser=async(req,res)=>{
    try{
    
        // const count =req.result.problemSolved.length;
        // res.status(200).send(count);

        const userId=req.result._id;
        const user=await User.findById(userId).populate({
            path:"problemSolved",
            select:"_id title difficulty tags"
        });

        res.status(200).send(user.problemSolved);
    }
    catch(err)
    {
        res.status(500).send("Server Error");
    }
}

const submittedProblem=async(req,res)=>{
    try{
        const userId=req.result._id;
        const problemId=req.params.pid;

        const ans = await Submission.find({userId,problemId});

        if(ans.length==0)
        {
            res.status(200).send("No Submission is present")
        }
    res.status(200).send(ans);

    }
    catch(err){
        res.status(500).send("Internal server error");
    }
}

module.exports={CreateProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblemByUser,submittedProblem};