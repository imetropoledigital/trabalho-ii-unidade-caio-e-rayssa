// API em Express
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware para interpretar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("Hello, World!");
});

// Listar Documentos com Projeção
app.get('/api/:collection/:fields', async (req, res) => {
    try {
        const { collection, fields } = req.params;
        const projection = fields.split(',').reduce((acc, field) => ({ ...acc, [field]: 1 }), {});

        const documents = await mongoose.connection.db.collection(collection).find({}, { projection }).toArray();

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Listar Documento por ID
app.get('/api/:collection/id/:id', async (req, res) => {
    try {
        const { collection, id } = req.params;
        
        const objectId = new mongoose.Types.ObjectId(id);

        const document = await mongoose.connection.db.collection(collection).findOne({ _id: objectId });

        if (!document) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Listar Documentos
app.get('/api/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        const { query = '{}', page = 1, limit = 10 } = req.query;

        const parsedQuery = JSON.parse(query);
        const skip = (page - 1) * limit;

        const documents = await mongoose.connection.db.collection(collection)
            .find(parsedQuery)
            .skip(Number(skip))
            .limit(Number(limit))
            .toArray();

        res.status(200).json({ documents });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cadastrar Documento
app.post('/api/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        const document = req.body;

        const result = await mongoose.connection.db.collection(collection).insertOne(document);
        res.status(200).json({ insertedId: result.insertedId });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Atualizar Documento
app.put('/api/:collection/:id', async (req, res) => {
    try {
        const { collection, id } = req.params;
        const updates = req.body;

        const result = await mongoose.connection.db.collection(collection).findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }else{
            return res.status(200).json(result);
        }

        res.status(200).json(result.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Conexão com o Banco
mongoose.connect("mongodb+srv://admin:ia9MoVE5VWdwbfsb@backendmongo.6qawg.mongodb.net/Node-API?retryWrites=true&w=majority&appName=backendmongo")
    .then(() => {
        console.log('Connected to database!');
        app.listen(3000, function () {
            console.log('Server is running on port 3000');
        });
    })
    .catch(() => {
        console.log('Connection failed!');
    });
