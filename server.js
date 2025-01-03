// API em Express
const express = require('express')
const mongoose = require('mongoose')
const User = require('./models/user.model.js')
const app = express()

// Middleware para interpretar JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("Hello!")
})

// Listar Usuário
app.get('/api/user/:fields', async (req, res) => {
    try {
        const { fields } = req.params

        const projection = fields.replace(',', ' ')

        const users = await User.find().select(projection) 
        
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

// Listar Usuários de Forma Paginada
app.get('/api/users', async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query

        const parsedQuery = query ? JSON.parse(query) : {};

        const skip = (page - 1) * limit

        const users = await User.find(parsedQuery).skip(skip).limit(Number(limit)).exec()

        res.status(200).json({users})
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Cadastrar Usuário
app.post('/api/user', async (req, res) => { 
    try {
        const user = await User.create(req.body)
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// Conexão com o Banco

mongoose.connect("mongodb+srv://admin:ia9MoVE5VWdwbfsb@backendmongo.6qawg.mongodb.net/Node-API?retryWrites=true&w=majority&appName=backendmongo").then(() => {
    console.log('Connected to database!')
    app.listen(3000, function() {
        console.log('Server is running on port 3000')
    })    
}).catch(() => {
    console.log('Connection failed!')
})