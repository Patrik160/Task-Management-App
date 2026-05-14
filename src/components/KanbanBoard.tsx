import React, { useState, useEffect } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  Paperclip, 
  MessageSquare,
  AlertCircle,
  Clock,
  ArrowRight
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

    const sourceColId = source.droppableId as ColumnId;
    const destColId = destination.droppableId as ColumnId;

    // Persist to Firebase
    await updateTask(boardId, draggableId, {
      status: destColId,
      order: destination.index // Simplistic ordering, in a real app you'd calculate a fractional position
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 min-h-full h-fit pb-8">
        {(Object.entries(columns) as [ColumnId, Column][]).map(([id, column]) => (
          <div key={id} className="w-80 flex-shrink-0 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-900">{column.title}</h3>
                <span className="bg-zinc-200 text-zinc-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  {column.tasks.length}
                </span>
              </div>
              <button className="p-1 hover:bg-zinc-200 rounded text-zinc-500">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <Droppable droppableId={id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex-1 min-h-[150px] rounded-xl transition-colors p-2 space-y-3",
                    snapshot.isDraggingOver ? "bg-zinc-200/50" : "bg-transparent"
                  )}
                >
                  {column.tasks.map((task, index) => (
                    <TaskCard key={task.id} task={task} index={index} boardId={boardId} />
                  ))}
                  {provided.placeholder}

                  {/* Add Task Input */}
                  <AnimatePresence>
                    {isAddingTask === id ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"
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
                          placeholder="What needs to be done?"
                          className="w-full text-sm outline-none resize-none min-h-[60px]"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <button 
                            onClick={() => setIsAddingTask(null)}
                            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleCreateTask(id)}
                            className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors"
                          >
                            Add Task
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setIsAddingTask(id)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-200 border-dashed text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-all text-sm group"
                      >
                        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Add a task
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
  );
};

const TaskCard: React.FC<{ task: Task; index: number; boardId: string }> = ({ task, index, boardId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const priorityColors = {
    low: "bg-emerald-50 text-emerald-600 border-emerald-100",
    medium: "bg-amber-50 text-amber-600 border-amber-100",
    high: "bg-rose-50 text-rose-600 border-rose-100"
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      await deleteTask(boardId, task.id);
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group bg-white p-4 rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:border-zinc-300",
            snapshot.isDragging && "shadow-2xl border-zinc-400 rotate-1 scale-105 z-50",
            (task.status === 'done' || isDeleting) && "opacity-75"
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
              priorityColors[task.priority]
            )}>
              {task.priority}
            </span>
            <button 
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 hover:text-red-500 rounded text-zinc-400 transition-all"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className={cn(
            "text-sm font-medium mb-3 line-clamp-3 leading-relaxed",
            task.status === 'done' && "line-through text-zinc-400"
          )}>
            {task.title}
          </h4>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                <Clock className="w-3 h-3" />
                {task.createdAt ? format(task.createdAt.toDate(), 'MMM d') : 'Recent'}
              </div>
            </div>
            
            <div className="flex -space-x-1.5 focus-within:z-10">
              <img 
                src={`https://ui-avatars.com/api/?name=${task.assigneeId || 'U'}&background=random&size=32`} 
                className="w-6 h-6 rounded-full border-2 border-white ring-1 ring-zinc-100" 
                alt="Assignee" 
              />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
