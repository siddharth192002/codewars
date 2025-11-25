const mongoose=require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    problemId:{
        type:Schema.Types.ObjectId,
        ref:'problem',
        required:true
    },
    code:{
        type:String,
        required:true
    },
    language:{
        type:String,
        required:true,
        enum:['javascript','c++','java']
    },
    status:{
        type:String,
        enum:['pending','accepted','wrong','error'],
        default:'pending'
    },
    runtime:{
        type:Number, // millisecond
        default:0
    },
    memory:{
        type:Number, // KB
        default:0
    },
    errorMessage:{
        type:String,
    },
    testCasesPassesd:{
        type:Number,
        default:0
    },testCasesTotal:{ // Recommeded addition
        type:Number,
        default:0
    }
},
{
    timestamps:true
})


// compunf indexes for common query pattern

submissionSchema.index({userId:1,problemId:1});// basecondition 
submissionSchema.index({userId:1,problem:1,createdAt:-1});//for getting latest submissions first

submissionSchema.index({userId:1,createdAt:-1});// all user submission sorted
submissionSchema.index({problemId:1,status:1});// Problem statistics

const Submission=mongoose.model('submission',submissionSchema);
module.exports=Submission;