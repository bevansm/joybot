import { GameRolesState } from '../model/role-states';
import { Game } from '../model/game-types';
import Dataclient from '../model/dataclient/Dataclient';

export const handlePhase = async (
  game: Game,
  state: GameRolesState,
  dc = Dataclient
) => {
  const { roles, teams } = state;
  const {
    phase: { type, no },
  } = game;

  const roleCards = await Promise.all(dc.getRoles(roles.map(r => r.id)));
  const teamsInfo = await Promise.all(dc.getTeams(teams.map(t => t.id)));
};
