/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, id }) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden p-8 text-right
        ${onClick ? 'cursor-pointer hover:border-slate-200/80 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
