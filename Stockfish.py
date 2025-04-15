import chess#https://github.com/niklasf/python-chess

import math
from stockfish import Stockfish
from enum import Enum
from openings import openings

stockfish = Stockfish("./stockfish/stockfish-ubuntu-x86-64-avx2")
stockfish.set_depth(20)#How deep the AI looks
stockfish.set_skill_level(20)#Highest rank stockfish
board = chess.Board()


class StockFishResponse :

    def __init__(self,error:bool,is_opening:str=None,best_move:str=None,evaluation:float=None,err_msg:str=None):
        self.error = error
        self.best_move = best_move
        self.evaluation= evaluation
        self.err_msg = err_msg

class MoveClassification(Enum):
    BLUNDER = "blunder"
    MISTAKE = "mistake"
    INACCURACY = "inaccuracy"
    GOOD = "good"
    EXCELLENT = "excellent"
    BEST = "best"
    BOOK = "book"
    GREAT = "great"
    BRILLIANT = "brilliant"

class Move:

    def __init__(self,fen:str,move:str,move_classification:MoveClassification,move_name:str=None,win_perc:float=None,best_move_announced:str=None):
        self.fen = fen
        self.win_perc = win_perc
        self.move = move
        self.best_move_announced = best_move_announced
        self.move_classification = move_classification
        self.move_name = move_name





def ceils_number(value: float, min_value: float, max_value: float) -> float:
    return max(min(value, max_value), min_value)

def get_win_percentage_from_cp(cp: float) -> float:
    cp_ceiled = ceils_number(cp, -1000, 1000)
    MULTIPLIER = -0.00368208
    win_chances = 2 / (1 + math.exp(MULTIPLIER * cp_ceiled)) - 1
    return 50 + 50 * win_chances

def get_win_percentage_from_mate(mate: float) -> float:
    mate_inf = float('inf') * mate  # +∞ si mate > 0, -∞ si mate < 0
    return get_win_percentage_from_cp(mate_inf)


def get_classification(win_perc)->MoveClassification:
    return MoveClassification.BEST

def guess_move(fen1,fen2) : 
        
    board = chess.Board
    board.set_board_fen(fen1)
    board2 = chess.Board
    board2.set_board_fen(fen2)

    for move in board.legal_moves:
        board.push(move)
        if board.board_fen() == board2.board_fen():
            return board.peek()
        board.pop()  
    else:
        return False

def generate_analysis(fenList:list[str]):
        
    try:
        white_to_move = True,
        white_moves:list[Move] = [],
        black_moves:list[Move] = []
        index = 0
        old_fen = chess.Board().board_fen()
        for fen in fenList:
            board.set_fen(fen=fen)
            current_move = guess_move(old_fen,fen)

            if current_move == False:
                raise ValueError("Board not working")

            # Verifier si c une ouverture en premier || Verifier si c un moove qui respecte l'ouverture ou pas

            opening = next((el for el in openings if el["fen"] == fen), None)
            if (opening):
                      move = Move(
                                  fen=fen,
                                  move=current_move,
                                  move_classification=MoveClassification.BOOK,
                                  move_name=opening["name"]
                                  )
                      if white_to_move:
                          white_moves.append(move)
                      else:
                          black_moves.append(move)
            else:
                # Determiner la classification du moov
                stockfish.set_fen_position(board.fen())
                best_move:StockFishResponse = stockfish.get_best_move()

            if white_to_move:
                index+=1
            
            white_to_move = not white_to_move
            old_fen = fen

            # best_move = stockfish.get_best_move()
            # evaluation = stockfish.get_evaluation()

            # if evaluation["type"] == "mate" : 
            #     win_perc = get_win_percentage_from_mate(evaluation["value"])
            # else : 
            #     win_perc = get_win_percentage_from_cp(evaluation["value"])
            
            # classification = get_classification(win_perc)
        
        
    except: 
        print("erreor")
        return StockFishResponse(
            error=True,
            err_msg="Erreur au niveau de stockfish inconnue"
        )

    return

generate_analysis('caca')