export const DATA_VERSION = 1;
export const WIN_SCORE = 500;
export const MAX_POINTS = 5000;

export type Player = { id: string; name: string; createdAt: string };
export type Participant = { playerId: string; name: string };
export type Round = { id: string; createdAt: string; points: Record<string, number> };
export type Penalty = { id: string; createdAt: string; playerId: string; points: number };
export type Game = {
  id: string; startedAt: string; endedAt?: string; status: 'active' | 'completed' | 'cancelled';
  participants: Participant[]; rounds: Round[]; penalties: Penalty[]; winnerIds: string[];
};
export type Database = { version: number; players: Player[]; games: Game[] };
export type PlayerStats = { playerId: string; name: string; games: number; points: number; wins: number; losses: number; penaltyEvents: number; penaltyPoints: number };

export const emptyDatabase = (): Database => ({ version: DATA_VERSION, players: [], games: [] });
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function totals(game: Game): Record<string, number> {
  const result = Object.fromEntries(game.participants.map((p) => [p.playerId, 0]));
  game.rounds.forEach((round) => Object.entries(round.points).forEach(([id, value]) => { result[id] = (result[id] ?? 0) + value; }));
  game.penalties.forEach((penalty) => { result[penalty.playerId] = (result[penalty.playerId] ?? 0) - penalty.points; });
  return result;
}

export function winnerIds(game: Game): string[] {
  const scores = totals(game);
  const eligible = game.participants.filter((p) => scores[p.playerId] >= WIN_SCORE);
  if (!eligible.length) return [];
  const highest = Math.max(...eligible.map((p) => scores[p.playerId]));
  return eligible.filter((p) => scores[p.playerId] === highest).map((p) => p.playerId);
}

export function reconcileGame(game: Game, now = new Date().toISOString()): Game {
  if (game.status === 'cancelled') return game;
  const winners = winnerIds(game);
  if (winners.length) return { ...game, status: 'completed', endedAt: game.endedAt ?? now, winnerIds: winners };
  return { ...game, status: 'active', endedAt: undefined, winnerIds: [] };
}

export function validatePoint(value: unknown, penalty = false): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed) || Math.abs(parsed) > MAX_POINTS || (penalty && parsed <= 0)) return null;
  return parsed;
}

export function statsFor(games: Game[], players: Player[], since?: Date): PlayerStats[] {
  const map = new Map<string, PlayerStats>();
  players.forEach((p) => map.set(p.id, { playerId:p.id, name:p.name, games:0, points:0, wins:0, losses:0, penaltyEvents:0, penaltyPoints:0 }));
  games.filter((g) => g.status === 'completed' && g.endedAt && (!since || new Date(g.endedAt) >= since)).forEach((game) => {
    const scores = totals(game);
    game.participants.forEach((participant) => {
      const current = map.get(participant.playerId) ?? { playerId:participant.playerId, name:participant.name, games:0, points:0, wins:0, losses:0, penaltyEvents:0, penaltyPoints:0 };
      current.games += 1; current.points += scores[participant.playerId] ?? 0;
      if (game.winnerIds.includes(participant.playerId)) current.wins += 1; else current.losses += 1;
      const penalties = game.penalties.filter((p) => p.playerId === participant.playerId);
      current.penaltyEvents += penalties.length; current.penaltyPoints += penalties.reduce((sum, p) => sum + p.points, 0);
      map.set(participant.playerId, current);
    });
  });
  return [...map.values()].filter((s) => s.games > 0).sort((a,b) => b.wins-a.wins || b.points-a.points || a.name.localeCompare(b.name,'da'));
}

export function validateDatabase(value: unknown): value is Database {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<Database>;
  if (data.version !== DATA_VERSION || !Array.isArray(data.players) || !Array.isArray(data.games)) return false;
  return data.players.every((p) => p && typeof p.id === 'string' && typeof p.name === 'string') &&
    data.games.every((g) => g && typeof g.id === 'string' && Array.isArray(g.participants) && Array.isArray(g.rounds) && Array.isArray(g.penalties));
}
