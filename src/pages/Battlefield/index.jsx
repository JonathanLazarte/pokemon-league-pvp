import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import BattleWindow from '../../components/battleWindow/battleWindow.jsx';
import NamePokemonModal from '../../components/NamePokemonModal/NamePokemonModal.jsx';
import { useBattleSocket } from '../../hooks/useBattleSocket.js';
import { useBattleAudio } from '../../hooks/useBattleAudio.js';
import { useBattleLogic } from '../../hooks/useBattleLogic.js';
import { apiFetch } from '../../services/api.js';
import { determineTurnOrder } from '../../utils/pokemonStats.js';

export default memo(function Battlefield({ socket, roomId, P1, P2, TYPES, PLAYER }) {
  const [playerOneMove, setPlayerOneMove] = useState(null);
  const [playerTwoMove, setPlayerTwoMove] = useState(null);
  const currentPlayer = PLAYER;

  const { audioRef } = useBattleAudio('https://github.com/jonylazarte/resources/raw/refs/heads/main/wild_4.ogg', 0.4);

  const handlePokemonDefeated = useCallback(async (winner, defeated) => {
    return new Promise(async (resolve) => {
      const isWinnerOne = winner === 'One';
      const enemyTeam = isWinnerOne ? P2 : P1;
      const attackerTeam = isWinnerOne ? P1 : P2;
      const attacker = isWinnerOne ? P1[0] : P2[0];
      const enemy = isWinnerOne ? P2[0] : P1[0];

      const availableEnemyPokeballs = enemyTeam.findIndex((pokeball) => pokeball.hp_state !== 0);

      if (availableEnemyPokeballs !== -1) {
        setEffectEntry(`${enemy.name.toUpperCase()} has been defeated!`);
        setTimeout(() => {
          setMoveRunning(false);
          resolve('Pokemon derrotado');
        }, 2000);
      } else {
        setTimeout(() => {
          setEffectEntry(`${attacker.name.toUpperCase()} WINS`);
          setGameState(`${winner} wins`);
          resolve('Victoria');
        }, 2000);
      }
    });
  }, [P1, P2]);

  const {
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
    animationEnemy,
    damageDone,
    gameState,
    setGameState,
    pendingCapture,
    setPendingCapture,
    executeAttackAction,
  } = useBattleLogic({
    playerOne: P1,
    playerTwo: P2,
    types: TYPES,
    onPokemonDefeated: handlePokemonDefeated,
  });

  const onSetPokemonSocket = useCallback((msg) => {
    if (msg.player === 'One') {
      setActivePokemon(allyTeam[msg.index]);
    } else {
      setEnemyPokemon(enemyTeam[msg.index]);
    }
  }, [allyTeam, enemyTeam, setActivePokemon, setEnemyPokemon]);

  const onAttackSocket = useCallback((msg) => {
    if (msg.player === 'One') {
      setPlayerOneMove(msg);
    } else {
      setPlayerTwoMove(msg);
    }
  }, []);

  const { emitSetPokemon, emitAttack } = useBattleSocket({
    socket,
    roomId,
    currentPlayer,
    onSetPokemon: onSetPokemonSocket,
    onAttack: onAttackSocket,
  });

  const turnSystem = useCallback(async () => {
    if (playerOneMove != null && playerTwoMove != null) {
      const order = determineTurnOrder(playerOneMove, playerTwoMove, activePokemon, enemyPokemon);
      if (!order) return;

      const { firstMove, secondMove } = order;

      const resolution = await executeAttackAction({
        ...firstMove,
        onSetPokemon: emitSetPokemon,
      });

      if (resolution?.name === 'Enemigo vivo') {
        await executeAttackAction({
          ...secondMove,
          onSetPokemon: emitSetPokemon,
        });
      } else if (resolution?.name === 'Pokemon changed') {
        await executeAttackAction({
          ...secondMove,
          updatedIndex: resolution,
          onSetPokemon: emitSetPokemon,
        });
      }

      setPlayerOneMove(null);
      setPlayerTwoMove(null);
    }
  }, [playerOneMove, playerTwoMove, activePokemon, enemyPokemon, executeAttackAction, emitSetPokemon]);

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
    const controls = animate(count1, activePokemon?.hp_state ?? 0, { velocity: 2, duration: 2 });
    return () => controls.stop();
  }, [activePokemon?.hp_state]);

  useEffect(() => {
    const controls = animate(count2, enemyPokemon?.hp_state ?? 0, { velocity: 2, duration: 2 });
    return () => controls.stop();
  }, [enemyPokemon?.hp_state]);

  const handleCaptureConfirm = async (pokemonName) => {
    if (!pendingCapture) return;
    try {
      await apiFetch('pokemons/users/addpokemon', {
        method: 'POST',
        body: JSON.stringify({
          userID: localStorage.getItem('token'),
          pokemonID: pendingCapture.pokemonId,
          pokemonName: pokemonName || pendingCapture.defaultName,
        }),
      });
      setEffectEntry(`${activePokemon.name.toUpperCase()} wins!`);
      setGameState('One wins');
    } catch {
      // TODO: check original logic for capture failure handling
    } finally {
      if (pendingCapture.resolve) {
        pendingCapture.resolve({ name: 'Pokemon captured' });
      }
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
        {currentPlayer === 'One' && (
          <BattleWindow
            player="One"
            socket={socket}
            pokemonOne={activePokemon}
            pokemonTwo={enemyPokemon}
            ownPokeballs={allyTeam}
            enemyPokeballs={enemyTeam}
            setPokemon={emitSetPokemon}
            setPlayerMove={emitAttack}
            rounded1={rounded1}
            rounded2={rounded2}
            effectEntrie={effectEntry}
            moveRunning={moveRunning}
            gameState={gameState}
            animationOne={animationAlly}
            animationTwo={animationEnemy}
            damageDoneOne={damageDone}
            battleMusic={audioRef.current}
          />
        )}
        {currentPlayer === 'Two' && (
          <BattleWindow
            player="Two"
            socket={socket}
            pokemonOne={enemyPokemon}
            pokemonTwo={activePokemon}
            ownPokeballs={enemyTeam}
            enemyPokeballs={allyTeam}
            setPokemon={emitSetPokemon}
            setPlayerMove={emitAttack}
            rounded1={rounded2}
            rounded2={rounded1}
            effectEntrie={effectEntry}
            moveRunning={moveRunning}
            gameState={gameState}
            animationOne={animationEnemy}
            animationTwo={animationAlly}
            damageDoneOne={damageDone}
            battleMusic={audioRef.current}
          />
        )}
      </section>
    </>
  );
});