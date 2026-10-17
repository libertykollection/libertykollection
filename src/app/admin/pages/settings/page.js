'use client';

import React, { useState, useEffect } from 'react';
import FilterableTable from './filterabletable';

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data ? [data] : []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <>
      {isLoading && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div className="s2u-progress-bar-primary" />
        </div>
      )}
      <FilterableTable settings={settings} fetchSettings={fetchSettings} isPageLoading={isLoading} />
    </>
  );
};

export default SettingsPage;
