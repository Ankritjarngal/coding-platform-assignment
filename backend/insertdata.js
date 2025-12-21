import db from "./middleware/db.js";
async function adduser(userid , username , user_email , password){
    try{
        const query = `insert into users(userid , username , user_email , password) 
        values($1 , $2 , $3 , $4) , [userid , username , user_email , password];
        `;
        const values = [userid , username , user_email , password];
        const res = await db.query(query , values);
        console.log("user data inserted : " , res.rows[0]);
    } catch(err) {
      console.error("error while iserting user ..... INVALID DATA : " , err);
    }
}
export default adduser;