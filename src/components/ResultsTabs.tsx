'use client';

import { useState } from 'react';

interface ResultsTabsProps {
  children: React.ReactNode[];
}

export function ResultsTabs({ children }: ResultsTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <div className="flex border-b">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 border-b-2 ${activeTab === index ? 'border-blue-500 text-blue-500' : 'border-transparent'}`}
          >
            Tab {index + 1}
          </button>
        ))}
      </div>
      <div className="p-4">{children[activeTab]}</div>
    </div>
  );
}
