const bodyParser = require("body-parser");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
//require("dotenv").config();

const app = express();

app.use(bodyParser.json());

const db = new sqlite3.Database("./players.db", (err) =>{
    if (err) {
        console.error("Error opening database: ", err.message);
    }else{
        console.log("Connected to the SQLite database.")

        db.run(`
                CREATE TABLE IF NOT EXISTS players(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    ac INTEGER,
                    hp INTEGER,
                    pp INTEGER
                )
            `);
    }
});

app.get("/api/players", (req, res)=>{
    db.all("SELECT * FROM players", (err, rows)=>{
        if(err){
            console.error("Error retrieving players: ", err.message);
            res.status(500).send("Error retrieving players.")
        }else{
            res.json(rows);
        }
    })
})

app.post("/api/players", (req,res) =>{
    const {name, ac, hp, pp} = req.body;
    const query = `INSERT INTO players (name, ac, hp, pp)
                   VALUES (?,?,?,?)`;
    db.run(query, [name,ac,hp,pp], function (err) {
        if(err){
            console.error("Error adding player: ", err.message);
            res.status(500).send("Error adding player.");
        }else{
            const newPlayer = {
                id: this.lastID,
                name,
                ac,
                hp,
                pp
            };
            res.status(201).json(newPlayer);
        }
    })
})

app.put("/api/players/:id", (req,res) =>{
    const { id } = req.params;
    const { name, ac, hp, pp} = req.body;

    const query = `UPDATE players SET name = ?, ac = ?, hp = ?, pp = ? WHERE id = ?`;
    db.run(query,[name,ac,hp,pp,id],function (err){
        if(err){
            console.error("Error updating player: ", err.message);
            res.status(500).send("Error updating player.");
        }else{
            if (this.changes > 0){
                res.json({
                    id,
                    name,
                    ac,
                    hp,
                    pp
                });
            }else{
                res.status(404).send("Player not found");
            }
        }
    })
})

app.delete("/api/players/:id", (req,res)=>{
    const { id } = req.params
    const query = `DELETE FROM players WHERE id = ?`;

    db.run(query, [id], function (err) {
        if(err){
            console.error("Error deleting player: ", err.message);
            res.status(500).send("Error deleting player.");
        }else{
            if (this.changes > 0){
                res.json({ message: "Player deleted"})
            }else{
                res.status(404).send("Player not found");
            }
        }
    })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
})