import React, { useState } from 'react';
import { generateOrkName } from '../services/geminiService';

interface BrainBoyProps {
  onNameGenerated: (name: string) => void;
  role: string;
}

export const BrainBoy: React.FC<BrainBoyProps> = ({ onNameGenerated, role }) => {
  const [loading, setLoading] = useState(false);

  const askBrainBoy = async () => {
    setLoading(true);
    const name = await generateOrkName(role);
    onNameGenerated(name);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={askBrainBoy}
      disabled={loading}
      className="ml-2 text-xs bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded ork-border disabled:opacity-50"
    >
      {loading ? 'Thinkin...' : 'Ask Da Brain Boy'}
    </button>
  );
};