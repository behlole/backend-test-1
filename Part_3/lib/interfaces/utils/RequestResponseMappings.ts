import {Request,Response} from 'express';

const RequestResponseMappings={
    returnSuccessMessage:(
        res:Response,
        body:any={},
        message:string="Action Performed Successfully",
        status:number=200
    )=>{
        return res.status(status).send({body,message,status})
    },
    returnErrorMessage:(
        res:Response,
        body:any={},
        reason:string="Action Could Not Be Performed",
        status: number = 500
    )=>{
        return res.status(status).send({body,reason,status})
    }
}

export default RequestResponseMappings;
