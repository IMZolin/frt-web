import React, { useState } from 'react';

const SurveyBanner = ({ status, message }) => {
  const [isBannerClosed, setIsBannerClosed] = useState(false);

  let bannerColor = '';
  let bannerText = '';

  switch (status) {
    case 'in progress':
      bannerColor = 'blue';
      bannerText = 'Survey in progress';
      break;
    case 'successful':
      bannerColor = 'green';
      bannerText = 'Survey successful';
      break;
    case 'error':
      bannerColor = 'red';
      bannerText = 'Survey encountered an error';
      break;
    default:
      bannerColor = 'gray';
      bannerText = 'Unknown survey status';
  }

  const closeBanner = () => {
    setIsBannerClosed(true);
  };

  return !isBannerClosed ? (
    <div
      style={{
        backgroundColor: bannerColor,
        color: 'white',
        padding: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>
        {bannerText}: {message}
      </span>
      <button
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
        }}
        onClick={closeBanner}
      >
        &#10006; {/* Unicode cross symbol */}
      </button>
    </div>
  ) : null;
};

export default SurveyBanner;
