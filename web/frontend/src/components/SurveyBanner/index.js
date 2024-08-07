import React from 'react';
import './banner.css';

const SurveyBanner = ({ status, message, onClose  }) => {
  const getBannerStyle = (status) => {
        switch (status) {
            case 'info':
                return 'banner info';
            case 'error':
                return 'banner error';
            case 'success':
                return 'banner success';
            default:
                return 'banner';
        }
    };

    return (
        <div className={getBannerStyle(status)}>
            <span>{message}</span>
            <button className="banner-close-button" onClick={onClose}>&#10006;</button>
        </div>
    );
};

export default SurveyBanner;
