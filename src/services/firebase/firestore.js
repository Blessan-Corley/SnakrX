/**
 * Firestore Operations Module
 * Reusable Firestore CRUD operations with retry logic
 */

import { getDoc, setDoc, updateDoc } from './config.js';
import logger from '../../utils/logger.js';

/**
 * Firestore operations with retry logic and error handling
 */
export const firestoreOperations = {
  /**
   * Get document with retry logic
   */
  async getDocument(docRef, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const docSnap = await getDoc(docRef);
        return docSnap;
      } catch (error) {
        logger.warn(`Firestore get attempt ${i + 1} failed:`, error);

        // Handle offline mode gracefully
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          logger.info('Working in offline mode - document operations will be limited');
          throw new Error('offline');
        }

        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  },

  /**
   * Set document with retry logic and offline handling
   */
  async setDocument(docRef, data, options = {}) {
    const retries = 3;
    logger.log('🔥 Firebase setDocument called for:', docRef.path);
    logger.log('📝 Data to save:', data);

    for (let i = 0; i < retries; i++) {
      try {
        logger.log(`🔄 Attempt ${i + 1} to save document...`);
        await setDoc(docRef, data, options);
        logger.log('✅ Document saved successfully to Firebase!');
        return true;
      } catch (error) {
        logger.error(`❌ Firestore set attempt ${i + 1} failed:`, error);
        logger.error('Error code:', error.code);
        logger.error('Error message:', error.message);

        // Handle specific Firebase errors
        if (error.code === 'permission-denied') {
          logger.error('🚫 Permission denied - check Firestore security rules');
          throw error;
        }

        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          logger.warn('📡 Working in offline mode - document writes will be cached');
          // In offline mode, Firebase will cache the write and sync later
          return true; // Return true because the write will be cached
        }

        if (error.code === 'unauthenticated') {
          logger.error('🔐 User not authenticated - cannot save to Firebase');
          throw error;
        }

        if (i === retries - 1) {
          logger.error('💥 All attempts failed, throwing error');
          throw error;
        }

        const delay = 1000 * (i + 1);
        logger.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  /**
   * Update document with retry logic and offline handling
   */
  async updateDocument(docRef, data, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await updateDoc(docRef, data);
        return true;
      } catch (error) {
        logger.warn(`Firestore update attempt ${i + 1} failed:`, error);

        // Handle offline mode gracefully
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          logger.info('Working in offline mode - document updates will be cached');
          return false; // Return false instead of throwing to allow graceful degradation
        }

        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
};
