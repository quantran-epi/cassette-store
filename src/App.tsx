import './App.css';
import { Provider } from 'react-redux';
import { persistor, store } from '@store/Store';
import { PersistGate } from 'redux-persist/integration/react';
import { RootRouter } from '@routing/RootRouter';
import { ConfigProvider } from 'antd';
import { MessageProvider } from '@components/Message';
import { ModalProvider } from '@components/Modal/ModalProvider';
import { buildAppTheme } from './theme/buildAppTheme';

function App() {
  return (
    <ConfigProvider theme={buildAppTheme()}>

      <MessageProvider>
        <ModalProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <RootRouter />
            </PersistGate>
          </Provider>
        </ModalProvider>
      </MessageProvider>
    </ConfigProvider>
  );
}

export default App;
