import { getPool } from "../../config/db";
import Logger from "../../config/logger";

const getImage = async (id: number) : Promise<Image[]> => {
    Logger.info("Getting auction image from the database");
    const conn = await getPool().getConnection();
    const query = "select image_filename as imageFilename from auction where id = ?"
    const [ result ] = await conn.query(query, id);
    return result;
}

export {getImage}