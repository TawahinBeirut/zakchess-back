"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPgnToPositions = convertPgnToPositions;
exports.callGpt = callGpt;
exports.createInitRoute = createInitRoute;
exports.createAnalyzeMoveRoute = createAnalyzeMoveRoute;
const chess_js_1 = require("chess.js");
/**
 * Nettoie le PGN pour le rendre compatible avec chess.js
 */
function getCorrectPgn(pgn) {
    // Supprimer toutes les métadonnées (tout ce qui est entre crochets)
    const withoutMetadata = pgn.replace(/\[.*?\]\s*/g, "");
    // Supprimer tout ce qui précède le premier coup numéroté (1.)
    const movesText = withoutMetadata.substring(withoutMetadata.indexOf("1."));
    // Supprimer le résultat de la partie (1-0, 0-1, 1/2-1/2)
    const cleanedPgn = movesText.replace("1-0", "").replace("0-1", "").replace("1/2-1/2", "");
    // Diviser le texte en mots en gérant également les sauts de ligne
    const words = cleanedPgn.split(/\s+/);
    return words.join(" ");
}
/**
 * Convertit un PGN en liste de positions à analyser
 */
function convertPgnToPositions(pgn) {
    try {
        // Initialiser une nouvelle partie d'échecs
        const chess = new chess_js_1.Chess();
        // Charger le PGN nettoyé
        chess.loadPgn(getCorrectPgn(pgn));
        // Récupérer l'historique des coups
        const history = chess.history({ verbose: true });
        // Initialiser le tableau des positions
        const positions = [];
        // Créer une nouvelle instance pour reconstruire la partie coup par coup
        const gameAnalysis = new chess_js_1.Chess();
        // Parcourir chaque coup pour obtenir la position FEN avant le coup
        for (let i = 0; i < history.length; i++) {
            const move = history[i];
            const turn = (i % 2 === 0) ? 'w' : 'b';
            // Capturer la position FEN avant de jouer le coup
            const fen = gameAnalysis.fen();
            // Ajouter la position au tableau
            positions.push({
                fen: fen,
                playedMove: move.san,
                turn: turn,
                moveIndex: i
            });
            // Jouer le coup pour préparer la position suivante
            gameAnalysis.move(move.san);
        }
        return positions;
    }
    catch (error) {
        console.error("Erreur lors de la conversion du PGN:", error);
        throw new Error("Le format PGN fourni est invalide ou corrompu");
    }
}
/**
 * Appel à l'API OpenAI pour analyser une position
 */
async function callGpt(openai, position) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Tu es un expert en échecs. À partir d'une position FEN, tu vas analyser le coup joué en utilisant Stockfish pour déterminer l'évaluation, le meilleur coup à jouer et la classification du coup joué (par exemple, 'Brillant', 'Très bon', 'Erreur', etc.). Ensuite, tu rédiges une analyse complète et structurée du coup joué, avec les informations suivantes :

