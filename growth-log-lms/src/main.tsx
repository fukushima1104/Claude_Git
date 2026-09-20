import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './App';
import { AppProvider } from '@/store/AppStore';
import './index.css';

/**
 * 通常は履歴 API を使うルーターで動かす。
 * サーバーを置かずに配信する場合(共有用の1枚 HTML など)は、
 * パスを直接開けずに 404 になるため、VITE_HASH_ROUTER=1 でハッシュルーターに切り替える。
 */
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AppProvider>
        <App />
      </AppProvider>
    </Router>
  </StrictMode>,
);
