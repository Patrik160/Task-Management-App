import React, { useState, useEffect } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import { 
  Plus, 
  MessageSquare,
  Clock,
  CheckCircle2,
  X,
  Type,
  AlignLeft,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Task, subscribeTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { cn } from '../lib/utils';

type ColumnId = 'todo' | 'in-progress' | 'done';

interface Column {
  id: ColumnId;
  title: string;
  tasks: Task[];
}

export const KanbanBoard: React.FC<{ boardId: string }> = ({ boardId }) => {
  const [columns, setColumns] = useState<Record<ColumnId, Column>>({
    'todo': { id: 'todo', title: 'To Do', tasks: [] },
    'in-progress': { id: 'in-progress', title: 'In Progress', tasks: [] },
    'done': { id: 'done', title: 'Done', tasks: [] }
  });
  const [isAddingTask, setIsAddingTask] = useState<ColumnId | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeTasks(boardId, (data) => {
      const newCols: Record<ColumnId, Column> = {
        'todo': { id: 'todo', title: 'To Do', tasks: [] },
        'in-progress': { id: 'in-progress', title: 'In Progress', tasks: [] },
        'done': { id: 'done', title: 'Done', tasks: [] }
      };

      data.forEach(task => {
        if (newCols[task.status]) {
          newCols[task.status].tasks.push(task);
        }
      });

      setColumns(newCols);
    });

    return () => unsubscribe();
  }, [boardId]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const destColId = destination.droppableId as ColumnId;

    // Persist to Firebase
    await updateTask(boardId, draggableId, {
      status: destColId,
      order: destination.index
    });
  };

  const handleCreateTask = async (colId: ColumnId) => {
    if (!newTaskTitle.trim()) return;
    await createTask(boardId, {
      title: newTaskTitle.trim(),
      status: colId,
      order: columns[colId].tasks.length,
      priority: 'medium'
    });
    setNewTaskTitle('');
    setIsAddingTask(null);
  };

  return (
    <div className="relative">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-10 min-h-[600px] kanban-scroll items-start px-4">
          {(Object.entries(columns) as [ColumnId, Column][]).map(([id, column]) => (
            <div key={id} className="w-[300px] shrink-0 flex flex-col group/column">
              <div className="flex items-center justify-between mb-4 px-4 py-2 bg-muted/50 backdrop-blur-sm border border-border rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                    id === 'todo' && "bg-zinc-400",
                    id === 'in-progress' && "bg-amber-500",
                    id === 'done' && "bg-emerald-500"
                  )} />
                  <h3 className="font-bold text-xs tracking-tight uppercase text-muted-foreground">{column.title}</h3>
                  <span className="text-[10px] font-bold text-muted-foreground/60">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 min-h-[200px] rounded-2xl transition-all p-2 space-y-3",
                      snapshot.isDraggingOver ? "bg-muted/30 scale-[0.99]" : "bg-transparent"
                    )}
                  >
                    {column.tasks.map((task, index) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        index={index} 
                        onClick={() => setEditingTask(task)}
                      />
                    ))}
                    {provided.placeholder}

                    {/* Add Task Control */}
                    <AnimatePresence mode="wait">
                      {isAddingTask === id ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-card p-4 rounded-2xl border border-border shadow-xl"
                        >
                          <textarea
                            autoFocus
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleCreateTask(id);
                              }
                              if (e.key === 'Escape') setIsAddingTask(null);
                            }}
                            placeholder="Task name..."
                            className="w-full text-sm font-medium outline-none resize-none min-h-[60px] bg-transparent"
                          />
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                            <button 
                              onClick={() => setIsAddingTask(null)}
                              className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest px-2"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleCreateTask(id)}
                              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
                            >
                              Add
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => setIsAddingTask(id)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-border border-dashed text-muted-foreground/60 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all text-xs font-bold group"
                        >
                          <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                          Add Task
                        </button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task Details Modal */}
      <AnimatePresence>
        {editingTask && (
          <TaskDetailsModal 
            task={editingTask} 
            boardId={boardId} 
            onClose={() => setEditingTask(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TaskCard: React.FC<{ task: Task; index: number; onClick: () => void }> = ({ task, index, onClick }) => {
  const priorityColors = {
    low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    high: "bg-rose-500/10 text-rose-600 border-rose-500/20"
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            "group bg-card p-4 rounded-xl border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/20 cursor-grab active:cursor-grabbing",
            snapshot.isDragging && "shadow-xl border-primary/40 rotate-[1deg] scale-[1.01] z-50",
            task.status === 'done' && "opacity-60 grayscale-[0.3]"
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded-md border",
              priorityColors[task.priority]
            )}>
              {task.priority}
            </span>
            <div className="w-6 h-6 rounded-lg border border-border overflow-hidden bg-muted">
              <img 
                src={`https://ui-avatars.com/api/?name=${task.assigneeId || '?'}&background=random&size=32`} 
                className="w-full h-full object-cover" 
                alt="A" 
              />
            </div>
          </div>

          <h4 className={cn(
            "text-[14px] font-semibold mb-2 leading-snug tracking-tight line-clamp-2",
            task.status === 'done' && "line-through decoration-muted-foreground/30 text-muted-foreground"
          )}>
            {task.title}
          </h4>

          {task.description && (
            <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                <Clock className="w-2.5 h-2.5" />
                {task.createdAt ? format(task.createdAt.toDate(), 'MMM d') : 'Now'}
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold">
                <MessageSquare className="w-2.5 h-2.5" />
                2
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const TaskDetailsModal: React.FC<{ task: Task; boardId: string; onClose: () => void }> = ({ task, boardId, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    setIsSaving(true);
    await updateTask(boardId, task.id, {
      title,
      description,
      priority,
      status
    });
    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Permanently delete this task?')) {
      await deleteTask(boardId, task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative bg-card w-full max-w-2xl rounded-t-[2rem] md:rounded-[3rem] shadow-2xl border-t md:border border-border grid grid-cols-1 md:grid-cols-5 overflow-hidden max-h-[90vh] md:max-h-[85vh]"
      >
        <div className="md:col-span-3 p-6 lg:p-10 border-b md:border-b-0 md:border-r border-border overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-2 text-muted-foreground/60">
                  <Type className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Task Title</span>
               </div>
               <input 
                 type="text" 
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="text-xl lg:text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 w-full tracking-tight"
               />
            </div>

            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-2 text-muted-foreground/60">
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Description</span>
               </div>
               <textarea 
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder="Add details..."
                 className="w-full bg-muted/20 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/5 transition-all text-sm font-medium leading-relaxed resize-none min-h-[120px]"
               />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-muted/5 p-6 lg:p-10 flex flex-col gap-6 lg:gap-8 overflow-y-auto">
          <section>
            <h3 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">Properties</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'todo' | 'in-progress' | 'done')}
                  className="w-full bg-card border border-border h-11 rounded-xl px-4 text-xs font-bold outline-none appearance-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        "flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                        priority === p 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-auto flex flex-col gap-3">
             <button 
              onClick={handleUpdate}
              disabled={isSaving}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl lg:rounded-2xl font-bold shadow-xl shadow-primary/10 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
             >
               {isSaving ? 'Syncing...' : 'Update Task'}
               {!isSaving && <CheckCircle2 className="w-4 h-4" />}
             </button>
             <button 
              onClick={handleDelete}
              className="w-full h-12 bg-rose-500/5 text-rose-500 border border-rose-500/10 rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-500/10 transition-all"
             >
               Delete
               <Trash2 className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors hidden md:block"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};
