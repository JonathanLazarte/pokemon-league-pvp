import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../services/api.js';
import { calculateDamage } from '../utils/battleMath.js';

export const useBattleLogic = ({
  playerOne,
  playerTwo,
  types,
  onPokemonDefeated,
}) => {
  const [activePokemon, setActivePokemon] = useState(playerOne?.[0]);
  const [enemyPokemon, setEnemyPokemon] = useState(playerTwo?.[0]);
  const [allyTeam, setAllyTeam] = useState(playerOne);
  const [enemyTeam, setEnemyTeam] = useState(playerTwo);
  const [moveRunning, setMoveRunning] = useState(false);
  const [effectEntry, setEffectEntry] = useState('');
  const [animationAlly, setAnimationAlly] = useState(false);
  const [animationEnemy, setAnimationEnemy] = useState(false);
  const [damageDone, setDamageDone] = useState();
  const [gameState, setGameState] = useState('Active');
  const [pendingCapture, setPendingCapture] = useState(null);

  const getAudioDuration = (audio) => {
    return new Promise((resolve, reject) => {
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
        audio.play().catch(() => {});
      });
      audio.addEventListener('error', () => {
        reject(new Error('Audio load error'));
      });
    });
  };

  const executeAttackAction = useCallback(
    async ({ move, index, updatedIndex, hitsToGive, randomVs, player, type, onSetPokemon }) => {
      if (type === 'Attack') {
        const audio = new Audio(`https://github.com/jonylazarte/resources/raw/refs/heads/main/${move.name}.mp3`);
        audio.volume = 0.5;
        let attackDuration = 1;
        try {
          attackDuration = await getAudioDuration(audio);
        } catch {
          const fallbackAudio = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/hit-normal-damage.mp3');
          try {
            attackDuration = await getAudioDuration(fallbackAudio);
          } catch {
            attackDuration = 1;
          }
        }

        return new Promise((resolve) => {
          const isPlayerOne = player === 'One';
          const attacker = isPlayerOne ? activePokemon : enemyPokemon;
          const target = isPlayerOne ? enemyPokemon : activePokemon;
          const setTarget = isPlayerOne ? setEnemyPokemon : setActivePokemon;
          const setAnim = isPlayerOne ? setAnimationEnemy : setAnimationAlly;
          const currentEnemyTeam = isPlayerOne ? enemyTeam : allyTeam;
          const currentAllyTeam = isPlayerOne ? allyTeam : enemyTeam;
          const setCurrentEnemyTeam = isPlayerOne ? setEnemyTeam : setAllyTeam;
          const setCurrentAllyTeam = isPlayerOne ? setAllyTeam : setEnemyTeam;

          const enemyIdxInTeam = updatedIndex ? updatedIndex.changedPokemonTo : currentEnemyTeam.findIndex((p) => p.index === target.index);
          const allyIdxInTeam = currentAllyTeam.findIndex((p) => p.index === attacker.index);

          setMoveRunning(true);
          setEffectEntry(`${attacker.name.toUpperCase()} used ${move.name.toUpperCase()}!`);

          let hitsGiven = 0;
          let localTargetHP = target.hp_state;

          const processAttack = () => {
            const isFailed = Math.floor(Math.random() * 100 + 1) >= move.accuracy && move.accuracy != null;
            const currentV = randomVs ? randomVs[hitsGiven] : Math.floor(Math.random() * 16) + 85;

            const { damage, effectiveness } = calculateDamage({
              move,
              attacker,
              target,
              typesList: types,
              variation: currentV,
            });

            let finalDamage = damage;

            setTimeout(() => {
              if (!isFailed) {
                localTargetHP = Math.max(0, localTargetHP - finalDamage);
                setDamageDone(finalDamage);
              } else {
                finalDamage = 0;
                setDamageDone('Miss!');
                setEffectEntry('Attack missed!');
              }

              setTarget((prev) => (prev ? { ...prev, hp_state: localTargetHP } : prev));
              setCurrentEnemyTeam((prev) => {
                const next = [...prev];
                if (next[enemyIdxInTeam]) {
                  next[enemyIdxInTeam] = { ...next[enemyIdxInTeam], hp_state: localTargetHP };
                }
                return next;
              });

              setCurrentAllyTeam((prev) => {
                const next = [...prev];
                if (next[allyIdxInTeam]?.moves?.[index]) {
                  const updatedMoves = [...next[allyIdxInTeam].moves];
                  updatedMoves[index] = {
                    ...updatedMoves[index],
                    pp_state: updatedMoves[index].pp_state - 1,
                  };
                  next[allyIdxInTeam] = { ...next[allyIdxInTeam], moves: updatedMoves };
                }
                return next;
              });

              hitsGiven += 1;
              setAnim(true);

              if (hitsToGive === hitsGiven) {
                setTimeout(() => {
                  setAnim(false);
                  const effectivenessMessage =
                    effectiveness === 2
                      ? 'It was super effective!'
                      : effectiveness === 0.5
                      ? 'It had a weak effect...'
                      : hitsToGive !== 1
                      ? `Hit ${hitsToGive} times!`
                      : null;
                  if (effectivenessMessage) setEffectEntry(effectivenessMessage);

                  setTimeout(async () => {
                    if (localTargetHP <= 0) {
                      if (onPokemonDefeated) {
                        await onPokemonDefeated(player, target);
                      }
                      resolve({ name: 'Enemigo derrotado' });
                    } else {
                      setMoveRunning(false);
                      resolve({ name: 'Enemigo vivo' });
                    }
                  }, 500);
                }, 500);
              } else {
                processAttack();
              }
            }, (attackDuration * 1000) / 2);
          };

          processAttack();
        });
      }

      if (type === 'PokemonChange') {
        const isPlayerOne = player === 'One';
        const attacker = isPlayerOne ? activePokemon : enemyPokemon;
        const currentAllyTeam = isPlayerOne ? allyTeam : enemyTeam;

        setEffectEntry(`${attacker.name.toUpperCase()} retreats from combat.`);
        setMoveRunning(true);

        return new Promise((resolve) => {
          setTimeout(() => {
            if (onSetPokemon) {
              onSetPokemon({ index, player });
            }
            setTimeout(() => {
              setEffectEntry(`${currentAllyTeam[index]?.name?.toUpperCase()} joins the battle!`);
              setTimeout(() => {
                resolve({ name: 'Pokemon changed', player, changedPokemonTo: index });
                setMoveRunning(false);
              }, 1000);
            }, 1000);
          }, 1500);
        });
      }

      if (type === 'Item') {
        return new Promise((resolve) => {
          if (index === 23) {
            setEffectEntry('A potion was used!');
            setMoveRunning(true);
            setTimeout(() => {
              setActivePokemon((prev) => ({ ...prev, hp_state: prev.stats[0].actual_stat }));
              setAllyTeam((prev) => {
                const next = [...prev];
                const activeIdx = next.findIndex((p) => p.index === activePokemon.index);
                if (next[activeIdx]) {
                  next[activeIdx] = { ...next[activeIdx], hp_state: next[activeIdx].stats[0].actual_stat };
                }
                return next;
              });
              setTimeout(() => {
                resolve({ name: 'Enemigo vivo' });
                setMoveRunning(false);
              }, 1500);
            }, 1500);
          } else if (index === 12) {
            setEffectEntry('A Pokéball was thrown!');
            setMoveRunning(true);
            setTimeout(() => {
              setEffectEntry(`${enemyPokemon.name.toUpperCase()} was captured!`);
              setPendingCapture({
                pokemonId: enemyPokemon.id,
                defaultName: enemyPokemon.name.toUpperCase(),
                resolve,
              });
            }, 3000);
          }
        });
      }
    },
    [activePokemon, enemyPokemon, allyTeam, enemyTeam, types, onPokemonDefeated]
  );

  return {
    activePokemon,
    setActivePokemon,
    enemyPokemon,
    setEnemyPokemon,
    allyTeam,
    setAllyTeam,
    enemyTeam,
    setEnemyTeam,
    moveRunning,
    setMoveRunning,
    effectEntry,
    setEffectEntry,
    animationAlly,
    setAnimationAlly,
    animationEnemy,
    setAnimationEnemy,
    damageDone,
    gameState,
    setGameState,
    pendingCapture,
    setPendingCapture,
    executeAttackAction,
  };
};

export default useBattleLogic;
