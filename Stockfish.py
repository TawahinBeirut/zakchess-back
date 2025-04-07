import chess#https://github.com/niklasf/python-chess

from stockfish import Stockfish
stockfish = Stockfish("./stockfish/stockfish-ubuntu-x86-64-avx2")
stockfish.set_depth(20)#How deep the AI looks
stockfish.set_skill_level(20)#Highest rank stockfish
board = chess.Board()

class StockFishResponse :

    def __init__(self,error:bool,best_move:str=None,evaluation:float=None,err_msg:str=None):
        self.error = error
        self.best_move = best_move
        self.evaluation= evaluation
        self.err_msg = err_msg
    

def generate_stockfish_analysis(fen:str):
        
    try:
        board.set_fen("rn1qkbnr/ppp1pppp/8/3p4/3PP1b1/8/PPP2PPP/RNB1KBNR b KQkq d3 0 3")
        stockfish.set_fen_position(board.fen())
        best_move = stockfish.get_best_move()
        evaluation = stockfish.get_evaluation()
        white_to_move = 'True'
        if board.turn() == chess.BLACK:
            white_to_move = 'False' 
        print(best_move,evaluation["value"],True)
    except: 
        print("erreor")
        return StockFishResponse(
            error=True,
            err_msg="Erreur au niveau de stockfish inconnue"
        )

    return

generate_stockfish_analysis('caca')