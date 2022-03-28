import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";

const insert = async (email: string, firstName: string, lastName: string, password: string) : Promise<ResultSetHeader> => {
    Logger.info('Adding user to the database');
    const conn = await getPool().getConnection();
    const query = 'insert into user (email, first_name, last_name, password) values (?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [email, firstName, lastName, password] );
    conn.release();
    return result
};

const read = async () : Promise<any> => {
    return null;
}

const alter = async () : Promise<any> => {
    return null;
}

const readByEmail = async (email: string) : Promise<User[]> => {
    Logger.info('Checking database for an existing email');
    const conn = await getPool().getConnection();
    const query = 'select * from user where email = ?'
    const [ rows ] = await conn.query(query, [ email ] );
    Logger.info("reached");
    conn.release();
    return rows;
}

export{ insert, read, alter, readByEmail }