"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const analyze_1 = require("./analyze");
const cors_1 = __importDefault(require("cors"));
// Charger les variables d'environnement au tout début
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware pour parser le JSON et gérer les CORS
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cors_1.default)());
// Vérifier si les variables d'environnement sont chargées
const API_KEY = process.env.API_KEY;
const GPT_API_KEY = process.env.GPT_API_KEY;
// Log pour déboguer les variables d'environnement
console.log('API_KEY définie:', API_KEY ? 'Oui' : 'Non');
console.log('GPT_API_KEY définie:', GPT_API_KEY ? 'Oui' : 'Non');
if (!API_KEY) {
    console.warn('Attention: API_KEY n\'est pas définie dans le fichier .env');
}
if (!GPT_API_KEY) {
    console.warn('Attention: GPT_API_KEY n\'est pas définie dans le fichier .env');
}
function verifyApiKey(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Clé API manquante ou mal formatée' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== API_KEY) {
        return res.status(403).json({ error: 'Clé API invalide' });
    }
    next();
}
// Middleware d'authentification
app.use(verifyApiKey);
// Initialiser le client OpenAI
const openai = new openai_1.default({
    apiKey: GPT_API_KEY
});
// Route pour initialiser l'analyse (liste de coups sans analyses)
app.post('/init-analysis', (0, analyze_1.createInitRoute)(openai));
// Route pour analyser un coup spécifique
app.post('/analyze-move', (0, analyze_1.createAnalyzeMoveRoute)(openai));
// Route de santé
app.get('/', (req, res) => {
    res.send('API d\'analyse d\'échecs opérationnelle');
});
// Démarrer le serveur
app.listen(port, () => {
    console.log(`Le serveur écoute sur http://localhost:${port}`);
});
