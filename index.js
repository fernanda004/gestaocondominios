const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
 
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
 
const sslOptions ={
    ca: fs.readFileSync('./BaltimoreCyberTrustRoot.crt.pem'),
}
 
const connection = mysql.createConnection({
    host: 'nome2.database.windows.net',
    user: 'root@',
    password: 'Cedup@2025',
    database: 'condominio',
    port: 3306,
    ssl: sslOptions
});
 
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados!');
    }
});
 
 
app.post('/', (req, res) => {
    const { descricao, qtd_apartamentos } = req.body;
    const sql = 'INSERT INTO blocos (descricao, qtd_apartamentos) VALUES (?, ?)';
    connection.query(sql, [descricao, qtd_apartamentos], (err, result) => {
        if (err) {
            res.status(500).send('Erro ao cadastrar bloco.');
        } else {
            res.send('Bloco cadastrado com sucesso!');
        }
    });
});
 
app.get('/listar', (req, res) => {
    const listar = 'SELECT * FROM blocos';
    connection.query(listar, (err, rows) => {
        if (!err) {
            res.json(rows);
        } else {
            console.error('Erro ao listar blocos:', err);
            res.status(500).send('Erro ao listar blocos.');
        }
    });
});
 
 
 
 
 
app.get('/excluir/:id', (req, res) => {
    const id = req.params.id;
    console.log('Requisição de exclusão recebida para ID:', id); // Adicione esta linha
    if (id !== undefined && id !== null) {
        connection.query('DELETE FROM blocos WHERE bloco_id = ?', [id], (err, result) => {
            if (err) {
                console.error('Erro ao excluir o bloco:', err);
                res.status(500).send('Erro ao excluir.');
            } else {
                console.log('Bloco excluído com sucesso:', result);
                res.redirect('/listar');
            }
        });
    } else {
        console.error('ID está indefinido ou nulo');
        res.status(400).send('ID inválido.');
    }
});

app.get('/editar/:id', (req, res) => {
    const id = req.params.id;
    console.log('Requisição de edição recebida para ID:', id); // Adicione esta linha
    connection.query('SELECT * FROM blocos WHERE bloco_id = ?', [id], (err, rows) => {
        if (!err && rows.length > 0) {
            const bloco = rows[0];
            res.send(`
                <html>
                    <head><title>Editar Bloco</title></head>
                    <body>
                        <h1>Editar Bloco</h1>
                        <form action="/editar/${id}" method="POST">
                            <label>Descrição:</label><br>
                            <input type="text" name="descricao" value="${bloco.descricao}"><br><br>
                            <label>Quantidade de Apartamentos:</label><br>
                            <input type="number" name="qtd_apartamentos" value="${bloco.qtd_apartamentos}"><br><br>
                            <input type="submit" value="Salvar">
                        </form>
                        <button onclick="window.location.href='/listar'">Voltar</button>
                    </body>
                </html>
            `);
        } else {
            res.status(404).send("Bloco não encontrado.");
        }
    });
});
       
 
// Atualizar bloco
app.post('/editar/:id', (req, res) => {
    const id = req.params.id;
    const { descricao, qtd_apartamentos } = req.body;
    connection.query('UPDATE blocos SET descricao = ?, qtd_apartamentos = ? WHERE bloco_id = ?',
        [descricao, qtd_apartamentos, id],
        (err, result) => {
            if (err) {
                res.status(500).send("Erro ao editar o bloco.");
            } else {
                res.redirect('/listar');
            }
        }
    );
});
 
// Página inicial
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
 
// Iniciar servidor
app.listen(8083, () => {
    console.log('Servidor rodando na url http://localhost:8083');
});
 