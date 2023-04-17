module.exports= {
    returnSuccessMessage:(
        res,
        body={},
        message="Action Performed Successfully",
        status=200
    )=>{
        return res.status(status).send({body,message,status})
    },
    returnErrorMessage:(
        res,
        body={},
        reason="Action Could Not Be Performed",
        status=500
    )=>{
        return res.status(status).send({body,reason,status})
    }
}