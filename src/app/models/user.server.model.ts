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

const read = async (id: number) : Promise<User[]> => {
    Logger.info('Reading user from the database');
    Logger.info(id);
    const conn = await getPool().getConnection();
    const query = 'select * from user where id = ?'
    const [ result ] = await conn.query(query, id);
    conn.release();
    return result;
}

const alter = async (query: string) : Promise<ResultSetHeader> => {
    Logger.info("Altering user in the database");
    Logger.info(query);
    const conn = await getPool().getConnection();
    const [ result ] = await conn.query(query);
    return result;

}

const readByEmail = async (email: string) : Promise<User[]> => {
    Logger.info('Checking database for an existing email');
    const conn = await getPool().getConnection();
    const query = 'select * from user where email = ?'
    const [ rows ] = await conn.query(query, [ email ] );
    conn.release();
    return rows;
}

const readyByEmailAndPassword = async (email: string, password: string) : Promise<User[]> => {
    Logger.info('Checking database for correct password and email');
    const conn = await getPool().getConnection();
    const query = 'select * from user where email = ? and password = ?'
    const [ rows ] = await conn.query(query, [ email, password ] );
    conn.release();
    return rows;
}

export{ insert, read, alter, readByEmail, readyByEmailAndPassword}