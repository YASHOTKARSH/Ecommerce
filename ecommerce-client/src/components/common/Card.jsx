import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-md';

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';

  const classes = `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card;
