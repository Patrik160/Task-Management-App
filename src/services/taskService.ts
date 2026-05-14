import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string;
  creatorId: string;
  boardId: string;
  order: number;
  deadline?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Boards
export const subscribeBoards = (userId: string, callback: (boards: Board[]) => void) => {
  const q = query(
    collection(db, 'boards'),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const boards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
    callback(boards);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'boards');
  });
};

export const createBoard = async (name: string, ownerId: string) => {
  try {
    return await addDoc(collection(db, 'boards'), {
      name,
      ownerId,
      members: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'boards');
  }
};

// Tasks
export const subscribeTasks = (boardId: string, callback: (tasks: Task[]) => void) => {
  const q = query(
    collection(db, 'boards', boardId, 'tasks'),
    orderBy('order', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    callback(tasks);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `boards/${boardId}/tasks`);
  });
};

export const createTask = async (boardId: string, task: Partial<Task>) => {
  try {
    return await addDoc(collection(db, 'boards', boardId, 'tasks'), {
      ...task,
      boardId,
      creatorId: auth.currentUser?.uid,
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `boards/${boardId}/tasks`);
  }
};

export const updateTask = async (boardId: string, taskId: string, updates: Partial<Task>) => {
  try {
    const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
    return await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `boards/${boardId}/tasks/${taskId}`);
  }
};

export const deleteTask = async (boardId: string, taskId: string) => {
  try {
    const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
    return await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `boards/${boardId}/tasks/${taskId}`);
  }
};
