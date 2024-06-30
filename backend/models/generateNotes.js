const mongoose = require('mongoose');
const Note = require('./note')

const generateNotes = (x) => {
  const notes = [];
  for (let i = 1; i <= x; i++) {
    notes.push({
      id: i,
      title: `Note ${i}`,
      author: {
        name: `Author ${i}`,
        email: `mail_${i}@gmail.com`,
      },
      content: `Content for note ${i}`,
    });
  }
  return notes;
};

const addNotes = async (notes) => {
  try {
    await Note.insertMany(notes);
    console.log(`${notes.length} notes added successfully`);
  } catch (error) {
    console.error('Error adding notes:', error);
  } finally {
    mongoose.connection.close();
  }
};

module.exports = { generateNotes, addNotes};