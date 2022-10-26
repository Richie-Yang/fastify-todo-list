import * as _ from 'lodash';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firestore } from 'firebase-admin';
import { printLog, getLogOptions } from '../utils';
import {
  WhereQuery,
  CollectionRef,
  QueryRef,
  OrderQuery,
  FilterQuery,
} from '../types';
import { SRV_PROVIDER } from '../variables';

// initialize firestore
initializeApp({});
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

export function getCollection(collectionName: string) {
  return {
    findWhole: findWhole(collectionName),
    findOne: findOne(collectionName),
    findAll: findAll(collectionName),
    findById: findById(collectionName),
    countAll: countAll(collectionName),
    create: create(collectionName),
    update: update(collectionName),
    hardDelete: hardDelete(collectionName),
  };
}

function findWhole(collectionName: string) {
  return async (where: WhereQuery | null = null) =>
    await _fetchWhole(collectionName, where);
}

function findOne(collectionName: string) {
  return async (where: WhereQuery | null = null) => {
    const whole = await _fetchWhole(collectionName, where);
    const sortedWhole = whole.sort(
      (prev, next) => next.createdAt - prev.createdAt
    );
    return _.get(sortedWhole, '[0]', null) as firestore.DocumentData | null;
  };
}

async function _fetchWhole(
  collectionName: string,
  where: WhereQuery | null = null
) {
  const result: firestore.DocumentData[] = [];
  const { srvProvider, collection } = _getSettings(collectionName);
  const logOptions = getLogOptions({
    srvProvider,
    service: `${_fetchWhole.name}-${collectionName}`,
  });

  let docRef: QueryRef | CollectionRef = collection;
  if (where) {
    const searchEntries = Array.isArray(where[0]) ? where : [where];
    for (const entry of searchEntries) {
      const [searchKey, op, searchValue] = entry;
      docRef = await (docRef || collection).where(searchKey, op, searchValue);
    }
  } else docRef = collection;

  let allDocs = await docRef.get();
  if (allDocs.empty) return result;
  allDocs.forEach((doc) => result.push(doc.data()));

  printLog(logOptions);
  return result;
}

function findAll(collectionName: string) {
  return async (options: FilterQuery) => {
    const result: {
      size: number;
      page: number;
      total: number;
      pageCount: number;
      rows: firestore.DocumentData[];
    } = { size: 0, page: 0, total: 0, pageCount: 0, rows: [] };
    let { size, page, order, where } = options;
    const { srvProvider, collection } = _getSettings(collectionName);
    const logOptions = getLogOptions({
      srvProvider,
      service: `${findAll.name}-${collectionName}`,
    });

    let allDocs: firestore.QuerySnapshot<firestore.DocumentData> | null = null,
      searchEntries: WhereQuery[],
      orderEntries: OrderQuery[];
    let docRef: QueryRef | CollectionRef = collection;
    const inputOrderMap = new Map();

    if (order) {
      orderEntries = (
        Array.isArray(order[0]) ? order : [order]
      ) as OrderQuery[];
      for (const entry of orderEntries) {
        const [orderField, orderDirection] = entry;
        inputOrderMap.set(orderField, orderDirection);
      }
    }

    if (where) {
      searchEntries = (
        Array.isArray(where[0]) ? where : [where]
      ) as WhereQuery[];
      const orderKeyArray: (string | firestore.FieldPath)[] = [];
      for (const entry of searchEntries) {
        const [searchKey, op, searchValue] = entry;
        docRef = await (docRef || collection).where(searchKey, op, searchValue);
        if (['==', 'in'].includes(op) || orderKeyArray.includes(searchKey))
          continue;
        docRef = inputOrderMap.has(searchKey)
          ? await docRef.orderBy(searchKey, inputOrderMap.get(searchKey))
          : await docRef.orderBy(searchKey, 'desc');
        inputOrderMap.delete(searchKey);
        orderKeyArray.push(searchKey);
      }
      allDocs = await docRef.get();
    } else docRef = collection;

    // const allDocSize = where && allDocs ? allDocs.size : await _getDocSize();
    const allDocSize = where && allDocs ? allDocs.size : 0;
    if (!allDocSize) return result;
    result.total = allDocSize;

    if (order) {
      for (const mapKey in inputOrderMap) {
        docRef = await docRef.orderBy(mapKey, inputOrderMap.get(mapKey));
      }
    }

    size = size | 5;
    result.size = size;
    docRef = docRef.limit(size);

    page = page | 1;
    result.page = page;
    docRef = docRef.offset(size * (page - 1));

    let docSnap = await docRef.get();
    docSnap.forEach((doc) => {
      result.rows.push(doc.data());
    });
    result.pageCount = Math.ceil(result.total / size);

    printLog(logOptions);
    return result;
  };
}

function findById(collectionName: string) {
  return async (documentId: string) => {
    const { srvProvider, collection } = _getSettings(collectionName);
    const logOptions = getLogOptions({
      srvProvider,
      service: `${findById.name}-${collectionName}`,
    });
    const docSnap = await collection.doc(documentId).get();
    printLog(logOptions);
    return docSnap.data() || null;
  };
}

function countAll(collectionName: string) {
  return async () => {
    const { srvProvider, collection } = _getSettings(collectionName);
    const logOptions = getLogOptions({
      srvProvider,
      service: `${countAll.name}-${collectionName}`,
    });
    const docRefs = await collection.get();
    printLog(logOptions);
    return docRefs.size;
  };
}

function create(collectionName: string) {
  return async (
    createData: { [key: string]: any } = {},
    documentId?: string
  ) => {
    const { srvProvider, collection } = _getSettings(collectionName);
    const logOptions = getLogOptions({
      srvProvider,
      service: `${create.name}-${collectionName}`,
    });
    const data = Object.assign(createData, {
      id: documentId || _genRandomCode(12),
      createdAt: Math.round(Date.now() / 1000),
      updatedAt: Math.round(Date.now() / 1000),
    });
    await collection.doc(data.id).set(data);
    printLog(logOptions);
    return true;
  };
}

function update(collectionName: string) {
  return async (
    documentId: string,
    updateData: { updatedAt?: number } = {}
  ) => {
    const { srvProvider, collection } = _getSettings(collectionName);
    const logOptions = getLogOptions({
      srvProvider,
      service: `update-${collectionName}`,
    });
    updateData.updatedAt = Math.round(Date.now() / 1000);
    await collection.doc(documentId).update(updateData);
    printLog(logOptions);
    return true;
  };
}

function hardDelete(collectionName: string) {
  return async (documentId: string) => {
    const { srvProvider, collection } = _getSettings(collectionName);
    const logOptions = getLogOptions({
      srvProvider,
      service: `${hardDelete.name}-${collectionName}`,
    });
    await collection.doc(documentId).delete();
    printLog(logOptions);
    return true;
  };
}

function _getSettings(collectionName: string) {
  return {
    srvProvider: SRV_PROVIDER.FIRESTORE,
    collection: db.collection(collectionName),
  };
}

function _genRandomCode(length: number) {
  const char = '1234567890abcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i = 0; i < length; i++) {
    code = code + char[Math.floor(Math.random() * char.length)];
  }
  return code;
}
