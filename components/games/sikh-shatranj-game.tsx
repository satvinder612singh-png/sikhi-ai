"use client";

import React, { useState, useMemo } from "react";
import type { BadgeId } from "@/lib/games-economy";

type PieceType = "jathedar" | "akali" | "qila" | "misl" | "ghorchurra" | "sipahi";
type Side = "khalsa" | "opponent";

type Piece = {
  type: PieceType;
  side: Side;
};

type Board = (Piece | null)[][];

type Coord = { r: number; c: number };

type Move = {
  from: Coord;
  to: Coord;
  captured?: Piece | null;
  promotion?: PieceType;
};

type HistoricalDispatch = {
  id: string;
  triggerPiece: PieceType | "endgame";
  title: string;
  era: string;
  gurmukhi: string;
  summary: string;
  tacticalLesson: string;
};

const PIECE_META: Record<
  PieceType,
  {
    name: string;
    gurmukhi: string;
    shortGurmukhi: string;
    chessEquivalent: string;
    value: number;
    movementRule: string;
  }
> = {
  jathedar: {
    name: "Jathedar",
    gurmukhi: "ਜਥੇਦਾਰ",
    shortGurmukhi: "ਜ",
    chessEquivalent: "Supreme Commander (King)",
    value: 1000,
    movementRule: "Moves 1 square in any direction. Protect your Jathedar at all costs.",
  },
  akali: {
    name: "Akali Nihang",
    gurmukhi: "ਅਕਾਲੀ ਨਿਹੰਗ",
    shortGurmukhi: "ਅ",
    chessEquivalent: "Vanguard General (Queen)",
    value: 90,
    movementRule: "Moves any number of unobstructed squares orthogonally or diagonally.",
  },
  qila: {
    name: "Qila Fort",
    gurmukhi: "ਕਿਲਾ",
    shortGurmukhi: "ਕ",
    chessEquivalent: "Bastion & Artillery (Rook)",
    value: 50,
    movementRule: "Moves any number of unobstructed squares horizontally or vertically.",
  },
  ghorchurra: {
    name: "Ghorchurra Cavalry",
    gurmukhi: "ਘੋੜਚੜ੍ਹਾ",
    shortGurmukhi: "ਘ",
    chessEquivalent: "Dhai Phat Cavalry (Knight)",
    value: 35,
    movementRule: "Leaps in an L-shape (2 squares one way, 1 perpendicular) over any piece.",
  },
  misl: {
    name: "Misl Vanguard",
    gurmukhi: "ਮਿਸਲ",
    shortGurmukhi: "ਮ",
    chessEquivalent: "Flanking Column (Bishop)",
    value: 32,
    movementRule: "Moves any number of unobstructed squares diagonally.",
  },
  sipahi: {
    name: "Khalsa Sipahi",
    gurmukhi: "ਸਿਪਾਹੀ",
    shortGurmukhi: "ਸ",
    chessEquivalent: "Saint-Soldier Infantry (Pawn)",
    value: 12,
    movementRule:
      "Advances 1 square forward, captures 1 square diagonally forward, and promotes to Akali Nihang on the 6th rank.",
  },
};

