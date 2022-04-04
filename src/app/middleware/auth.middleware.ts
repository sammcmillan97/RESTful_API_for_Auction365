import {Request, Response} from "express";
import Logger from "../../config/logger";
import {getPool} from "../../config/db";
import {ResultSetHeader} from "mysql2";


const loginRequired = async (req:Request, res:Response, next: () => Promise<any>) => {
    const token = req.header('X-Authorization');


    try {
        const result = await findUserIdByToken(token);
        if (result.length === 0) {
            res.status(401).send("Unauthorized");
            return
        } else {
            req.body.authenticatedUser = result[0];
            await next();
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
}

const findUserIdByToken = async (token:string) : Promise<User[]> =>  {
    Logger.info("Finding user by token in the database")
    const conn = await getPool().getConnection();
    const query ='select * from user where auth_token = ?';
    const [ rows ] = await conn.query(query, [ token ] );
    conn.release();
    return rows;
}

const addToken = async (userId: number, token:string) : Promise<ResultSetHeader> => {
    Logger.info("Adding token to user in the database");
    const conn = await getPool().getConnection();
    const query ='update user set auth_token = ? where id = ?';
    const [ result ] = await conn.query(query, [ token, userId ] );
    conn.release();
    return result;
}

const removeToken = async (userId: number) : Promise<ResultSetHeader> => {
    Logger.info("Removing token from user");
    const conn = await getPool().getConnection();
    const query = 'update user set auth_token = null where id = ?';
    const [ result ] = await conn.query(query, [ userId ]);
    conn.release();
    return result;

}

export { loginRequired, addToken, removeToken, findUserIdByToken}