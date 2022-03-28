import {Request, Response} from "express";
import Logger from "../../config/logger";
import {getPool} from "../../config/db";

const loginRequired = async (req:Request, res:Response, next: () => Promise<any>) => {
    const token = req.header('X-Authorization');


    try {
        const result = await findUserIdByToken(token);
        if (result === null) {
            res.statusMessage = 'Unauthorized';
            res.status(401)
                .send();
        } else {
            req.body.authenticatedUserId = result.toString();
            next();
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
}

const findUserIdByToken = async (token:string) : Promise<number> =>  {
    Logger.info("Getting User from the data base");
    const conn = await getPool().getConnection();
    const query ='select * from users where auth_token = ?';
    const [ rows ] = await conn.query(query, [ token ] );
    return rows[0];
}

export { loginRequired }