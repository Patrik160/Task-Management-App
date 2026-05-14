import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { useTheme, ThemeProvider } from './hooks/useTheme';
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
  Moon, 
  Sun, 
  Monitor, 
  User as UserIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeBoards, createBoard, Board } from './services/taskService';
import { KanbanBoard } from './components/KanbanBoard';
import { cn } from './lib/utils';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskFlow />
      </AuthProvider>
    </ThemeProvider>
  );
}

function TaskFlow() {
  const { user, loading, login, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeBoards(user.uid, (data) => {
        setBoards(data);
        setActiveBoard(current => {
          if (data.length > 0) {
            if (!current) {
              const storedId = localStorage.getItem('activeBoardId');
              return data.find(b => b.id === storedId) || data[0];
            }
            // Ensure the active board still exists and has updated data
            const updated = data.find(b => b.id === current.id);
            return updated || data[0];
          }
          return null;
        });
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (activeBoard) {
      localStorage.setItem('activeBoardId', activeBoard.id);
    }
  }, [activeBoard]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim() || !user) return;
    try {
      await createBoard(newBoardName.trim(), user.uid);
      setNewBoardName('');
      setIsCreateBoardOpen(false);
    } catch (error) {
      console.error("Failed to create board", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-2xl font-bold tracking-tighter"
        >
          TaskFlow
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="mb-10 flex justify-center">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-xl rotate-3">
              <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Management made <span className="text-zinc-500">invisible.</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-10 text-balance">
            Collaborative task management designed for teams that value speed, clarity, and beautiful organization.
          </p>
          <button 
            onClick={login}
            className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg shadow-lg shadow-primary/20"
          >
            Sign in with Google
            <Plus className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground font-sans">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : -300,
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className={cn(
          "bg-card border-r border-border flex flex-col h-full shrink-0 z-50 overflow-hidden",
          "fixed lg:relative inset-y-0 left-0 w-[300px]",
          !isSidebarOpen && "lg:w-0 border-none px-0"
        )}
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/10">
              <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
            </div>
            TaskFlow
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="mb-10">
            <div className="flex items-center justify-between px-2 mb-4">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Workspaces</h2>
              <button 
                onClick={() => setIsCreateBoardOpen(true)}
                className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
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
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                    activeBoard?.id === board.id 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10 scale-[1.02]" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <LayoutDashboard className={cn("w-4 h-4", activeBoard?.id === board.id ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span className="truncate">{board.name}</span>
                  </div>
                  {activeBoard?.id === board.id && (
                    <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                  )}
                </button>
              ))}
              {boards.length === 0 && (
                <div className="px-4 py-8 text-center bg-muted/50 rounded-2xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">No boards created yet</p>
                  <button 
                    onClick={() => setIsCreateBoardOpen(true)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Create your first board
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-2 bg-card border border-border rounded-2xl shadow-sm">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                className="w-10 h-10 rounded-xl object-cover" 
                alt={user.displayName || 'User'} 
              />
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-bold truncate leading-none mb-1">{user.displayName}</div>
                <div className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-semibold">Standard Member</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center justify-center gap-2 h-10 text-xs font-bold bg-card border border-border rounded-xl hover:bg-muted transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
              <button 
                onClick={signOut}
                className="flex items-center justify-center gap-2 h-10 text-xs font-bold text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded-xl border border-border transition-colors mr-4"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold truncate">{activeBoard?.name || 'TaskFlow'}</h1>
        </div>

        {/* Header */}
        <header className="h-24 px-6 lg:px-10 hidden lg:flex items-center justify-between gap-6 z-10 sticky top-0 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-6 min-w-0">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 hover:bg-muted rounded-xl hidden lg:flex border border-border transition-colors shadow-sm"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col min-w-0">
              <h1 className="text-2xl font-black tracking-tight truncate leading-none mb-1">
                {activeBoard?.name || 'Welcome to TaskFlow'}
              </h1>
              <p className="text-xs font-semibold text-muted-foreground truncate">
                {activeBoard ? 'Manage and track your project tasks' : 'Select a workspace to start managing tasks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="relative hidden md:block group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-card border border-border rounded-2xl pl-11 pr-5 py-2.5 text-sm w-72 focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm"
              />
            </div>
            <button className="w-11 h-11 flex items-center justify-center bg-card border border-border rounded-xl hover:bg-muted transition-colors relative group shadow-sm">
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-4 ring-card group-hover:ring-muted"></span>
            </button>
          </div>
        </header>

        {/* Board View */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto kanban-scroll scroll-smooth">
            {activeBoard ? (
              <div className="p-6 lg:p-10 min-h-full">
                <KanbanBoard key={activeBoard.id} boardId={activeBoard.id} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Workspace Active</h2>
                <p className="text-muted-foreground max-w-sm mb-8">
                  Get started by selecting an existing workspace or creating a new one from the sidebar.
                </p>
                <button 
                  onClick={() => setIsCreateBoardOpen(true)}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/10 hover:scale-105 transition-all"
                >
                  Create Board
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals Container */}
      <AnimatePresence>
        {/* Create Board Modal */}
        {isCreateBoardOpen && (
          <Modal onClose={() => setIsCreateBoardOpen(false)}>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black leading-none mb-1">New Workspace</h2>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Workspace Definition</p>
                </div>
              </div>
              <form onSubmit={handleCreateBoard}>
                <div className="mb-8">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Space Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="e.g. Design Sprint" 
                    className="w-full h-14 px-5 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-lg placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreateBoardOpen(false)}
                    className="flex-1 h-14 border border-border rounded-2xl font-bold hover:bg-muted transition-all"
                  >
                    Dismiss
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Confirm Space
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {/* Settings Modal */}
        {isSettingsOpen && (
          <Modal onClose={() => setIsSettingsOpen(false)}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black leading-none mb-1">Preferences</h2>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Global Configuration</p>
                  </div>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-10">
                {/* Visual Theme Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sun className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Visual Theme</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <ThemeButton 
                      active={theme === 'light'} 
                      onClick={() => setTheme('light')} 
                      icon={<Sun className="w-4 h-4" />} 
                      label="Light" 
                    />
                    <ThemeButton 
                      active={theme === 'dark'} 
                      onClick={() => setTheme('dark')} 
                      icon={<Moon className="w-4 h-4" />} 
                      label="Dark" 
                    />
                    <ThemeButton 
                      active={theme === 'system'} 
                      onClick={() => setTheme('system')} 
                      icon={<Monitor className="w-4 h-4" />} 
                      label="System" 
                    />
                  </div>
                </section>

                {/* Profile Information */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">User Profile</h3>
                  </div>
                  <div className="p-5 bg-muted/30 rounded-2xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={user.photoURL!} className="w-12 h-12 rounded-xl" />
                      <div>
                        <div className="font-bold">{user.displayName}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-primary px-4 py-2 bg-card border border-border rounded-xl">Edit</button>
                  </div>
                </section>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable Modal Component
function Modal({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/40 backdrop-blur-[8px]"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-card w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-border overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
}

function ThemeButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border border-border transition-all",
        active 
          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10" 
          : "hover:bg-muted hover:border-muted-foreground"
      )}
    >
      {icon}
      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

