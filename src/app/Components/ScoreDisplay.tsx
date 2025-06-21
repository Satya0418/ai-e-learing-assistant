"use client"
import React from 'react';
import { Score } from '@/lib/model/score';
import { X } from 'lucide-react';

interface ScoreDisplayProps {
  score: Score;
  onClose: () => void;
}

export const ScoreDisplay = ({ score, onClose }: ScoreDisplayProps) => {
  const getScoreColor = (value: string) => {
    switch (value) {
      case 'good':
        return 'text-green-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const attributes = [
    { key: 'wit', label: 'Wit' },
    { key: 'humor', label: 'Humor' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'seductiveness', label: 'Seductiveness' },
    { key: 'flow', label: 'Flow' },
    { key: 'kindness', label: 'Kindness' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Chat Score</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="text-4xl font-bold text-blue-600">
                {score.rizz_score}
              </div>
              <div className="text-xl text-gray-500 ml-2">/ 100</div>
            </div>
            <p className="text-center text-gray-600 italic">
              {score.overall_summary}
            </p>
          </div>

          <div className="space-y-6">
            {attributes.map(({ key, label }) => (
              <div key={key} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{label}</span>
                  <span className={`font-bold ${getScoreColor(score[key])}`}>
                    {score[key].toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {score[`${key}_summary`]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};