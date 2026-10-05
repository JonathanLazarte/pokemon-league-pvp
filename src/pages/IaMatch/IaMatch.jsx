import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import BattleWindow from '../../components/battleWindow/battleWindow.jsx';
import NamePokemonModal from '../../components/NamePokemonModal/NamePokemonModal.jsx';
import { selectUserPokemonData } from '../../redux/slices/userPokemonSlice.js';
import { BlinkBlur } from 'react-loading-indicators';
import { useBattleAudio } from '../../hooks/useBattleAudio.js';
import { apiFetch, getAuthToken } from '../../services/api.js';
import { getBonus, getEffectiveness } from '../../utils/battleMath.js';
import { calculatePokemonHp, calculatePokemonStat, generateRandomIvs, determineTurnOrder } from '../../utils/pokemonStats.js';

export default memo(function MatchVsIa({ setActualSection }) {
  const [pokemonTwo, setPokemonTwo] = useState();
  const [pokemonOne, setPokemonOne] = useState();
  const [moveRunning, setMoveRunning] = useState(false);
  const [effectEntrie, setEffectEntrie] = useState('');
  const [renderImageOne, setRenderImageOne] = useState();
  const [renderImageTwo, setRenderImageTwo] = useState();
  const [types, setTypes] = useState();
  const [animationTwo, setAnimationTwo] = useState(false);
  const [animationOne, setAnimationOne] = useState(false);
  const [damageDoneOne, setDamageDoneOne] = useState();
  const [playerOneMove, setPlayerOneMove] = useState(null);
  const [playerTwoMove, setPlayerTwoMove] = useState(null);
  const [turn, setTurn] = useState(1);
  const [gameState, setGameState] = useState('Active');
  const [obtainedStats, setObtainedStats] = useState();
  const [moveToLearn, setMoveToLearn] = useState();
  const [pendingCapture, setPendingCapture] = useState(null);

  const { audioRef } = useBattleAudio('https://github.com/jonylazarte/resources/raw/refs/heads/main/wild_3.ogg', 0.4);
  const p0 = localStorage.getItem('pokeball0');
  const p1 = localStorage.getItem('pokeball1');
  const p2 = localStorage.getItem('pokeball2');
  const { userPokemon } = useSelector(selectUserPokemonData);

  useEffect(() => {
    if (turn > 1 && pokemonTwo?.moves?.length) {
      const randomNum = Math.floor(Math.random() * pokemonTwo.moves.length);
      setPlayerTwoMove({
        move: pokemonTwo.moves[randomNum],
        index: randomNum,
        player: 'Two',
        type: 'Attack',
      });
    }
  }, [turn, pokemonTwo]);

  const turnSystem = useCallback(async () => {
    if (playerOneMove != null && playerTwoMove != null) {
      const order = determineTurnOrder(playerOneMove, playerTwoMove, pokemonOne, pokemonTwo);
      if (!order) return;

      const { firstMove, secondMove } = order;
      const resolution = await handleAttack(firstMove);

      if (resolution?.name === 'Enemigo vivo') {
        await handleAttack(secondMove);
      } else if (resolution?.name === 'Pokemon changed') {
        await handleAttack({ ...secondMove, updatedIndex: resolution });
      }

      setPlayerOneMove(null);
      setTurn((prev) => prev + 1);
    }
  }, [playerOneMove, playerTwoMove, pokemonOne, pokemonTwo]);

  useEffect(() => {
    if (playerOneMove != null && playerTwoMove != null) {
      turnSystem();
    }
  }, [playerOneMove, playerTwoMove, turnSystem]);

  const count1 = useMotionValue(0);
  const rounded1 = useTransform(count1, (latest) => Math.round(latest));
  const count2 = useMotionValue(0);
  const rounded2 = useTransform(count2, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count1, pokemonOne?.hp_state ?? 0, { velocity: 2, duration: 2 });
    return () => controls.stop();
  }, [pokemonOne?.hp_state]);

  useEffect(() => {
    const controls = animate(count2, pokemonTwo?.hp_state ?? 0, { velocity: 2, duration: 2 });
    return () => controls.stop();
  }, [pokemonTwo?.hp_state]);

  const pokemonDefeated = useCallback(
    (winner, defeated) => {
      return new Promise(async (resolver) => {
        const enemy = winner === 'One' ? pokemonTwo : pokemonOne;
        const attacker = winner === 'One' ? pokemonOne : pokemonTwo;
        const enemyPokeballs = winner === 'One' ? renderImageTwo : renderImageOne;
        const setEnemyPokemon = winner === 'One' ? setPokemonTwo : setPokemonOne;
        const attackerIndexInPokeballs = renderImageOne.findIndex((p) => p.index === attacker.index);

        const availableEnemyPokeballs = enemyPokeballs.findIndex(
          (pokeball) => pokeball.hp_state !== 0 && pokeball.index !== defeated.index
        );

        setEffectEntrie(`${enemy.name.toUpperCase()} has been defeated!`);
        const pokeballsState = renderImageOne.map((pokeball) => ({
          index: pokeball.index,
          hp: pokeball.hp_state,
        }));

        const E = enemy.base_experience;
        const Nv = enemy.level;
        const NvU = attacker.level;
        const P = 1;
        const Base = (E * Nv) / P / 5;
        const Corrector_A = (2 * Nv + 10) ^ (5 / 2);
        const Corrector_B = (Nv + NvU + 10) ^ (5 / 2);
        const Bonus = 1;
        const Poder = 1;
        const Exp = ((Base * Corrector_A) / Corrector_B + 1) * Bonus * Poder;

        let updatedPokemonData = null;
        if (winner === 'One') {
          try {
            const res = await apiFetch('pokemons/users/updatelevel', {
              method: 'POST',
              body: JSON.stringify({
                userId: getAuthToken(),
                pokeballsState,
                pokemonExp: Exp,
              }),
            });
            const data = await res.json();
            updatedPokemonData = data;
          } catch {
            // TODO: check original logic for updatelevel failure handling
          }
        }

        const updatedPokemon = updatedPokemonData?.updatedPokemon;
        const movesToLearnList = updatedPokemonData?.movesToLearn;

        if (winner === 'One' && updatedPokemon) {
          setRenderImageOne(updatedPokemon);
          setPokemonOne(updatedPokemon[attackerIndexInPokeballs]);
        }

        if (movesToLearnList && movesToLearnList.length) {
          await movesToLearnList.reduce(async (promiseChain, { name, index, moveToLearn: nextMove }) => {
            await promiseChain;
            const pokemonIndexInPokeballs = renderImageOne.findIndex((p) => p.index === index);
            const moveLearnedIndex = await new Promise((res) => {
              setMoveToLearn({ moveToLearn: nextMove, resolve: res, pokemonIndexInPokeballs });
            });
            setRenderImageOne((prevAP) => {
              const newPokeballs = [...prevAP];
              if (newPokeballs[pokemonIndexInPokeballs]?.moves) {
                newPokeballs[pokemonIndexInPokeballs].moves[moveLearnedIndex] = nextMove;
              }
              return newPokeballs;
            });
            if (moveLearnedIndex === 0) {
              setPokemonOne((prevP) => ({
                ...prevP,
                moves: prevP.moves.map((m, idx) => (idx === 0 ? nextMove : m)),
              }));
            }
            return moveLearnedIndex;
          }, Promise.resolve()).then(() => setMoveToLearn(null));
        }

        const updatedAttacker = updatedPokemon?.find((p) => p.index === attacker.index);
        if (winner === 'One') {
          await new Promise((r) =>
            setTimeout(() => {
              setEffectEntrie(`${attacker.name.toUpperCase()} won ${Math.floor(Exp)} EXP!`);
              r();
            }, 1000)
          );
        }

        if (winner === 'One' && updatedAttacker && updatedAttacker.level !== NvU) {
          await new Promise((r) =>
            setTimeout(() => {
              setEffectEntrie(`${attacker.name.toUpperCase()} leveled up!`);
              setObtainedStats([...updatedAttacker.stats, { actual_stat: updatedAttacker.level }]);
              r();
            }, 1000)
          );
        }

        if (availableEnemyPokeballs !== -1) {
          setTimeout(() => {
            if (winner === 'One') {
              setEnemyPokemon(enemyPokeballs[availableEnemyPokeballs]);
            }
            setObtainedStats(null);
            setMoveRunning(false);
            resolver('Pokemon derrotado');
          }, 1500);
        } else {
          setTimeout(() => {
            setEffectEntrie(`${attacker.name.toUpperCase()} WINS`);
            setGameState(`${winner} wins`);
            localStorage.setItem('pokeball0', null);
            localStorage.setItem('pokeball1', null);
            localStorage.setItem('pokeball2', null);
            resolver('Pokemon derrotado');
          }, 1500);
        }
      });
    },
    [pokemonOne, pokemonTwo, renderImageOne, renderImageTwo]
  );

  const handleAttack = useCallback(
    async ({ move, index, updatedIndex, player, type }) => {
      setMoveRunning(true);
      setEffectEntrie('Loading move...');

      const attackDuration = 1;

      return new Promise((resolve) => {
        const isPlayerOne = player === 'One';
        const attacker = isPlayerOne ? pokemonOne : pokemonTwo;
        const enemyPokeballs = isPlayerOne ? renderImageTwo : renderImageOne;
        const attackerPokeballs = isPlayerOne ? renderImageOne : renderImageTwo;
        const setEnemyPokeballs = isPlayerOne ? setRenderImageTwo : setRenderImageOne;
        const setAttackerPokeballs = isPlayerOne ? setRenderImageOne : setRenderImageTwo;
        const setTargetPokemon = isPlayerOne ? setPokemonTwo : setPokemonOne;
        const setAnim = isPlayerOne ? setAnimationTwo : setAnimationOne;

        const updatedEnemyIndexInPokeballs = updatedIndex ? updatedIndex.changedPokemonTo : null;
        const updatedEnemy = updatedEnemyIndexInPokeballs != null ? enemyPokeballs[updatedEnemyIndexInPokeballs] : null;
        const target = updatedEnemy || (isPlayerOne ? pokemonTwo : pokemonOne);
        const enemyIndexInPokeballs =
          updatedEnemyIndexInPokeballs != null
            ? updatedEnemyIndexInPokeballs
            : enemyPokeballs.findIndex((p) => p.index === target.index);
        const attackerIndexInPokeballs = attackerPokeballs.findIndex((p) => p.index === attacker.index);

        if (type === 'Attack') {
          let hitsGiven = 0;
          const hitsToGive =
            move.meta?.max_hits != null
              ? Math.floor(Math.random() * (move.meta.max_hits - move.meta.min_hits + 1)) + move.meta.min_hits
              : 1;
          let localTargetHP = target.hp_state;
          const hitsToGiveArray = new Array(hitsToGive).fill(0);

          setMoveRunning(true);
          setEffectEntrie(`${attacker.name.toUpperCase()} used ${move.name.toUpperCase()}!`);

          const processAttack = async () => {
            await hitsToGiveArray.reduce(async (promiseChain) => {
              await promiseChain;
              return new Promise((res) => {
                const isFailed = Math.floor(Math.random() * 100 + 1) >= move.accuracy && move.accuracy != null;
                const damageClass = move.damage_class?.name;
                const V = Math.floor(Math.random() * 16) + 85;
                const N = attacker.level;
                const A =
                  damageClass === 'physical'
                    ? attacker.stats[1].actual_stat
                    : attacker.stats[3]?.actual_stat ?? attacker.stats[1].actual_stat;
                const D =
                  damageClass === 'physical'
                    ? target.stats[2].actual_stat
                    : target.stats[4]?.actual_stat ?? target.stats[2].actual_stat;
                const B = getBonus(move.type, attacker?.types);
                const E = getEffectiveness(move.type, target?.types, types);
                const P = move.power || 0;
                let finalDamage = Math.floor(0.01 * B * E * V * (((0.2 * N + 1) * A * P) / (25 * D) + 2));

                setTimeout(async () => {
                  if (!isFailed) {
                    localTargetHP = Math.max(0, localTargetHP - finalDamage);
                    setDamageDoneOne(finalDamage);
                  } else {
                    finalDamage = 0;
                    setDamageDoneOne('Miss!');
                    setEffectEntrie('Ha fallado!');
                  }
                  setAnim(true);
                  hitsGiven += 1;

                  setTargetPokemon((prev) => (prev ? { ...prev, hp_state: localTargetHP } : prev));
                  setEnemyPokeballs((prevEP) =>
                    prevEP.map((pokeball, idx) =>
                      idx === enemyIndexInPokeballs ? { ...pokeball, hp_state: localTargetHP } : pokeball
                    )
                  );
                  setAttackerPokeballs((prevAP) => {
                    const newAttackerPokeballs = [...prevAP];
                    const updatedPokeball = { ...newAttackerPokeballs[attackerIndexInPokeballs] };
                    if (updatedPokeball.moves) {
                      const updatedMoves = [...updatedPokeball.moves];
                      if (updatedMoves[index]) {
                        updatedMoves[index] = {
                          ...updatedMoves[index],
                          pp_state: updatedMoves[index].pp_state - 1,
                        };
                      }
                      updatedPokeball.moves = updatedMoves;
                    }
                    newAttackerPokeballs[attackerIndexInPokeballs] = updatedPokeball;
                    return newAttackerPokeballs;
                  });

                  res();
                }, (attackDuration * 1000) / 2);
              });
            }, Promise.resolve());

            setTimeout(() => {
              setAnim(false);
              const E = getEffectiveness(move.type, target?.types, types);
              const effectText =
                E === 2
                  ? 'El ataque fue super efectivo'
                  : E === 0.5
                    ? 'El ataque tuvo un efecto debil'
                    : hitsToGive !== 1
                      ? `Golpeó ${hitsToGive} Veces!`
                      : null;
              if (effectText) setEffectEntrie(effectText);

              setTimeout(async () => {
                if (localTargetHP <= 0) {
                  await pokemonDefeated(player, target);
                  resolve({ name: 'Enemigo derrotado' });
                } else {
                  setMoveRunning(false);
                  resolve({ name: 'Enemigo vivo' });
                }
              }, 500);
            }, 500);
          };

          processAttack();
        } else if (type === 'PokemonChange') {
          setEffectEntrie(`${attacker.name.toUpperCase()} se retira del combate.`);
          setMoveRunning(true);
          setTimeout(() => {
            setPokemonOne(attackerPokeballs[index]);
            setTimeout(() => {
              setEffectEntrie(`${attackerPokeballs[index]?.name?.toUpperCase()} se une a la batalla!`);
              setTimeout(() => {
                resolve({ name: 'Pokemon changed', player, changedPokemonTo: index });
                setMoveRunning(false);
              }, 1000);
            }, 1000);
          }, 1000);
        } else if (type === 'Item') {
          if (index === 23) {
            setEffectEntrie('El jugador ha usado una poción!');
            setMoveRunning(true);
            setTimeout(() => {
              setAttackerPokeballs((prevAP) => {
                const next = [...prevAP];
                if (next[attackerIndexInPokeballs]) {
                  next[attackerIndexInPokeballs].hp_state = next[attackerIndexInPokeballs].stats[0].actual_stat;
                }
                return next;
              });
              setPokemonOne((prev) => ({ ...prev, hp_state: prev.stats[0].actual_stat }));
              setTimeout(() => {
                resolve({ name: 'Enemigo vivo' });
                setMoveRunning(false);
              }, 1000);
            }, 1000);
          } else if (index === 12) {
            setEffectEntrie('El jugador ha lanzado una pokeball!');
            setMoveRunning(true);
            setTimeout(() => {
              setEffectEntrie(`${pokemonTwo.name.toUpperCase()} ha sido capturado!`);
              setPendingCapture({
                pokemonId: pokemonTwo.id,
                defaultName: pokemonTwo.name.toUpperCase(),
                resolve,
              });
            }, 3000);
          }
        }
      });
    },
    [pokemonOne, pokemonTwo, renderImageOne, renderImageTwo, types, pokemonDefeated]
  );

  const setRandomPokemon = useCallback(async ({ level }) => {
    const pokeballsTwo = [];
    for (let i = 0; i < 3; i++) {
      const pokemonIndex = Math.floor(Math.random() * 1000) + 1;
      try {
        const pokeapiRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonIndex}`);
        const inputPokemon = await pokeapiRes.json();
        const pokemonLevel = level || 5;

        const ownMoves = inputPokemon.moves.filter(
          (m) =>
            m.version_group_details[0]?.level_learned_at < pokemonLevel &&
            m.version_group_details[0]?.move_learn_method?.name === 'level-up'
        );
        const randomMoves = [];
        for (let j = 0; j < 4; j++) {
          if (ownMoves.length === 0) break;
          const randomIndex = Math.floor(Math.random() * ownMoves.length);
          randomMoves.push(ownMoves.splice(randomIndex, 1)[0]);
        }

        const apiMoves = [];
        for (let j = 0; j < randomMoves.length; j++) {
          const moveRes = await fetch(randomMoves[j].move.url);
          const apiMove = await moveRes.json();
          apiMoves.push({ ...apiMove, pp_state: apiMove.pp ?? 15 });
        }

        const IVs = generateRandomIvs();
        const EVs = {
          hp: inputPokemon.stats[0].effort,
          attack: inputPokemon.stats[1].effort,
          defense: inputPokemon.stats[2].effort,
          special_attack: inputPokemon.stats[3].effort,
          special_defense: inputPokemon.stats[4].effort,
          speed: inputPokemon.stats[5].effort,
        };

        const hp = calculatePokemonHp(inputPokemon.stats[0].base_stat, IVs.hp, EVs.hp, pokemonLevel);
        const attack = calculatePokemonStat(inputPokemon.stats[1].base_stat, IVs.attack, EVs.attack, pokemonLevel);
        const defense = calculatePokemonStat(inputPokemon.stats[2].base_stat, IVs.defense, EVs.defense, pokemonLevel);
        const special_attack = calculatePokemonStat(inputPokemon.stats[3].base_stat, IVs.special_attack, EVs.special_attack, pokemonLevel);
        const special_defense = calculatePokemonStat(inputPokemon.stats[4].base_stat, IVs.special_defense, EVs.special_defense, pokemonLevel);
        const speed = calculatePokemonStat(inputPokemon.stats[5].base_stat, IVs.speed, EVs.speed, pokemonLevel);

        const finalPokemon = {
          ...inputPokemon,
          index: pokeballsTwo.length,
          level: pokemonLevel,
          hp_state: hp,
          moves: apiMoves,
          stats: [
            { ...inputPokemon.stats[0], actual_stat: hp },
            { ...inputPokemon.stats[1], actual_stat: attack },
            { ...inputPokemon.stats[2], actual_stat: defense },
            { ...inputPokemon.stats[3], actual_stat: special_attack },
            { ...inputPokemon.stats[4], actual_stat: special_defense },
            { ...inputPokemon.stats[5], actual_stat: speed },
          ],
        };

        if (pokeballsTwo.length < 3) pokeballsTwo.push(finalPokemon);
      } catch {
        // TODO: check original logic on PokeAPI fetch failure
      }
    }

    if (pokeballsTwo.length > 0) {
      setPokemonTwo(pokeballsTwo[0]);
      if (pokeballsTwo[0].moves?.length) {
        setPlayerTwoMove({ move: pokeballsTwo[0].moves[0], index: 0, player: 'Two', type: 'Attack' });
      }
      setRenderImageTwo(pokeballsTwo);
    }
  }, []);

  useEffect(() => {
    if (userPokemon && userPokemon[p0]) {
      setRandomPokemon({ level: userPokemon[p0].level });
      setRenderImageOne([userPokemon[p0], userPokemon[p1], userPokemon[p2]].filter(Boolean));
      setPokemonOne(userPokemon[p0]);
    }
    apiFetch('pokemons/data/types')
      .then((res) => res.json())
      .then((data) => setTypes(data.types || []))
      .catch(() => { });
  }, [p0, p1, p2, userPokemon, setRandomPokemon]);

  const handleCaptureConfirm = async (pokemonName) => {
    if (!pendingCapture) return;
    try {
      await apiFetch('pokemons/users/addpokemon', {
        method: 'POST',
        body: JSON.stringify({
          userID: getAuthToken(),
          pokemonID: pendingCapture.pokemonId,
          pokemonName: pokemonName || pendingCapture.defaultName,
        }),
      });
      setEffectEntrie(`${pokemonOne.name.toUpperCase()} has won!`);
      setGameState('One wins');
    } catch {
      // TODO: check original logic for capture failure
    } finally {
      if (pendingCapture.resolve) pendingCapture.resolve({ name: 'Pokemon captured' });
      setPendingCapture(null);
    }
  };

  return (
    <>
      {pendingCapture && (
        <NamePokemonModal
          isOpen={true}
          defaultName={pendingCapture.defaultName}
          onConfirm={handleCaptureConfirm}
        />
      )}
      <section className="battlefield-section">
        {pokemonTwo ? (
          <BattleWindow
            player="One"
            pokemonOne={pokemonOne}
            pokemonTwo={pokemonTwo}
            ownPokeballs={renderImageOne}
            enemyPokeballs={renderImageTwo}
            setPokemon={setPokemonOne}
            setPlayerMove={setPlayerOneMove}
            rounded1={rounded1}
            rounded2={rounded2}
            effectEntrie={effectEntrie}
            moveRunning={moveRunning}
            gameState={gameState}
            animationOne={animationOne}
            animationTwo={animationTwo}
            setActualSection={setActualSection}
            damageDoneOne={damageDoneOne}
            battleMusic={audioRef.current}
            obtainedStats={obtainedStats}
            mode="Explore"
            setGameState={setGameState}
            moveToLearn={moveToLearn}
          />
        ) : (
          <div style={window.innerWidth > 700 ? { scale: '0.5' } : { scale: '0.3' }}>
            <BlinkBlur color="var(--gold-one)" size="small" text="" textColor="" />
          </div>
        )}
      </section>
    </>
  );
});
