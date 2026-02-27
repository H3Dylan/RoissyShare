const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'roissyshare-super-secret-key-changer-en-prod';

function protect(req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Non autorisé, pas de token fourni' });
    }
}

module.exports = { protect, JWT_SECRET };
