import {Request, Response} from "express";
import * as users from '../models/user.server.model';
import Logger from "../../config/logger";

const register = async (req: Request, res: Response):Promise<void> => {
    Logger.http('Registering user into DB')
    try {
        // Check Params
        if (!req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("firstName")
            || !req.body.hasOwnProperty("lastName") || !req.body.hasOwnProperty("password")) {
            res.status(400).send("Bad Request - Parameters missing from body");
        } else {
            // if(!validateEmail(req.body.email)) {
            //     res.status(400).send("Bad Request - Email is not formatted correctly");
            //     return
            // }
            const checkEmail = await users.readByEmail(req.body.email);
            if (checkEmail.length === 0){
                res.status(400).send("Bad Request - Email in use");
                return
            }
            const result = await users.insert(req.body.email, req.body.firstName, req.body.lastName, req.body.password);
            res.status(201).send({"user_id": result.insertId});
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const login = async (req:any, res:any) : Promise<any> => {
    res.status(200).send("test");
};

const logout = async (req:any, res:any) : Promise<any> => {
    return null;
};

const retrieve = async (req:any, res:any) : Promise<any> => {
    return null;
};

const update = async (req:any, res:any) : Promise<any> => {
    return null;
};

// helper functions

// const validateEmail = (email: string) => {
//     const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
//     return (email.match(validRegex));
// }

export{ register, login, logout, retrieve, update }