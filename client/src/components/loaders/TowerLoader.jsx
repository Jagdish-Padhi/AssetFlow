import React from 'react';

const TowerLoader = ({ scaleClass = '' }) => {
  return (
    <div className={`tower-loader-wrapper ${scaleClass}`}>
      <div className="tower-loader">
        <div className="tower-box tower-box-1">
          <div className="tower-side-left" />
          <div className="tower-side-right" />
          <div className="tower-side-top" />
        </div>
        <div className="tower-box tower-box-2">
          <div className="tower-side-left" />
          <div className="tower-side-right" />
          <div className="tower-side-top" />
        </div>
        <div className="tower-box tower-box-3">
          <div className="tower-side-left" />
          <div className="tower-side-right" />
          <div className="tower-side-top" />
        </div>
        <div className="tower-box tower-box-4">
          <div className="tower-side-left" />
          <div className="tower-side-right" />
          <div className="tower-side-top" />
        </div>
      </div>
    </div>
  );
};

export default TowerLoader;
