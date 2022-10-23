import { getCollection } from '../utilities/firestore.utility';
import { DATA_MODEL } from '../variables';

export function todoListRepository() {
  return getCollection(DATA_MODEL.TODO_LIST);
}

export function todoRepository() {
  return getCollection(DATA_MODEL.TODO);
}
