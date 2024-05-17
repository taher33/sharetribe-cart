import React from 'react';
import classNames from 'classnames';
import css from './MinusIcon.module.css';

const MinusIcon = props => {
  const { className, rootClassName } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      className={classes}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
    >
      <path d="M19 13H5v-2h14v2z" fill="currentColor" />
    </svg>
  );
};

export default MinusIcon;
