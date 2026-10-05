import { useEffect, useCallback } from 'react';

/**
 * Custom hook to encapsulate socket communication for Pokemon battles.
 * Preserves exact socket event names and payload structures.
 */
export const useBattleSocket = ({
  socket,
  roomId,
  currentPlayer,
  onSetPokemon,
  onAttack,
}) => {
  useEffect(() => {
    if (!socket?.current) return;

    const handleSetPokemon = (msg) => {
      if (onSetPokemon) {
        onSetPokemon(msg);
      }
    };

    socket.current.off('setpokemon');
    socket.current.on('setpokemon', handleSetPokemon);

    return () => {
      socket.current?.off('setpokemon', handleSetPokemon);
    };
  }, [socket, onSetPokemon]);

  useEffect(() => {
    if (!socket?.current) return;

    const handleAttackEvent = (msg) => {
      if (onAttack) {
        onAttack(msg);
      }
    };

    socket.current.off?.('attack');
    socket.current.on?.('attack', handleAttackEvent);

    return () => {
      socket.current?.off?.('attack', handleAttackEvent);
    };
  }, [socket, onAttack]);

  const emitSetPokemon = useCallback(
    ({ index, player }) => {
      socket?.current?.emit('setpokemon', { index, player, roomId });
    },
    [socket, roomId]
  );

  const emitAttack = useCallback(
    ({ move, index, type, player }) => {
      const hitsToGive =
        move && move.meta?.max_hits != null
          ? Math.floor(Math.random() * (move.meta.max_hits - move.meta.min_hits + 1)) +
            move.meta.min_hits
          : 1;

      const randomVs = [];
      for (let i = 0; i < hitsToGive; i++) {
        const V = Math.floor(Math.random() * 16) + 85;
        randomVs.push(V);
      }

      socket?.current?.emit('attack', {
        move,
        index,
        hitsToGive,
        randomVs,
        roomId,
        player: player || currentPlayer,
        type,
      });
    },
    [socket, roomId, currentPlayer]
  );

  return {
    emitSetPokemon,
    emitAttack,
  };
};

export default useBattleSocket;
