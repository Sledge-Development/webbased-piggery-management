import { NextApiRequest, NextApiResponse } from "next";
import authorizationHandler from "pages/api/authorizationHandler";
import connection from "pages/api/mysql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authorized = await authorizationHandler(req, res, "POST");
  if (!authorized) {
    return false;
  }
  const data: any = await GetId();
  return res.status(200).json({ code: 200, data: data });
}

async function GetId() {
  const conn = await connection.getConnection();
  try {
    const sql = "select max(pig_id) from tbl_pig";
    const [result] = await conn.query(sql);
    conn.release();
    return result;
  } catch (error) {
    console.log(error);
    return error;
  } finally {
    conn.release();
  }
}
