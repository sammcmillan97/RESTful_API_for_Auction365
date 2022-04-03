import { getPool } from "../../config/db";
import Logger from "../../config/logger";

const getImage = async (id: number) : Promise<Image[]> => {
    Logger.info("Getting user image path from the database");
    const conn = await getPool().getConnection();
    const query = "select image_filename as imageFilename from user where id = ?"
    const [ result ] = await conn.query(query, id);
    conn.release();
    return result;
}

const removeImage = async(id: number) => {
    Logger.info("deleting user image from the database");
    const conn = await getPool().getConnection();
    const query = 'update user set image_filename = null where id = ?';
    await conn.query(query, [ id ]);
    conn.release();
}

export {getImage, removeImage}