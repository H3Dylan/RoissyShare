const express = require('express');
const { register, verifySiret, login } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/sirene/:siret', verifySiret);

module.exports = router;
