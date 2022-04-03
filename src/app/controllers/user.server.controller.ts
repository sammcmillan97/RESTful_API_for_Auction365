import {Request, Response} from "express";
import * as users from '../models/user.server.model';
import * as auth from '../middleware/auth.middleware';
import Logger from "../../config/logger"

const register = async (req: Request, res: Response):Promise<void> => {
    Logger.http('Registering user into DB')
    try {
        // Check Params
        if (!req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("firstName")
            || !req.body.hasOwnProperty("lastName") || !req.body.hasOwnProperty("password")) {
            res.status(400).send("Bad Request - Parameters missing from body");
        } else {
            if(!validateEmail(req.body.email)) {
                res.status(400).send("Bad Request - Email is not formatted correctly");
                return
            }
            const checkEmail = await users.readByEmail(req.body.email);
            if (checkEmail.length !== 0){
                res.status(400).send({"Bad Request - Email in use": checkEmail[0].email});
                return
            }
            const password = req.body.password;
            if (password === "") {
                res.status(400).send("Bad Request - Password cannot be empty");
                return
            }
            const result = await users.insert(req.body.email, req.body.firstName, req.body.lastName, req.body.password);
            res.status(201).send({"userId" : result.insertId});
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const login = async (req:any, res:any) : Promise<void> => {
    Logger.http('Logging in user')
    try {
        // Check Params
        if (!req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("password")){
            res.status(400).send("Bad Request - Parameters missing from body");
        } else {
            const result = await users.readyByEmailAndPassword(req.body.email, req.body.password);
            if(result.length !== 0) {
                const randomToken = require('random-token');
                const token = randomToken(16);
                // Set token
                await auth.addToken(result[0].id, token);
                res.status(200).send({"userId": result[0].id, "token": token});
            } else {
                res.status(400).send("Bad Request - Email or password incorrect");
            }
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const logout = async (req:any, res:any) : Promise<any> => {
    Logger.http("Logging out user")
    try {
        const id = req.body.authenticatedUser.id;
        await auth.removeToken(id);
        res.status(200).send("OK");
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const retrieve = async (req:any, res:any) : Promise<any> => {
    Logger.http("Retrieving user details")
    try {
        const requestId: string = req.params.id;
        const userId = req.body.authenticatedUser.id.toString();
        if(requestId === userId) {
            res.status(200).send({"firstName": req.body.authenticatedUser.first_name,
                "lastName": req.body.authenticatedUser.last_name,
                "email": req.body.authenticatedUser.email});
            return
        } else {
            const user = await users.read(req.params.id);
            if(user.length !== 0) {
                res.status(200).send({"firstName": user[0].first_name, "lastName": user[0].last_name});
            } else {
                res.status(404).send("User not found");
            }
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const update = async (req:any, res:any) : Promise<any> => {
    Logger.http("Updating user")
    try {
        const requestId: string = req.params.id;
        const userId = req.body.authenticatedUser.id.toString();
        if (requestId === userId) {
            const requestedUser = await users.read(req.params.id); // Gets the requested users details
            // Check password matches current if the password property is present in the body request
            if (req.body.hasOwnProperty("password")) {
                if (req.body.currentPassword !== requestedUser[0].password) {
                    res.status(400).send("Bad Request - Current password is incorrect");
                    return
                }
            }
            if (req.body.hasOwnProperty("email")) {
                if (!validateEmail(req.body.email)) {
                    res.status(400).send("Bad Request - Email is not formatted correctly");
                    return
                }
            }
                const query = buildAlterUserQuery(req.body, req.params.id);
                const test = query.slice(0, -1);
                if(test === "update user Se where id = ") {
                    res.status(400).send();
                    return
                }
                const result = await users.alter(query);
                res.status(200).send({"Number of attributes changed": result.changedRows});
        } else {
            res.status(403).send("Can not edit another users details");
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

// helper functions

// Query Builder

const buildAlterUserQuery = (requestBody: any, id: string) : string => {
    let query: string = 'update user Set ';
    if (requestBody.hasOwnProperty("firstName")) {
        query += 'first_name = ' + "'" + requestBody.firstName + "'" + ", ";
    }
    if (requestBody.hasOwnProperty("lastName")) {
        query += 'last_name = ' + "'" + requestBody.lastName + "'" + ", ";
    }
    if (requestBody.hasOwnProperty("email")) {
        query += 'email = ' + "'" + requestBody.email + "'" + ", "
    }
    if (requestBody.hasOwnProperty("password")) {
        query += 'password = '  + "'" +  requestBody.password + "'" + ", ";
    }
    query = query.slice(0, -2);
    query += " where id = " + id;
    return query;
};

// Email validation

const validateEmail = (email: string) => {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return (email.match(validRegex));
}

// Password encryption

export{ register, login, logout, retrieve, update }