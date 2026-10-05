import { memo } from 'react';

export const MoveButton = ({ move, emitAttack, pp, index, setSelectedAction, player }) => {
  const usingApi = move.type?.url?.split('/')[4]?.startsWith('v');
  const typeIndex = move.type?.url?.split('/')[usingApi ? 6 : 4];

  if (pp === 0) {
    return <button className={`attack1 btn ${move?.type?.name}`}>NO USEFUL</button>;
  }

  return (
    <button
      onClick={() => {
        emitAttack({ move, index, player, type: 'Attack' });
        if (setSelectedAction) setSelectedAction(undefined);
      }}
      className={`attack1 btn ${move?.type?.name}`}
    >
      <div className="move-name">{move?.name?.toUpperCase()}</div>
      <div className="pp-type">
        <span>{pp == null ? move.pp : pp}</span>
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/${typeIndex}.png`}
          alt={move?.type?.name}
        />
      </div>
    </button>
  );
};

export default memo(MoveButton);