const HISTORICAL_DISPATCHES: Record<string, HistoricalDispatch> = {
  ghorchurra: {
    id: "dhai-phat",
    triggerPiece: "ghorchurra",
    title: "Dhai Phat (Hit, Turn & Strike)",
    era: "18th Century CE • Misl Confederacy",
    gurmukhi: "ਢਾਈ ਫੱਟ ਜੰਗੀ ਹੁਨਰ",
    summary:
      "During the 18th-century campaigns against Ahmad Shah Abdali, Sikh Ghorchurra horsemen perfected 'Dhai Phat' (two-and-a-half strokes): charging swiftly to strike supply lines (1), feigning retreat to draw heavy imperial cavalry out of formation (1/2), and wheeling back suddenly to deliver the decisive blow (1).",
    tacticalLesson:
      "Mobility and timing defeat numerical superiority. Your Ghorchurra Cavalry leaps over static defenses just as the Misls bypassed entrenched artillery.",
  },
  qila: {
    id: "chamkaur-garhi",
    triggerPiece: "qila",
    title: "Battle of Chamkaur (1704 CE)",
    era: "December 1704 • Kachi Garhi (Mud Fortress)",
    gurmukhi: "ਚਮਕੌਰ ਦੀ ਗੜ੍ਹੀ",
    summary:
      "At the elevated mud fortress (Garhi) of Chamkaur, Guru Gobind Singh Ji and 40 Khalsa warriors—led by Sahibzada Ajit Singh Ji and Sahibzada Jujhar Singh Ji—held off a massive Mughal coalition by sending disciplined five-man Jathas out from the high walls.",
    tacticalLesson:
      "A well-positioned Qila (Fort) anchors entire files and ranks, forcing the opponent to expend heavy resources to breach a single choke point.",
  },
  akali: {
    id: "multan-phula-singh",
    triggerPiece: "akali",
    title: "Akali Phula Singh Ji & The Vanguard Charge",
    era: "1818 & 1823 CE • Siege of Multan & Battle of Nowshera",
    gurmukhi: "ਅਕਾਲੀ ਫੂਲਾ ਸਿੰਘ ਜੀ",
    summary:
      "As Jathedar of Sri Akal Takht Sahib and commander of the Akali Nihang shock troops, Akali Phula Singh Ji led fearless frontal breakthroughs at Multan (1818) and Nowshera (1823), turning the tide of battle when conventional formations stalled.",
    tacticalLesson:
      "The Akali Nihang commands both orthogonal and diagonal vectors—decisive when deployed at the center of the board.",
  },
  misl: {
    id: "muktsar-mai-bhago",
    triggerPiece: "misl",
    title: "Battle of Muktsar (Khidrana Dhaab, 1705 CE)",
    era: "May 1705 • Arid Plains of Malwa",
    gurmukhi: "ਖਿਦਰਾਣੇ ਦੀ ਢਾਬ (ਮੁਕਤਸਰ)",
    summary:
      "At Khidrana Dhaab, Mai Bhago Ji and the Chali Mukte (Forty Liberated Ones) secured the only water reservoir in the desert while Guru Gobind Singh Ji rained arrows from the high Tibbi (mound), forcing Wazir Khan's army to retreat from thirst and flanking fire.",
    tacticalLesson:
      "The Misl Vanguard cuts across long diagonal sightlines, controlling key terrain from afar.",
  },
  jathedar: {
    id: "saragarhi-1897",
    triggerPiece: "jathedar",
    title: "Battle of Saragarhi (1897 CE)",
    era: "12 September 1897 • Samana Ridge",
    gurmukhi: "ਸਾਰਾਗੜ੍ਹੀ ਦਾ ਸਾਕਾ",
    summary:
      "Under the command of Havildar Ishar Singh, 21 soldiers of the 36th Sikhs defended the heliograph signal post of Saragarhi against over 10,000 Pashtun tribesmen for seven hours, maintaining communication between Fort Lockhart and Fort Gulistan to the very last breath.",
    tacticalLesson:
      "In Sikh Shatranj, the Jathedar embodies command unity—once the Jathedar falls, the field is decided.",
  },
  sipahi: {
    id: "fauj-i-khas",
    triggerPiece: "sipahi",
    title: "Fauj-i-Khas: The Disciplined Khalsa Infantry",
    era: "1801 – 1839 CE • Sarkar-i-Khalsa",
    gurmukhi: "ਫ਼ੌਜ-ਏ-ਖ਼ਾਸ",
    summary:
      "Maharaja Ranjit Singh transformed the Khalsa Sipahi infantry into one of Asia's most disciplined combined-arms forces, capable of steady volley fire and rapid promotion based on merit rather than birth.",
    tacticalLesson:
      "Never underestimate a Khalsa Sipahi—reaching the 6th rank elevates a Sipahi into an Akali Nihang!",
  },
};

