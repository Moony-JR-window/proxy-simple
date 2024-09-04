import { NextFunction, Request,Response } from "express"

function Access(req:Request, _res:Response,next:NextFunction){
    if (!req.headers['field']) {
        req.headers['field'] = 'proxy'; // You can set this to whatever default value you need
        // req.body=['role']
    }
    next();
}

export default Access