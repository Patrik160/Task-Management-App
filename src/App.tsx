import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { 
  Plus, 
  Menu, 
  X, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Search,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeBoards, createBoard, Board } from './services/taskService';
import { KanbanBoard } from './components/KanbanBoard';
import { cn } from './lib/utils';

export default function App() {
  return (
    <AuthProvider>
      <TaskFlow />
    </AuthProvider>
  );
}

function TaskFlow() {
  const { user, loading, login, signOut } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeBoards(user.uid, (data) => {
        setBoards(data);
        if (data.length > 0 && !activeBoard) {
          setActiveBoard(data[0]);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim() || !user) return;
    await createBoard(newBoardName.trim(), user.uid);
    setNewBoardName('');
    setIsCreateBoardOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5F3]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-2xl font-semibold text-zinc-400"
        >
          TaskFlow
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F3] p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 mb-4 font-sans">
            Streamline your workflow with TaskFlow
          </h1>
          <p className="text-zinc-500 mb-8">
            Collaborative task management designed for high-performance teams.
            Real-time updates, intuitive interface, and powerful organization.
          </p>
          <button 
            onClick={login}
            className="w-full bg-[#141414] text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
          >
            Get started for free
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F5F3] overflow-hidden text-zinc-900 font-sans">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 p-2 bg-white border border-zinc-200 rounded-lg shadow-sm lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? '280px' : '0px',
          opacity: isSidebarOpen ? 1 : 0
        }}
        className={cn(
          "bg-white border-r border-zinc-200 flex flex-col h-full overflow-hidden",
          !isSidebarOpen && "hidden lg:flex lg:w-0"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-zinc-100 mb-2">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            TaskFlow
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 hover:bg-zinc-100 rounded lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="mb-8">
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Boards</h2>
              <button 
                onClick={() => setIsCreateBoardOpen(true)}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {boards.map(board => (
                <button
                  key={board.id}
                  onClick={() => setActiveBoard(board)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    activeBoard?.id === board.id 
                      ? "bg-zinc-100 text-black" 
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-black"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {board.name}
                </button>
              ))}
              {boards.length === 0 && (
                <p className="px-3 py-2 text-xs text-zinc-400 italic">No boards yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              className="w-10 h-10 rounded-full border border-zinc-200" 
              alt={user.displayName || 'User'} 
            />
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold truncate">{user.displayName}</div>
              <div className="text-xs text-zinc-500 truncate">{user.email}</div>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-zinc-200 bg-white flex items-center justify-between px-8 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-zinc-100 rounded-lg hidden lg:block"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-semibold truncate">
              {activeBoard?.name || 'Select a board'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="bg-zinc-100 border-none rounded-full pl-9 pr-4 py-2 text-sm w-64 focus:ring-1 focus:ring-zinc-300 outline-none transition-all"
              />
            </div>
            <button className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 group relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Board View */}
        <div className="flex-1 overflow-x-auto p-8">
          {activeBoard ? (
            <KanbanBoard boardId={activeBoard.id} />
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400">
              Select or create a board to get started
            </div>
          )}
        </div>
      </main>

      {/* Create Board Modal */}
      <AnimatePresence>
        {isCreateBoardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateBoardOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Create New Board</h2>
              <form onSubmit={handleCreateBoard}>
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Board Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="e.g. Project Launch" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCreateBoardOpen(false)}
                    className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
