
import React from 'react';
import { TOOLS } from '../constants';
import { ToolType } from '../types';

interface ToolGridProps {
  selectedTool: ToolType | null;
  onToolSelect: (tool: ToolType) => void;
  disabled: boolean;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ selectedTool, onToolSelect, disabled }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          disabled={disabled}
          onClick={() => onToolSelect(tool.id)}
          className={`p-4 rounded-xl border text-left transition-all hover:shadow-md flex items-start gap-4 ${
            selectedTool === tool.id 
              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' 
              : 'border-slate-200 bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-2xl">{tool.icon}</span>
          <div>
            <h3 className="font-semibold text-slate-800">{tool.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{tool.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
