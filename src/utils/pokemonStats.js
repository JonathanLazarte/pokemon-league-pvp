/**
 * Pokemon stats, IV/EV calculation, and turn order resolution.
 * Exact original formulas preserved.
 */

export const calculatePokemonHp = (baseHp, ivHp, evHp, level) => {
  return Math.floor(((2 * baseHp + ivHp + evHp / 4) * level) / 100 + level + 10);
};

export const calculatePokemonStat = (baseStat, ivStat, evStat, level) => {
  return Math.floor(((2 * baseStat + ivStat + evStat / 4) * level) / 100 + 5);
};

export const generateRandomIvs = () => ({
  hp: Math.floor(Math.random() * 32) + 1,
  attack: Math.floor(Math.random() * 32) + 1,
  defense: Math.floor(Math.random() * 32) + 1,
  special_attack: Math.floor(Math.random() * 32) + 1,
  special_defense: Math.floor(Math.random() * 32) + 1,
  speed: Math.floor(Math.random() * 32) + 1,
});

export const determineTurnOrder = (moveOne, moveTwo, pokemonOne, pokemonTwo) => {
  if (!moveOne || !moveTwo) return null;

  const speedOne = pokemonOne?.stats?.[5]?.actual_stat ?? 0;
  const speedTwo = pokemonTwo?.stats?.[5]?.actual_stat ?? 0;

  const firstMove =
    moveOne.type === 'PokemonChange'
      ? moveOne
      : moveTwo.type === 'PokemonChange'
      ? moveTwo
      : speedOne > speedTwo
      ? moveOne
      : moveTwo;

  const secondMove = firstMove.player === 'One' ? moveTwo : moveOne;

  return { firstMove, secondMove };
};
