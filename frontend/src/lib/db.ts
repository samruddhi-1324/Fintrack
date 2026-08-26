import Dexie, { Table } from 'dexie';
import { CreateExpensePayload } from '../types/expense';

export interface OfflineExpenseQueueItem {
  id?: number;
  payload: CreateExpensePayload;
  created_at: string;
  synced: boolean;
}

export class FinTrackOfflineDB extends Dexie {
  offlineExpenses!: Table<OfflineExpenseQueueItem>;

  constructor() {
    super('FinTrackOfflineDB');
    this.version(1).stores({
      offlineExpenses: '++id, created_at, synced'
    });
  }
}

export const offlineDB = new FinTrackOfflineDB();
