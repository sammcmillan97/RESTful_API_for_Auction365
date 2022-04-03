import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";

const getImage = async (id: number) : Promise<Image[]> => {
    Logger.info("Getting auction image path from the database");
    const conn = await getPool().getConnection();
    const query = "select image_filename as imageFilename from auction where id = ?"
    const [ result ] = await conn.query(query, id);
    conn.release();
    return result;
}

const setImage = async(filename: string, id: string) => {
    Logger.info("Setting image in the database");
    const conn = await getPool().getConnection();
    const query = 'update auction set image_filename = ? where id = ?'
    await conn.query(query, [ filename, id.toString() ] );
    conn.release();
}

export {getImage, setImage}