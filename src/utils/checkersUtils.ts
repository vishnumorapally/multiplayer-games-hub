export function getLegalCheckersMoves(board: (string | null)[][], r: number, c: number) {
  const piece = board[r][c];
  if (!piece) return [];

  const isRed = piece.toLowerCase() === 'r';
  const isKing = piece === 'R' || piece === 'B';
  const oppColor = isRed ? 'b' : 'r';

  const moves: { from: [number, number]; to: [number, number]; isJump: boolean; jumped?: [number, number] }[] = [];
  const jumps: { from: [number, number]; to: [number, number]; isJump: boolean; jumped: [number, number] }[] = [];

  const forwardDirections = isRed ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  const allDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const directions = isKing ? allDirections : forwardDirections;

  for (const [dr, dc] of directions) {
    const nr = r + dr;
    const nc = c + dc;

    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === null) {
      moves.push({ from: [r, c], to: [nr, nc], isJump: false });
    }

    const jumpR = r + dr * 2;
    const jumpC = c + dc * 2;
    if (
      jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8 &&
      board[nr][nc] && board[nr][nc]!.toLowerCase() === oppColor &&
      board[jumpR][jumpC] === null
    ) {
      jumps.push({ from: [r, c], to: [jumpR, jumpC], jumped: [nr, nc], isJump: true });
    }
  }

  return jumps.length > 0 ? jumps : moves;
}
