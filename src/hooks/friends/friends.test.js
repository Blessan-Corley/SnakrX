import { describe, it, expect, vi, beforeEach } from 'vitest';
import { friendOperations } from '../../services/firebase/friends.js';

// Mock Firestore operations
const mockGetDocument = vi.fn();
const mockSetDocument = vi.fn();
const mockUpdateDocument = vi.fn();
const mockDeleteDoc = vi.fn();

// Dummy objects for references
const mockDocRef = { path: 'mock/path' };
const mockTimestamp = { seconds: 1234567890 };

vi.mock('../../services/firebase/config.js', () => ({
  db: {},
  doc: vi.fn(() => mockDocRef), // Return object
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => mockTimestamp), // Return object
  limit: vi.fn(),
  COLLECTIONS: { USERS: 'users' }
}));

vi.mock('firebase/firestore', () => ({
  deleteDoc: vi.fn((...args) => mockDeleteDoc(...args))
}));

vi.mock('../../services/firebase/firestore.js', () => ({
  firestoreOperations: {
    getDocument: (...args) => mockGetDocument(...args),
    setDocument: (...args) => mockSetDocument(...args),
    updateDocument: (...args) => mockUpdateDocument(...args)
  }
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('Friend Operations', () => {
  const currentUserId = 'user1';
  const targetUserId = 'user2';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendFriendRequest', () => {
    it('should throw error if sending to self', async () => {
      await expect(friendOperations.sendFriendRequest(currentUserId, currentUserId))
        .rejects.toThrow("You cannot add yourself.");
    });

    it('should throw error if already friends', async () => {
      mockGetDocument.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'accepted' })
      });

      await expect(friendOperations.sendFriendRequest(currentUserId, targetUserId))
        .rejects.toThrow("User is already your friend.");
    });

    it('should send request successfully if no relationship exists', async () => {
      mockGetDocument.mockResolvedValueOnce({ exists: () => false }); // No existing doc

      const result = await friendOperations.sendFriendRequest(currentUserId, targetUserId);
      
      expect(result).toBe(true);
      // Expect 2 setDocuments: one for sender, one for receiver
      expect(mockSetDocument).toHaveBeenCalledTimes(2);
      // Verify pending_sent for sender
      expect(mockSetDocument).toHaveBeenNthCalledWith(1, expect.any(Object), expect.objectContaining({ status: 'pending_sent' }));
      // Verify pending_received for receiver
      expect(mockSetDocument).toHaveBeenNthCalledWith(2, expect.any(Object), expect.objectContaining({ status: 'pending_received' }));
    });
  });

  describe('acceptFriendRequest', () => {
    it('should throw error if request does not exist', async () => {
      mockGetDocument.mockResolvedValueOnce({ exists: () => false });

      await expect(friendOperations.acceptFriendRequest(currentUserId, targetUserId))
        .rejects.toThrow("No pending friend request from this user.");
    });

    it('should update statuses to accepted', async () => {
      mockGetDocument.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'pending_received' })
      });

      const result = await friendOperations.acceptFriendRequest(currentUserId, targetUserId);

      expect(result).toBe(true);
      expect(mockUpdateDocument).toHaveBeenCalledTimes(2);
      expect(mockUpdateDocument).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ status: 'accepted' }));
    });
  });

  describe('removeFriend', () => {
    it('should delete friendship documents', async () => {
      const result = await friendOperations.removeFriend(currentUserId, targetUserId);
      
      expect(result).toBe(true);
      // Should delete both documents (sender's and receiver's copies)
      expect(mockDeleteDoc).toHaveBeenCalledTimes(2); 
    });
  });
});
