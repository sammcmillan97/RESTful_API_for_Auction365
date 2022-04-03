import { getPool } from "../../config/db";
import Logger from "../../config/logger";

const checkCat = async (query: string) : Promise<any> => {
    Logger.info("Checking category");
    const conn = await getPool().getConnection();
    const [ result ] = await conn.query(query);
    conn.release();
    return result;
}

const getAll = async () : Promise<category[]> => {
    Logger.info("Getting all auction categories");
    const conn = await getPool().getConnection();
    const query = 'select id as categoryId, name from category';
    const [ result ] = await conn.query(query);
    conn.release();
    return result;
}

export{ checkCat, getAll }