'use strict';

(function (window) {
  const DB_NAME = 'anime_manga_db';
  const DB_VERSION = 1;
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('mangas')) {
          db.createObjectStore('mangas', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chapters')) {
          const store = db.createObjectStore('chapters', { keyPath: 'id' });
          store.createIndex('mangaId', 'mangaId', { unique: false });
        }
        if (!db.objectStoreNames.contains('pages')) {
          const store = db.createObjectStore('pages', { keyPath: 'id' });
          store.createIndex('chapterId', 'chapterId', { unique: false });
        }
      };
      req.onsuccess = function (e) { resolve(e.target.result); };
      req.onerror = function (e) { reject(e.target.error); };
    });
    return dbPromise;
  }

  function tx(store, mode) {
    return openDB().then(db => db.transaction(store, mode).objectStore(store));
  }

  /* ---- Mangas ---- */
  async function addManga(manga) {
    const store = await tx('mangas', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.add(manga);
      req.onsuccess = () => resolve(manga);
      req.onerror = () => reject(req.error);
    });
  }

  async function updateManga(manga) {
    const store = await tx('mangas', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(manga);
      req.onsuccess = () => resolve(manga);
      req.onerror = () => reject(req.error);
    });
  }

  async function getManga(id) {
    const store = await tx('mangas', 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getAllMangas() {
    const store = await tx('mangas', 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteManga(id) {
    // delete manga + its chapters + pages
    const chapters = await getChaptersByManga(id);
    for (const ch of chapters) {
      const pages = await getPagesByChapter(ch.id);
      for (const pg of pages) {
        await deletePage(pg.id);
      }
      const store = await tx('chapters', 'readwrite');
      await new Promise((res, rej) => {
        const r = store.delete(ch.id);
        r.onsuccess = () => res();
        r.onerror = () => rej(r.error);
      });
    }
    const store2 = await tx('mangas', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store2.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /* ---- Chapters ---- */
  async function addChapter(chapter) {
    const store = await tx('chapters', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.add(chapter);
      req.onsuccess = () => resolve(chapter);
      req.onerror = () => reject(req.error);
    });
  }

  async function getChaptersByManga(mangaId) {
    const store = await tx('chapters', 'readonly');
    const idx = store.index('mangaId');
    return new Promise((resolve, reject) => {
      const req = idx.getAll(mangaId);
      req.onsuccess = () => resolve((req.result || []).sort((a, b) => a.order - b.order));
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteChapter(id) {
    const pages = await getPagesByChapter(id);
    for (const pg of pages) await deletePage(pg.id);
    const store = await tx('chapters', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /* ---- Pages ---- */
  async function addPage(page) {
    const store = await tx('pages', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.add(page);
      req.onsuccess = () => resolve(page);
      req.onerror = () => reject(req.error);
    });
  }

  async function getPagesByChapter(chapterId) {
    const store = await tx('pages', 'readonly');
    const idx = store.index('chapterId');
    return new Promise((resolve, reject) => {
      const req = idx.getAll(chapterId);
      req.onsuccess = () => resolve((req.result || []).sort((a, b) => a.order - b.order));
      req.onerror = () => reject(req.error);
    });
  }

  async function deletePage(id) {
    const store = await tx('pages', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /* ---- Utils ---- */
  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function blobToUrl(blob) {
    return URL.createObjectURL(blob);
  }

  window.MangaDB = {
    addManga, updateManga, getManga, getAllMangas, deleteManga,
    addChapter, getChaptersByManga, deleteChapter,
    addPage, getPagesByChapter, deletePage,
    genId, blobToUrl
  };
})(window);
