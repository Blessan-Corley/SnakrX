const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp();
}

let firestoreInstance = null;

const getDb = () => {
  if (!firestoreInstance) {
    firestoreInstance = admin.firestore();
  }

  return firestoreInstance;
};

const db = new Proxy(
  {},
  {
    get(_target, property) {
      const firestore = getDb();
      const value = firestore[property];

      return typeof value === 'function' ? value.bind(firestore) : value;
    }
  }
);

module.exports = {
  functions,
  admin,
  crypto,
  nodemailer,
  getDb,
  db,
};
