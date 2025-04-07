from openai import OpenAI,RateLimitError,InternalServerError,APIConnectionError,AuthenticationError
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GPT_API_KEY")
client = OpenAI(api_key=api_key)

class GPT_ANALYSE_RESPONSE:
    
    def __init__(self,error:bool,data=None,err_msg:str=None):
        self.error = error
        self.data = data
        self.err_msg = err_msg
    

def gpt_analyse_move(fen:str,best_move:str,evaluation:float,classification:str)->GPT_ANALYSE_RESPONSE :
    
    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                    {
                    "role": "system",
                    "content": "Tu es un expert en échecs. À partir d'une position FEN, du meilleur coup selon Stockfish, et d’une classification du coup joué (comme 'Brillant', 'Très bon', etc.), tu rédiges une analyse dans ce format structuré :\n\nLes Noirs ont un [avantage/désavantage] ([évaluation numérique]) mais doivent être attentifs à [coup critique des Blancs]\n\nExplications de la meilleure ligne de Stockfish NNUE\n⚫ [meilleure ligne donnée avec coups successifs, formaté]\n[justification du premier coup]\n\nMenaces principales\n[coup des Blancs avec évaluation approximative]\n[Effet sur les plans ou coups forts des Noirs]\n\nComment trouver le meilleur coup ?\nIdée\n[Ce que les Noirs veulent faire à moyen terme]\nProblème\n[Pourquoi une autre suite serait moins bonne ou illégale]\nSolution\n[Plan corrigé, illustré avec une ligne]\n\nFaire attention aux points suivants\n- [éléments stratégiques ou tactiques clés dans la position]\n\n🧠 Point théorique :\n[explication sur le type d’ouverture ou la stratégie centrale dans cette position]\n\n🎯 Thèmes à travailler :\nListe uniquement les thèmes ou motifs tactiques/stratégiques présents dans cette position (par exemple : fourchette, clouage, case faible, contrôle du centre, rupture de pion, coordination des pièces, etc.).\nN’indique que ce qui est pertinent dans la position actuelle. Ne pas inventer ou généraliser.\n\nSois pédagogique et clair, utilise un langage simple mais précis. Toujours illustrer avec des variantes concrètes. Ne donne aucune autre sortie que ce format."
                    }
            ,
                {
                    "role": "user",
                    "content": f'FEN : {fen}\nMeilleur coup: {best_move}\nÉvaluation: {evaluation}\nClassification: {classification}'
                }
            ]
        )
    except RateLimitError:
        return GPT_ANALYSE_RESPONSE(
            error=True,
            err_msg="Plus de credit sur le compte gpt"
        )
    except InternalServerError:
        return GPT_ANALYSE_RESPONSE(
            error=True,
            err_msg="Les Servs GPT marchent pas"
        )
    except APIConnectionError:
        return GPT_ANALYSE_RESPONSE(
            error=True,
            err_msg="L'application n'arrive pas à se connecter à l'api GPT"
        )
    except AuthenticationError:
        return GPT_ANALYSE_RESPONSE(
            error=True,
            err_msg="Mauvaise api key de gpt"
        )
    else:
        return GPT_ANALYSE_RESPONSE(
            error=True,
            err_msg="JSP"
        )


