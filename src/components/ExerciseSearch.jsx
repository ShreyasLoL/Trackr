import { useState } from 'react';
import { exerciseMap } from '../data/exerciseMap';

export default function ExerciseSearch({ onSelect, placeholder = 'Search exercises...' }) {
  const [query, setQuery] = useState('');

  const allNames = Object.keys(exerciseMap);
  const filtered = query.trim()
    ? allNames.filter((name) => name.toLowerCase().includes(query.toLowerCase()))
    : [];

  function handleSelect(name) {
    onSelect(name);
    setQuery('');
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
      />
      {filtered.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-sm max-h-60 overflow-y-auto">
          {filtered.map((name) => (
            <li
              key={name}
              onClick={() => handleSelect(name)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              <span className="text-sm text-gray-900">{name}</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(exerciseMap[name].muscles || []).map((m) => (
                  <span
                    key={m}
                    className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
