const fs = require('fs'),
    path = require('path'),
    pg = require('pg');

if (process.env.DATABASE_URL) {
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true
    });

    exports.load = async() => {
        await client.connect();
        try {
            const res = client.query('SELECT name,joined,garlicKnots,payer from users;');
            const users = [];
            for (let row of res.rows) {
                users.push({
                    name: row.name,
                    joined: row.joined == 'true',
                    garlicKnots: row.garlicKnots == 'true',
                    payer: row.payer == 'true'
                });
            }
            return {
                users: users,
                npizzas: Math.ceil((users.length * 3.0) / 8)
            };
        }
        catch(e) {
            await client.query('CREATE TABLE users (name text, joined text, garlicKnots text, payer text);');
            throw e;
        }
    };

    exports.backup = async(users, npizzas) => {
        await client.query('DELETE FROM users;');
        for (let user of users) {
            await client.query('INSERT INTO users(name,joined,garlicKnots,payer) VALUES($1,$2,$3,$4);', [
                user.name,
                user.joined.toString(),
                user.garlicKnots.toString(),
                user.payer.toString()
            ]);
        }
        return true;
    };
}
else {
    const backupLocation = path.join(process.cwd(), 'backup.json');

    exports.load = () => {
        const data = fs.readFileSync(backupLocation, 'utf8');
        return JSON.parse(data.replace(/^\uFEFF/, ''));
    };

    exports.backup = (users, npizzas) => {
        fs.writeFileSync(backupLocation, JSON.stringify({
            users: users.users,
            npizzas: npizzas
        }), 'utf8');
    };
}
