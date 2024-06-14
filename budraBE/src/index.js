require('dotenv').config()

const PORT = process.env.PORT || 5000;
const express = require('express');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');
const middlewareLogRequest = require('./middleware/logs');
const upload = require('./middleware/multer');
const budayaModel = require('./models/budayas');
const app = express();
const cors = require('cors');
const AWS = require("aws-sdk");

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middlewareLogRequest);
    app.use('/assets', express.static('public/images'))

AWS.config.update({
      region: process.env.REG,
      accessKeyId: process.env.KEY,
      secretAccessKey: process.env.SECRET
  });

const s3 = new AWS.S3();

const upload2AWS = async (filePath, fileName) => {
    const fileStream = fs.createReadStream(filePath);

    const params = {
        Bucket: 'photo-foodbless',
        Key: `storage_folder/${fileName}`,
        Body: fileStream,
        ContentType: 'application/octet-stream',
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file:', err);
                reject(err);
            } else {
                console.log('File uploaded successfully. File location:', data.Location);
                resolve(data.Location);
            }
        });
    });
};

app.post('/budaya', upload.single('foto'), async (req, res, next) => {
    try {
        let pathFoto = null;
        if (req.file) {
            const fotoBaru = `${nanoid(16)}${path.extname(req.file.originalname)}`;
            const urlfoto = path.join(__dirname, '../public/images', fotoBaru);

            fs.renameSync(req.file.path, urlfoto);
            const uploadUrl = await upload2AWS(urlfoto, fotoBaru);
            pathFoto = fotoBaru;
        }
        const dataBudaya = {
            nama: req.body.nama,
            deskripsi: req.body.deskripsi,
            foto: pathFoto
        };
        await budayaModel.createBudaya(dataBudaya);
        res.status(201).json({ 
            status: 200,
            message: 'Membuat Data Budaya Berhasil'
         });
    } catch (error) {
        next(error); 
    }
});

app.get("/budaya", async (req, res, next) => {
    try {
        const [budayas] = await budayaModel.getAllBudaya();
        res.status(201).json({
            status: 200,
            message: 'semua data budaya',
            budaya: budayas
        });
    } catch (error) {
        next(error);
    }
});

app.get('/budaya/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const budayaData = await budayaModel.getBudayaById(id);
        res.status(200).json(budayaData);
    } catch (error) {
        next(error);
    }
});


app.use((err, req, res, next) => {
    res.json({
        message: err.message
    })
})

app.listen(PORT, () => {
    console.log(`Server berhasil di running di port ${PORT}`);
})