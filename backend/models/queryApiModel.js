const db = require('../config/mysql_database');
const ErrorHandler = require('../utils/errorHandler');

exports.saveData = async (table_name, postData)=>{
    
    try {
        const insertData = await db.query(`INSERT INTO ${table_name} SET ?`, postData);

        // Get the ID of the last inserted row
        const lastInsertId = insertData[0].insertId;

        const record = await db.query(`SELECT * FROM ${table_name} WHERE id = ?`, [lastInsertId]);
        const response = record[0][0];

        return  response;

    } catch (error) {
        return next(new ErrorHandler(`${error}`,400));
    }
}


exports.findByIdAndUpdateData = async (table_name, id, updateData, next) => {
    
        const record_exit = await db.query(`SELECT id FROM ${table_name} WHERE id = ?`, [id]);
        const exists_data_response = record_exit[0][0];
       
        if (!exists_data_response) {
            return next(new ErrorHandler('Record not found',400));
        }else{
            try {
                const result = await db.query(`UPDATE ${table_name} SET ? WHERE id = ?`, [updateData, id]);
                
                const record = await db.query(`SELECT * FROM ${table_name} WHERE id = ?`, [id]);
                const response = record[0][0];

                return response;

            } catch (error) {
                
                return next(new ErrorHandler(`${error}`,400));
            }
        }
    
}



exports.findByIdAndDelete = async (table_name, id, next) => {
    
    const record_exit = await db.query(`SELECT id FROM ${table_name} WHERE id = ?`, [id]);
    const exists_data_response = record_exit[0][0];
   
    if (!exists_data_response) {
        return next(new ErrorHandler('Record not found',400));
    }else{
        try {
            
            await db.query(`DELETE FROM ${table_name}  WHERE id = ?`, [id]);
            
            return exists_data_response;

        } catch (error) {
            
            return next(new ErrorHandler(`${error}`,400));
        }
    }

}




exports.findById = async (table_name, id, next) => {
    try { 
        const record = await db.query(`SELECT * FROM ${table_name} WHERE id = ?`, [id]);
        
        const response = record[0][0];
    
        if (!response) {
            return next(new ErrorHandler('Record not found',400));
        }else{
            return response;
        }
    } catch (error) {
            
        return next(new ErrorHandler(`${error}`,400));
    }

}