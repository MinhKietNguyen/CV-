const express = require('express');
const sql = require('mssql');
const cors = require('cors');  

const app = express();
const port = 4000;
app.use(express.json());
app.use(cors()); 

const config = {
    server: '26.180.202.16', 
    database: 'test2', 
    user: 'kiet',  
    password: 'kiet123', 
    options: {
        encrypt: false,  
        enableArithAbort: true
    }
};

app.get('/nsx', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM NSX');
        res.json(result.recordset); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/sp', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM SP');
        res.json(result.recordset); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/pc', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM PC');
        res.json(result.recordset); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/laptop', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM Laptop');
        res.json(result.recordset); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete('/:table/:id', async (req, res) => {
    try {
        let { table, id } = req.params;
        console.log(table);
        console.log(id);
        const allowedTables = ['NSX', 'SP', 'PC', 'Laptop'];
        if (!allowedTables.includes(table)) {
            return res.status(400).json({ error: 'Bảng không hợp lệ!' });
        }
        
        let primaryKeyMap = {
            'NSX': 'MaNSX',
            'SP': 'MaSP',
            'PC': 'MaSP',
            'Laptop': 'MaSP'
        };
        let primaryKey = primaryKeyMap[table];
        console.log(1123)
        
        let pool = await sql.connect(config);
        
        let result = await pool.request()
            .input('id', sql.VarChar, id) 
            .query(`DELETE FROM ${table} WHERE ${primaryKey} = @id`);
        
        console.log("Kết quả sau khi DELETE:", result);
        res.json({ message: `Xóa thành công khỏi bảng ${table}!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put('/:table/:id', async (req, res) => {
    try {
        console.log("Params:", req.params); // Debug
        console.log("Body data:", req.body); // Debug
        
        // Get parameters from request
        let { table, id } = req.params;
        // Remove 'Table' suffix if present

        
        const data = req.body;
        
        // Ensure there's data to update
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
        }
        
        // Validate table name
        const allowedTables = ['NSX', 'SP', 'PC', 'Laptop'];
        if (!allowedTables.includes(table)) {
            return res.status(400).json({ error: 'Bảng không hợp lệ!' });
        }
        
        // Map table names to primary key column names
        const primaryKeyMap = {
            'NSX': 'MaNSX',
            'SP': 'MaSP',
            'PC': 'MaSP',
            'Laptop': 'MaSP'
        };
        const primaryKey = primaryKeyMap[table];
        
        // Create SET statements for SQL query
        const setStatements = Object.keys(data)
            .filter(key => key !== primaryKey) // Don't update primary key
            .map(key => `[${key}] = @${key}`) // Add brackets around column names
            .join(', ');
        
        if (!setStatements) {
            return res.status(400).json({ error: 'Không có trường hợp lệ để cập nhật' });
        }
        
        const pool = await sql.connect(config);
        const request = pool.request();
        
        // Add parameters from the data object
        for (const key in data) {
            if (key !== primaryKey) { // Don't update primary key
                request.input(key, data[key]);
            }
        }
        
        // Add ID parameter
        request.input('id', id);
        
        // Build and execute the SQL query
        const tableName = `${table}`;
        const query = `UPDATE [${tableName}] SET ${setStatements} WHERE [${primaryKey}] = @id`;
        console.log("Query:", query); // Debug
        
        const result = await request.query(query);
        console.log("Kết quả sau khi UPDATE:", result);
        
        res.json({
            message: `Cập nhật thành công trong bảng ${table}!`,
            affectedRows: result.rowsAffected[0]
        });
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
        res.status(500).json({ error: err.message });
    }
});
app.post('/:table/:id', async (req, res) => {
    try {
        console.log("Creating new record in table:", req.params.table);
        console.log("Body data:", req.body);
        
        const { table } = req.params;
        const data = req.body;
        console.log(table, data)
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'Không có dữ liệu để thêm mới' });
        }

        const allowedTables = ['NSX', 'SP', 'PC', 'Laptop'];
        if (!allowedTables.includes(table)) {
            return res.status(400).json({ error: 'Bảng không hợp lệ!' });
        }

        const columns = Object.keys(data).map(key => `[${key}]`).join(', ');
        const parameterNames = Object.keys(data).map(key => `@${key}`).join(', ');

        const pool = await sql.connect(config);
        const request = pool.request();

        for (const key in data) {
            request.input(key, data[key]);
        }

        const query = `INSERT INTO [${table}] (${columns}) VALUES (${parameterNames})`;
        console.log("Query:", query);

        const result = await request.query(query);

        res.status(201).json({
            message: `Thêm mới thành công vào bảng ${table}!`,
            affectedRows: result.rowsAffected[0],
            data: data
        });

    } catch (err) {
        console.error("Lỗi khi thêm mới:", err);

        if (err.number === 2627 || err.number === 2601) {
            return res.status(409).json({ 
                error: 'Dữ liệu đã tồn tại, không thể thêm mới trùng lặp'
            });
        }

        res.status(500).json({ error: err.message });
    }
});
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
