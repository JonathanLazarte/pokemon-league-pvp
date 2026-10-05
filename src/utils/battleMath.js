/**
 * Pure battle mathematical calculations.
 * Exact original formulas preserved.
 */

export const getEffectiveness = (moveType, enemyTypes, typesList = []) => {
  const mtype = typesList.find((type) => type.name === moveType.name)?.damage_relations;
  if (!mtype) return 1;

  const isDouble = mtype.double_damage_to?.some((type) =>
    enemyTypes.some((t) => t.type.name === type.name)
  );
  const isHalf = mtype.half_damage_to?.some((type) =>
    enemyTypes.some((t) => t.type.name === type.name)
  );
  const isNo = mtype.no_damage_to?.some((type) =>
    enemyTypes.some((t) => t.type.name === type.name)
  );

  return isDouble ? 2 : isHalf ? 0.5 : isNo ? 0 : 1;
};

export const getBonus = (moveType, ownTypes = []) => {
  const is50Percent = ownTypes.some((ownType) => ownType.type.name === moveType.name);
  return is50Percent ? 1.5 : 1;
};

export const calculateDamage = ({
  move,
  attacker,
  target,
  typesList,
  variation,
}) => {
  const isPhysical = move.damage_class?.name === 'physical';
  const N = attacker.level;
  const A = isPhysical
    ? attacker.stats[1].actual_stat
    : (attacker.stats[3]?.actual_stat ?? attacker.stats[1].actual_stat);
  const D = isPhysical
    ? target.stats[2].actual_stat
    : (target.stats[4]?.actual_stat ?? target.stats[2].actual_stat);
  const B = getBonus(move.type, attacker.types);
  const E = getEffectiveness(move.type, target.types, typesList);
  const V = variation ?? Math.floor(Math.random() * 16) + 85;
  const P = move.power || 0;

  // Formula exact match: Math.floor(0.01 * B * E * V * ( (0.2 * N + 1) * A * P / (25 * D) + 2))
  const finalDamage = Math.floor(
    0.01 * B * E * V * (((0.2 * N + 1) * A * P) / (25 * D) + 2)
  );

  return {
    damage: finalDamage,
    effectiveness: E,
    bonus: B,
    variation: V,
  };
};

export const calculateDefeatExp = (attacker, enemy) => {
  const E = enemy.base_experience;
  const Nv = enemy.level;
  const NvU = attacker.level;
  const P = 1; // Participants
  const Base = (E * Nv) / P / 5;
  const Corrector_A = (2 * Nv + 10) ^ (5 / 2);
  const Corrector_B = (Nv + NvU + 10) ^ (5 / 2);
  const Bonus = 1;
  const Poder = 1;
  return ((Base * Corrector_A) / Corrector_B + 1) * Bonus * Poder;
};
