import { useState } from 'react';
import Header from './components/Header';
import Terminal from './components/Terminal';
import SendTransactionForm from './components/SendTransactionForm';
import WalletCreator from './components/WalletCreator';
import BlocksList from './components/BlocksList';
import MempoolBadge from './components/MempoolBadge';
import Footer from './components/Footer';
import { motion } from 'framer-motion';

function App() {
  const [rpcUrl] = useState(import.meta.env.VITE_RPC_BASE_URL || 'http://localhost:8080');

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Interactive Area */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WalletCreator rpcUrl={rpcUrl} />
            <Terminal />
            <SendTransactionForm rpcUrl={rpcUrl} />
          </motion.div>

          {/* Right Column - Explorer */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BlocksList rpcUrl={rpcUrl} />
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Floating Mempool Badge */}
      <MempoolBadge rpcUrl={rpcUrl} />
    </div>
  );
}

export default App;