function createInitialBoard(): Board {
  const backOrder: PieceType[] = [
    "qila",
    "ghorchurra",
    "misl",
    "akali",
    "jathedar",
    "ghorchurra",
  ];

  const board: Board = Array.from({ length: 6 }, () => Array(6).fill(null));

  // Row 0: Opponent back rank
  for (let c = 0; c < 6; c++) {
    board[0][c] = { type: backOrder[c], side: "opponent" };
    board[1][c] = { type: "sipahi", side: "opponent" };
  }

  // Row 4 & 5: Khalsa player ranks
  for (let c = 0; c < 6; c++) {
    board[4][c] = { type: "sipahi", side: "khalsa" };
    board[5][c] = { type: backOrder[c], side: "khalsa" };
  }

  return board;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 6 && c >= 0 && c < 6;
}

function generateMovesForSquare(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: Move[] = [];
  const { type, side } = piece;

  const addMove = (tr: number, tc: number) => {
    if (!inBounds(tr, tc)) return false;
    const target = board[tr][tc];
    if (!target) {
      moves.push({ from: { r, c }, to: { r: tr, c: tc } });
      return true;
    }
    if (target.side !== side) {
      moves.push({ from: { r, c }, to: { r: tr, c: tc }, captured: target });
    }
    return false;
  };

  if (type === "sipahi") {
    const dir = side === "khalsa" ? -1 : 1;
    const nr = r + dir;
    if (inBounds(nr, c) && !board[nr][c]) {
      const promo = nr === 0 || nr === 5 ? "akali" : undefined;
      moves.push({ from: { r, c }, to: { r: nr, c }, promotion: promo });
    }
    for (const dc of [-1, 1]) {
      const nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc] && board[nr][nc]!.side !== side) {
        const promo = nr === 0 || nr === 5 ? "akali" : undefined;
        moves.push({
          from: { r, c },
          to: { r: nr, c: nc },
          captured: board[nr][nc],
          promotion: promo,
        });
      }
    }
  } else if (type === "ghorchurra") {
    const jumps = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
    for (const [dr, dc] of jumps) {
      addMove(r + dr, c + dc);
    }
  } else if (type === "jathedar") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) addMove(r + dr, c + dc);
      }
    }
  } else {
    const dirs: [number, number][] = [];
    if (type === "qila" || type === "akali") {
      dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }
    if (type === "misl" || type === "akali") {
      dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }
    for (const [dr, dc] of dirs) {
      let tr = r + dr;
      let tc = c + dc;
      while (inBounds(tr, tc)) {
        const cont = addMove(tr, tc);
        if (!cont) break;
        tr += dr;
        tc += dc;
      }
    }
  }

  return moves;
}

function generateAllMoves(board: Board, side: Side): Move[] {
  const all: Move[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c]?.side === side) {
        all.push(...generateMovesForSquare(board, r, c));
      }
    }
  }
  return all;
}

function applyMove(board: Board, move: Move): Board {
  const next = cloneBoard(board);
  const moving = next[move.from.r][move.from.c];
  next[move.from.r][move.from.c] = null;
  if (moving) {
    next[move.to.r][move.to.c] = {
      type: move.promotion ?? moving.type,
      side: moving.side,
    };
  }
  return next;
}

function hasJathedar(board: Board, side: Side): boolean {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const p = board[r][c];
      if (p && p.side === side && p.type === "jathedar") return true;
    }
  }
  return false;
}

function evaluateBoard(board: Board): number {
  let score = 0;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const p = board[r][c];
      if (!p) continue;
      const base = PIECE_META[p.type].value;
      const centerBonus = (r >= 2 && r <= 3 && c >= 2 && c <= 3) ? 3 : 0;
      const advanceBonus = p.side === "opponent" ? r * 1.5 : (5 - r) * 1.5;
      const val = base + centerBonus + advanceBonus;
      score += p.side === "opponent" ? val : -val;
    }
  }
  return score;
}

