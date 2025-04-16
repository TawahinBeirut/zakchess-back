import { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
import express from "express";
import OpenAI from "openai";
import { createInitRoute, createAnalyzeMoveRoute } from "./analyze"
import cors from 'cors';

// Charger les variables d'environnement au tout début
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser le JSON et gérer les CORS
app.use(express.json({ limit: '10mb' }));
app.use(cors());

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

function verifyApiKey(req: Request, res: Response, next: NextFunction) {
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
const openai = new OpenAI({
  apiKey: GPT_API_KEY
});

// Route pour initialiser l'analyse (liste de coups sans analyses)
app.post('/init-analysis', createInitRoute(openai));

// Route pour analyser un coup spécifique
app.post('/analyze-move', createAnalyzeMoveRoute(openai));

// Route de santé
app.get('/', (req: Request, res: Response) => {
  res.send('API d\'analyse d\'échecs opérationnelle');
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur écoute sur http://localhost:${port}`);
});