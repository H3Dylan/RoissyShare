const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getCompanyInfoBySiret } = require('../services/insee.service');

const JWT_SECRET = process.env.JWT_SECRET || 'roissyshare-super-secret-key-changer-en-prod';


async function register(req, res) {
    try {
        const { email, password, firstname, lastname, siret } = req.body;

        if (!email || !password || !firstname || !lastname || !siret) {
            return res.status(400).json({ error: "Tous les champs sont requis." });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        let companyInfo;
        try {
            companyInfo = await getCompanyInfoBySiret(siret);
        } catch (sireneError) {
            return res.status(400).json({ error: sireneError.message });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (prismaCtx) => {
            let structure = await prismaCtx.structure.findUnique({ where: { siret: companyInfo.siret } });

            if (!structure) {
                structure = await prismaCtx.structure.create({
                    data: {
                        siret: companyInfo.siret,
                        name: companyInfo.name,
                        address: companyInfo.address || "Adresse non fournie",
                        type: 'BOTH',
                        latitude: companyInfo.latitude || 0,
                        longitude: companyInfo.longitude || 0,
                    }
                });

                if (companyInfo.latitude && companyInfo.longitude) {
                    await prismaCtx.$executeRaw`
              UPDATE "Structure" 
              SET location = ST_SetSRID(ST_MakePoint(${companyInfo.longitude}, ${companyInfo.latitude}), 4326) 
              WHERE id = ${structure.id};
            `;
                }
            }

            const user = await prismaCtx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstname,
                    lastname,
                    structureId: structure.id
                }
            });

            return { user, structure };
        });

        const { password: _, ...userWithoutPassword } = result.user;

        res.status(201).json({
            message: "Inscription réussie",
            user: userWithoutPassword,
            structure: result.structure
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Erreur interne du serveur lors de l'inscription." });
    }
}

async function verifySiret(req, res) {
    try {
        const { siret } = req.params;
        if (!siret) {
            return res.status(400).json({ error: "Le SIRET est requis." });
        }
        const info = await getCompanyInfoBySiret(siret);
        res.json(info);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Veuillez fournir un email et un mot de passe." });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { structure: true } // On récupère les infos de l'entreprise
        });

        if (!user) {
            return res.status(401).json({ error: "Identifiants incorrects." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Identifiants incorrects." });
        }

        // Génération du JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                structureId: user.structureId
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: "Connexion réussie",
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Erreur interne lors de la connexion." });
    }
}

module.exports = { register, verifySiret, login };
