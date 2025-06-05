'use client';

import { createContext, useContext, useState } from 'react';

const BulkActionContext = createContext();

export function BulkActionProvider({ children }) {
  const [onBulkDownload, setOnBulkDownload] = useState(() => () => {});
  const [onBulkDelete, setOnBulkDelete] = useState(() => () => {});

  return (
    <BulkActionContext.Provider value={{ onBulkDownload, setOnBulkDownload, onBulkDelete, setOnBulkDelete }}>
      {children}
    </BulkActionContext.Provider>
  );
}

export function useBulkActions() {
  return useContext(BulkActionContext);
}