const dbPool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const moment = require('moment-timezone');


const saltRounds = 10;
const jwtSecret = 'SECRET';

const getAllBudaya = () => {
    const SQLQuery = 'SELECT id, CONCAT("https://photo-foodbless.s3.ap-southeast-1.amazonaws.com/storage_folder/",foto) AS foto , nama, deskripsi FROM budaya';

    return dbPool.execute(SQLQuery);
}


const createBudaya = async (body) => {
    const { foto, nama, deskripsi } = body;
    const idBudaya = nanoid(16);

    const SQLQuery = `INSERT INTO budaya (id, foto, nama, deskripsi) 
                      VALUES (?, ?, ?, ?)`;
    const values = [idBudaya, foto, nama, deskripsi];

    await dbPool.execute(SQLQuery, values);

    return { foto, nama, deskripsi };
}

const getBudayaById = async (id) => {
    const SQLQuery = 'SELECT id, CONCAT("https://photo-foodbless.s3.ap-southeast-1.amazonaws.com/storage_folder/",foto) AS foto, nama, deskripsi FROM budaya WHERE id = ?';
    const [result] = await dbPool.execute(SQLQuery, [id]);

    if (result.length === 0) {
        throw new Error('Data Budaya Tidak Ditemukan');
    }

    return {
        message: 'Data Budaya Berhasil Didapat',
        budaya: result[0] 
    };
};



const deleteBudaya = async (id) => {
    const SQLQuery = 'DELETE FROM budaya WHERE id =?';
    const [result] = await dbPool.execute(SQLQuery, [id]);

    if (result.affectedRows === 0) {
        throw new Error('Data Budaya Tidak Ditemukan');
    }

    return { message: 'Data Budaya Berhasil Dihapus' };
};

module.exports = {
    getAllBudaya,
    createBudaya,
    deleteBudaya,
    getBudayaById
}