function chooseBestOpponentMove(board: Board): Move | null {
  const moves = generateAllMoves(board, "opponent");
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const m of moves) {
    // Immediate Jathedar capture wins outright
    if (m.captured?.type === "jathedar") return m;

    const afterOpponent = applyMove(board, m);
    const khalsaReplies = generateAllMoves(afterOpponent, "khalsa");
    let worstReplyScore = Infinity;

    if (khalsaReplies.length === 0) {
      worstReplyScore = evaluateBoard(afterOpponent);
    } else {
      for (const reply of khalsaReplies) {
        const afterReply = applyMove(afterOpponent, reply);
        const s = evaluateBoard(afterReply);
        if (s < worstReplyScore) worstReplyScore = s;
      }
    }

    // Add slight tactical variety
    const jitter = (Math.random() - 0.5) * 1.8;
    const total = worstReplyScore + jitter;
    if (total > bestScore) {
      bestScore = total;
      bestMove = m;
    }
  }

  return bestMove;
}

export function SikhShatranjGame({
  onEarnCoins,
}: {
  onEarnCoins: (params: {
    game: string;
    delta: number;
    reason: string;
    incrementStreak?: boolean;
    resetStreak?: boolean;
    unlockBadge?: BadgeId;
  }) => void;
}) {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [selected, setSelected] = useState<Coord | null>(null);
  const [turn, setTurn] = useState<Side>("khalsa");
  const [status, setStatus] = useState<"playing" | "khalsa-won" | "opponent-won" | "draw">(
    "playing"
  );
  const [moveCount, setMoveCount] = useState(0);
  const [moveLog, setMoveLog] = useState<string[]>([
    "Battle commenced at the 6x6 Khalsa Tactical Grid. Select any gold Khalsa unit to move.",
  ]);
  const [activeDispatch, setActiveDispatch] = useState<HistoricalDispatch>(
    HISTORICAL_DISPATCHES.ghorchurra
  );
  const [lastMoveCoords, setLastMoveCoords] = useState<{ from: Coord; to: Coord } | null>(
    null
  );
  const [rewardClaimedForMatch, setRewardClaimedForMatch] = useState(false);

  const legalMovesForSelected = useMemo(() => {
    if (!selected || status !== "playing" || turn !== "khalsa") return [];
    return generateMovesForSquare(board, selected.r, selected.c);
  }, [board, selected, status, turn]);

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelected(null);
    setTurn("khalsa");
    setStatus("playing");
    setMoveCount(0);
    setMoveLog(["New campaign initialized. Command your Khalsa ranks with Dhai Phat precision."]);
    setLastMoveCoords(null);
    setRewardClaimedForMatch(false);
  };

  const handleSquareClick = (r: number, c: number) => {
    if (status !== "playing" || turn !== "khalsa") return;

    const clickedPiece = board[r][c];

    // Check if clicking a legal destination for currently selected piece
    if (selected) {
      const chosenMove = legalMovesForSelected.find(
        (m) => m.to.r === r && m.to.c === c
      );
      if (chosenMove) {
        executePlayerAndOpponentTurn(chosenMove);
        return;
      }
    }

    // Otherwise select own piece
    if (clickedPiece && clickedPiece.side === "khalsa") {
      setSelected({ r, c });
    } else {
      setSelected(null);
    }
  };

  const executePlayerAndOpponentTurn = (playerMove: Move) => {
    const movingPiece = board[playerMove.from.r][playerMove.from.c]!;
    const afterPlayer = applyMove(board, playerMove);
    setSelected(null);
    setLastMoveCoords({ from: playerMove.from, to: playerMove.to });

    const playerMoveDesc = `Khalsa ${PIECE_META[movingPiece.type].name} (${
      PIECE_META[movingPiece.type].shortGurmukhi
    }) → R${6 - playerMove.to.r}C${playerMove.to.c + 1}${
      playerMove.captured
        ? ` [Captured ${PIECE_META[playerMove.captured.type].name}]`
        : ""
    }`;

    // Trigger historical dispatch on capture
    if (playerMove.captured) {
      const dispatch =
        HISTORICAL_DISPATCHES[playerMove.captured.type] ||
        HISTORICAL_DISPATCHES.ghorchurra;
      setActiveDispatch(dispatch);
    }

    // Check if opponent Jathedar was captured
    if (!hasJathedar(afterPlayer, "opponent")) {
      setBoard(afterPlayer);
      setStatus("khalsa-won");
      setActiveDispatch(HISTORICAL_DISPATCHES.jathedar);
      setMoveLog((prev) => [
        `🏆 Fateh! Opposing Commander captured. ${playerMoveDesc}`,
        ...prev,
      ]);
      if (!rewardClaimedForMatch) {
        setRewardClaimedForMatch(true);
        onEarnCoins({
          game: "Sikh Shatranj",
          delta: 20,
          reason: "Victory in Sikh Shatranj (Khalsa Tactical Grid)",
          incrementStreak: true,
          unlockBadge: "dhai-phat-strategist",
        });
      }
      return;
    }

    // Check for 40-move tactical truce (draw)
    const nextMoveCount = moveCount + 1;
    if (nextMoveCount >= 40) {
      setBoard(afterPlayer);
      setStatus("draw");
      setMoveLog((prev) => [
        `🤝 Tactical Truce after 40 maneuvers (+5 Coins).`,
        playerMoveDesc,
        ...prev,
      ]);
      if (!rewardClaimedForMatch) {
        setRewardClaimedForMatch(true);
        onEarnCoins({
          game: "Sikh Shatranj",
          delta: 5,
          reason: "Tactical Draw in Sikh Shatranj",
          incrementStreak: false,
        });
      }
      return;
    }

    setBoard(afterPlayer);
    setTurn("opponent");

    // Opponent AI responds after brief pause
    setTimeout(() => {
      const aiMove = chooseBestOpponentMove(afterPlayer);
      if (!aiMove) {
        setStatus("khalsa-won");
        if (!rewardClaimedForMatch) {
          setRewardClaimedForMatch(true);
          onEarnCoins({
            game: "Sikh Shatranj",
            delta: 20,
            reason: "Victory by surrounding all opposing forces in Sikh Shatranj",
            incrementStreak: true,
            unlockBadge: "dhai-phat-strategist",
          });
        }
        return;
      }

      const aiPiece = afterPlayer[aiMove.from.r][aiMove.from.c]!;
      const afterAi = applyMove(afterPlayer, aiMove);
      setLastMoveCoords({ from: aiMove.from, to: aiMove.to });

      const aiMoveDesc = `Imperial ${PIECE_META[aiPiece.type].name} → R${
        6 - aiMove.to.r
      }C${aiMove.to.c + 1}${
        aiMove.captured
          ? ` [Captured Khalsa ${PIECE_META[aiMove.captured.type].name}]`
          : ""
      }`;

      if (aiMove.captured) {
        const dispatch =
          HISTORICAL_DISPATCHES[aiMove.captured.type] ||
          HISTORICAL_DISPATCHES.qila;
        setActiveDispatch(dispatch);
      }

      if (!hasJathedar(afterAi, "khalsa")) {
        setBoard(afterAi);
        setStatus("opponent-won");
        setActiveDispatch(HISTORICAL_DISPATCHES.jathedar);
        setMoveLog((prev) => [
          `Imperial forces captured your Jathedar. Regroup and launch a new campaign!`,
          aiMoveDesc,
          playerMoveDesc,
          ...prev.slice(0, 10),
        ]);
        return;
      }

      setBoard(afterAi);
      setMoveCount(nextMoveCount);
      setTurn("khalsa");
      setMoveLog((prev) => [aiMoveDesc, playerMoveDesc, ...prev.slice(0, 10)]);
    }, 320);
  };

  const declareTacticalTruce = () => {
    if (status !== "playing" || moveCount < 6) return;
    setStatus("draw");
    if (!rewardClaimedForMatch) {
      setRewardClaimedForMatch(true);
      onEarnCoins({
        game: "Sikh Shatranj",
        delta: 5,
        reason: "Honourable Tactical Truce in Sikh Shatranj",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#121C15] border border-[#C59B27]/45 text-[#FAF6EE] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#E5C158] font-semibold px-2.5 py-0.5 rounded bg-[#1B2A20] border border-[#C59B27]/40">
                KHALSA TACTICAL STRATEGY • WIN +20 COINS • DRAW +5 COINS
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#FAF6EE]">
              Sikh Shatranj: The Dhai Phat 6×6 Tactical Grid
            </h3>
            <p className="text-sm text-[#F3ECE0]/85 mt-1 max-w-2xl">
              Command the <strong>Jathedar</strong>, <strong>Akali Nihang</strong>,{" "}
              <strong>Ghorchurra Cavalry</strong>, <strong>Qila Fort</strong>,{" "}
              <strong>Misl Vanguard</strong>, and <strong>Khalsa Sipahi</strong>. Every capture
              unlocks a real historical Sikh battlefield dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {status === "playing" && moveCount >= 6 && (
              <button
                type="button"
                onClick={declareTacticalTruce}
                className="px-4 py-2.5 rounded-xl border border-[#C59B27]/50 bg-[#1B2A20] text-xs font-semibold text-[#E5C158] hover:border-[#D97706] transition"
              >
                Agree Tactical Draw (+5 Coins)
              </button>
            )}
            <button
              type="button"
              onClick={resetGame}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-semibold text-xs uppercase tracking-wider hover:brightness-105 transition"
            >
              New Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Main Tactical Grid + Historical Dispatch Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: 6x6 Board */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-[#1B2A20] border-2 border-[#C59B27]/55 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#C59B27]/25 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  status === "playing"
                    ? turn === "khalsa"
                      ? "bg-[#E5C158]"
                      : "bg-[#D97706] animate-pulse"
                    : "bg-emerald-400"
                }`}
              />
              <span className="uppercase tracking-widest font-semibold text-[#FAF6EE]">
                {status === "playing"
                  ? turn === "khalsa"
                    ? "Your Turn: Command Khalsa Ranks (Gold)"
                    : "Opponent Maneuvering…"
                  : status === "khalsa-won"
                  ? "Khalsa Victory! (+20 Knowledge Coins Awarded)"
                  : status === "draw"
                  ? "Tactical Truce Declared (+5 Knowledge Coins Awarded)"
                  : "Campaign Lost — Regroup & Strike Again"}
              </span>
            </div>
            <span className="text-[#E5C158] font-mono">Maneuver #{moveCount + 1}</span>
          </div>

          {/* 6x6 Grid */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 max-w-[460px] mx-auto aspect-square p-2.5 rounded-2xl bg-[#121C15] border border-[#C59B27]/45">
            {board.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isDark = (rIdx + cIdx) % 2 === 1;
                const isSelected = selected?.r === rIdx && selected?.c === cIdx;
                const legalMove = legalMovesForSelected.find(
                  (m) => m.to.r === rIdx && m.to.c === cIdx
                );
                const isLastMove =
                  (lastMoveCoords?.from.r === rIdx && lastMoveCoords?.from.c === cIdx) ||
                  (lastMoveCoords?.to.r === rIdx && lastMoveCoords?.to.c === cIdx);

                let squareBg = isDark ? "bg-[#1B2A20]" : "bg-[#263B2D]";
                if (isSelected) {
                  squareBg = "bg-[#D97706]/40 ring-2 ring-[#E5C158]";
                } else if (legalMove) {
                  squareBg = legalMove.captured
                    ? "bg-red-500/35 ring-2 ring-red-400"
                    : "bg-[#C59B27]/35 ring-1 ring-[#E5C158]";
                } else if (isLastMove) {
                  squareBg = "bg-[#C59B27]/20";
                }

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    type="button"
                    onClick={() => handleSquareClick(rIdx, cIdx)}
                    className={`relative rounded-lg flex flex-col items-center justify-center p-1 transition select-none border border-[#C59B27]/20 hover:border-[#E5C158]/60 ${squareBg}`}
                  >
                    {cell ? (
                      <div
                        className={`w-full h-full rounded-md flex flex-col items-center justify-center transition ${
                          cell.side === "khalsa"
                            ? "bg-gradient-to-b from-[#E5C158] to-[#C59B27] text-[#171917] shadow-md border border-[#FAF6EE]/50"
                            : "bg-[#0F1712] text-[#F3ECE0] border border-red-400/50"
                        }`}
                      >
                        <span
                          lang="pa"
                          className="font-gurmukhi text-base sm:text-xl font-bold leading-none"
                        >
                          {PIECE_META[cell.type].shortGurmukhi}
                        </span>
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-tighter font-bold mt-0.5 truncate max-w-full px-0.5">
                          {PIECE_META[cell.type].name.split(" ")[0]}
                        </span>
                      </div>
                    ) : legalMove ? (
                      <span className="w-3 h-3 rounded-full bg-[#E5C158] shadow-[0_0_8px_#E5C158]" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {/* Piece Legend Strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(PIECE_META) as PieceType[]).map((pt) => {
              const meta = PIECE_META[pt];
              return (
                <button
                  key={pt}
                  type="button"
                  onClick={() =>
                    setActiveDispatch(
                      HISTORICAL_DISPATCHES[pt] || HISTORICAL_DISPATCHES.ghorchurra
                    )
                  }
                  className="p-2.5 rounded-xl bg-[#121C15] border border-[#C59B27]/30 hover:border-[#E5C158] text-left transition"
                >
                  <div className="flex items-center justify-between">
                    <span
                      lang="pa"
                      className="font-gurmukhi text-sm font-bold text-[#E5C158]"
                    >
                      {meta.shortGurmukhi} · {meta.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#F3ECE0]/70 mt-0.5">
                    {meta.chessEquivalent}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Historical Tactical Dispatch Card & Battle Log */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#F3ECE0] border-2 border-[#C59B27] text-[#171917] shadow-parchment space-y-4">
            <div className="flex items-center justify-between border-b border-[#C59B27]/35 pb-3">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-bold">
                Historical Battlefield Dispatch
              </span>
              <span className="text-[11px] text-[#4A554E] font-semibold">
                {activeDispatch.era}
              </span>
            </div>

            <div>
              <p lang="pa" className="font-gurmukhi text-lg text-[#D97706] font-semibold">
                {activeDispatch.gurmukhi}
              </p>
              <h4 className="text-2xl font-serif font-bold text-[#171917] mt-0.5">
                {activeDispatch.title}
              </h4>
            </div>

            <p className="text-sm text-[#171917]/90 leading-relaxed">
              {activeDispatch.summary}
            </p>

            <div className="p-3.5 rounded-xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/45">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#E5C158] font-semibold block mb-1">
                Shatranj Tactical Principle
              </span>
              <p className="text-xs text-[#F3ECE0]/90 leading-relaxed">
                {activeDispatch.tacticalLesson}
              </p>
            </div>
          </div>

          {/* Battle Chronicle Log */}
          <div className="p-5 rounded-2xl bg-[#121C15] border border-[#C59B27]/40 text-[#FAF6EE]">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#E5C158] font-semibold mb-3">
               Field Maneuver Chronicle
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs font-mono text-[#F3ECE0]/85">
              {moveLog.map((entry, idx) => (
                <div
                  key={idx}
                  className="py-1.5 px-2.5 rounded bg-[#1B2A20]/90 border border-[#C59B27]/20"
                >
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
