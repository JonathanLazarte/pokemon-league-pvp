import { useState } from 'react';
import './NamePokemonModal.css';

export default function NamePokemonModal({ defaultName, isOpen, onConfirm }) {
  const [name, setName] = useState(defaultName || '');

  if (!isOpen) return null;

  return (
    <div className="name-modal-backdrop">
      <div className="name-modal-container">
        <h3>Choose a name for your Pokémon</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={defaultName || 'Pokémon Name'}
          autoFocus
        />
        <div className="name-modal-buttons">
          <button
            type="button"
            className="name-modal-btn confirm"
            onClick={() => onConfirm(name.trim() || defaultName)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
