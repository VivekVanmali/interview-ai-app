export const auth = {
    currentUser: { uid: 'test-user-id' }
  };
  
  export const firestore = {
    collection: jest.fn(),
    doc: jest.fn().mockReturnThis(),
    setDoc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    where: jest.fn().mockReturnThis(),
    query: jest.fn(),
    getDocs: jest.fn(),
  };