1. Évaluation du moteur : [évaluation numérique de Stockfish]
2. Classification du coup joué : [classification comme 'Brillant', 'Très bon', 'Erreur', etc.]
3. Meilleur coup selon Stockfish : [meilleur coup suggéré]
4. Analyse détaillée sous ce format :
   - Les Noirs ont un [avantage/désavantage] ([évaluation numérique]) mais doivent être attentifs à [coup critique des Blancs]
   - Explications de la meilleure ligne de Stockfish NNUE :
     ⚫ [meilleure ligne donnée avec coups successifs, formaté]
     [justification du premier coup]
   - Menaces principales :
     [coup des Blancs avec évaluation approximative]
     [Effet sur les plans ou coups forts des Noirs]
   - Comment trouver le meilleur coup ?
     Idée : [Ce que les Noirs veulent faire à moyen terme]
     Problème : [Pourquoi une autre suite serait moins bonne ou illégale]
     Solution : [Plan corrigé, illustré avec une ligne]
   - Faire attention aux points suivants :
     - [éléments stratégiques ou tactiques clés dans la position]
   - 🧠 Point théorique :
     [explication sur le type d'ouverture ou la stratégie centrale dans cette position]
   - 🎯 Thèmes à travailler :
     Liste uniquement les thèmes ou motifs tactiques/stratégiques pertinents dans la position actuelle (par exemple : fourchette, clouage, case faible, initiative, rupture de pion, coordination des pièces, etc.). Ne pas inventer ou généraliser.
   - 📌 Analyse du coup joué :
     Compare le coup réellement joué avec le meilleur coup suggéré par Stockfish. Explique pourquoi c'est bon ou non, ce que ça rate ou compromet, et comment le joueur pourrait mieux réagir dans une situation similaire à l'avenir.

Sois pédagogique et clair, utilise un langage simple mais précis. Toujours illustrer avec des variantes concrètes. Ne donne aucune autre sortie que ce format.`
                },
                {
                    role: "user",
                    content: `FEN : ${position.fen}\nTour de jeu : ${position.turn}\nCoup joué : ${position.playedMove}`
                }
            ]
        });
        return completion.choices[0].message.content || "Aucune analyse disponible";
    }
    catch (error) {
        console.error('Erreur lors de l\'appel à OpenAI:', error);
        throw new Error(`Échec de l'analyse pour le coup ${position.playedMove}`);
    }
}
// Créer le middleware pour l'init route qui renvoie juste la liste des coups sans les analyser
function createInitRoute(openai) {
    return async (req, res) => {
        if (!req.body) {
            return res.status(400).json({ error: 'Corps de requête vide ou invalide' });
        }
        try {
            const { pgn } = req.body;
            if (!pgn) {
                return res.status(400).json({ error: 'PGN requis pour l\'analyse' });
            }
            // Étape 1: Convertir le PGN en positions
            const positions = convertPgnToPositions(pgn);
            // Si aucune position n'a été trouvée, retourner une erreur
            if (positions.length === 0) {
                return res.status(400).json({
                    error: 'Aucun coup valide trouvé dans le PGN fourni'
                });
            }
            // Préparer la liste des coups sans analyse
            const movesList = positions.map(position => ({
                fen: position.fen,
                playedMove: position.playedMove,
                turn: position.turn,
                moveIndex: position.moveIndex
            }));
            // Renvoyer la liste des coups
            res.json({
                totalMoves: positions.length,
                moves: movesList
            });
        }
        catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            res.status(500).json({
                error: 'Erreur lors de l\'analyse de la partie',
                details: error instanceof Error ? error.message : "Erreur inconnue"
            });
        }
    };
}
// Créer le middleware pour analyser un coup spécifique
function createAnalyzeMoveRoute(openai) {
    return async (req, res) => {
        if (!req.body) {
            return res.status(400).json({ error: 'Corps de requête vide ou invalide' });
        }
        try {
            const { fen, playedMove, turn, moveIndex } = req.body;
            if (!fen || !playedMove || !turn || moveIndex === undefined) {
                return res.status(400).json({
                    error: 'Tous les paramètres sont requis (fen, playedMove, turn, moveIndex)'
                });
            }
            const position = { fen, playedMove, turn, moveIndex };
            // Analyser le coup
            try {
                const analysis = await callGpt(openai, position);
                res.json({
                    fen,
                    playedMove,
                    turn,
                    moveIndex,
                    analysis
                });
            }
            catch (error) {
                console.error(`Échec de l'analyse pour ${playedMove}:`, error);
                res.status(500).json({
                    fen,
                    playedMove,
                    turn,
                    moveIndex,
                    error: error instanceof Error ? error.message : "Erreur inconnue"
                });
            }
        }
        catch (error) {
            console.error('Erreur lors de l\'analyse du coup:', error);
            res.status(500).json({
                error: 'Erreur lors de l\'analyse du coup',
                details: error instanceof Error ? error.message : "Erreur inconnue"
            });
        }
    };
}
