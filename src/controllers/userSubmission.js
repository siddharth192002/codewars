

const Problem = require("../models/problem");
const Submission=require("../models/submission")
const {getLanguageById,submitBatch, submitToken}=require("../utils/ProblemUtility");



const submitCode=async(req,res)=>{

    try{
        const userId=req.result._id;
        const problemId=req.params.id;

        const {code,language}=req.body;

        if(!userId || !code || !problemId || !language)
        {
            return res.status(400).send("some filed misssing");
        }
        // fetch the problem from database
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).send("Problem not found");
        // testcases (hidden)


        // Judge0  code ko submit karna hai
        const languageId=getLanguageById(language);

        // kya apne submission store kar du phele...
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            testCasesPassesd:0,
            status:'pending',
            testCasesTotal:problem.hiddenTestCases.length
        })

        const submissions=problem.hiddenTestCases.map((testcase)=>({
                source_code:code,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
            }));

        const submitResult = await submitBatch(submissions);

        const resultToken = submitResult.map((value)=>value.token);

        const testResult=await submitToken(resultToken);


        // submittedResult ko update karo

        let testCasesPassesd=0;
        let runtime=0;
        let memory=0;
        let status='accepted';
        let errorMessage=null;

        for(const test of testResult)
        {
            if(test.status_id==3)
            {
                testCasesPassesd++;
                runtime =runtime+parseFloat(test.time);
                memory=Math.max(memory,test.memory);

            }
            else
            {
                if(test.status_id==4)
                {
                    status='error';
                    errorMessage=test.stderr;
                }
                else
                {
                    status='wrong';
                    errorMessage=test.stderr;
                }
            }
        }
        // store the result in databse in submission
        submittedResult.status=status;
        submittedResult.testCasesPassesd=testCasesPassesd;
        submittedResult.errorMessage=errorMessage;
        submittedResult.runtime=runtime;
        submittedResult.memory=memory;

        await submittedResult.save();

        // ProblemId ko insert karenga userSchema mei ke problemSolved mein if it not present there 


        // req.result ==user information
        if(!req.result.problemSolved.includes(problemId))
        {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        res.status(201).send(submittedResult);

    }catch(err)
    {
        res.status(500).send("internal server error"+err);
    }

}


const runCode=async(req,res)=>{
    try{
        const userId=req.result._id;
        const problemId=req.params.id;

        const {code,language}=req.body;

        if(!userId || !code || !problemId || !language)
        {
            return res.status(400).send("some filed misssing");
        }
        // fetch the problem from database
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).send("Problem not found");
        // testcases (hidden)


        // Judge0  code ko submit karna hai
        const languageId=getLanguageById(language);

        // // kya apne submission store kar du phele...
        // const submittedResult = await Submission.create({
        //     userId,
        //     problemId,
        //     code,
        //     language,
        //     testCasesPassesd:0,
        //     status:'pending',
        //     testCasesTotal:problem.hiddenTestCases.length
        // })

        const submissions=problem.visibleTestCases.map((testcase)=>({
                source_code:code,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
            }));

        const submitResult = await submitBatch(submissions);

        const resultToken = submitResult.map((value)=>value.token);

        const testResult=await submitToken(resultToken);


        // // submittedResult ko update karo

        // let testCasesPassesd=0;
        // let runtime=0;
        // let memory=0;
        // let status='accepted';
        // let errorMessage=null;

        // for(const test of testResult)
        // {
        //     if(test.status_id==3)
        //     {
        //         testCasesPassesd++;
        //         runtime =runtime+parseFloat(test.time);
        //         memory=Math.max(memory,test.memory);

        //     }
        //     else
        //     {
        //         if(test.status_id==4)
        //         {
        //             status='error';
        //             errorMessage=test.stderr;
        //         }
        //         else
        //         {
        //             status='wrong';
        //             errorMessage=test.stderr;
        //         }
        //     }
        // }
        // // store the result in databse in submission
        // submittedResult.status=status;
        // submittedResult.testCasesPassesd=testCasesPassesd;
        // submittedResult.errorMessage=errorMessage;
        // submittedResult.runtime=runtime;
        // submittedResult.memory=memory;

        // await submittedResult.save();

        // // ProblemId ko insert karenga userSchema mei ke problemSolved mein if it not present there 


        // // req.result ==user information
        // if(!req.result.problemSolved.includes(problemId))
        // {
        //     req.result.problemSolved.push(problemId);
        //     await req.result.save();
        // }

        res.status(201).send(testResult);

    }catch(err)
    {
        res.status(500).send("internal server error"+err);
    }
}


module.exports={submitCode,runCode};