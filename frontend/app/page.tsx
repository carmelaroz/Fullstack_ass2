"use client";
import React from 'react';
import { useState , useEffect} from 'react';
import axios from 'axios';
import Post, {PostProps} from '../components/Post';
import Pagination from '../components/Pagination';
import './style.css';

const POSTS_PER_PAGE : number = 10;
const NOTES_URL : string = "//localhost:3001/notes";

export default function Home() {
  const [notes, setNotes] = useState<PostProps[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newNote, setNewNote] = useState({ id: '', title: '', content: '', author: { name: '', email: '' } });
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  
  useEffect(() => {
    const promise = axios.get(NOTES_URL, {
        params: {
          _page: activePage,
          _per_page: POSTS_PER_PAGE
        }});
    promise.then(response => { 
      setNotes(response.data);
      const totalCount = parseInt(response.headers['x-total-count']);
      const totalPagesCount = Math.ceil(totalCount / POSTS_PER_PAGE);
      setTotalPages(totalPagesCount)
    }).catch(error => { console.log("Encountered an error:" + error); });
}, [activePage]);

const handlePageChange = (page: number) => {
    setActivePage(page);
  };
  
const handleDelete = async (index: number) => {
try {
    await axios.delete(`${NOTES_URL}/${index}`);
    setNotes(notes.filter(note => note.id !== index));
} catch (error) {
    console.log("Encountered an error while deleting:" + error);
}
};
  
const handleUpdateContent = async (index: number, newContent: string) => {
    try {
      await axios.put(`${NOTES_URL}/${index}`, { content: newContent });
      console.log(`Updating note ID ${index} with new content:`, newContent);
      setNotes(notes.map(note => {
        if (note.id === index) {
          return { ...note, content: newContent };
        }
        return note;
      }));
    } catch (error) {
      console.error("Encountered an error while updating content:", error);
    }
    
  };
  
const handleAddNewNote = async () => {
try {
    const response = await axios.post(NOTES_URL, newNote, {
    headers: {
        'Content-Type': 'application/json',
    },
    });
    setNotes([...notes, response.data]);
    setShowNewNoteForm(false);
    setNewNote({ id: '', title: '', content: '', author: { name: '', email: '' } });
} catch (error) {
    console.error('Encountered an error while adding a new note:', error);
}
};

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
const { name, value } = event.target;
setNewNote(prevNote => {
    if (name.startsWith('author.')) {
    const authorField = name.split('.')[1];
    return {
        ...prevNote,
        author: {
        ...prevNote.author,
        [authorField]: value
        }
    };
    }
    if (name === 'text_input_new_note') {
      return {
        ...prevNote,
        content: value
      };
    }
    return {
    ...prevNote,
    [name]: value
    };
});
};

const handleChangeTheme = () => {
  setDarkTheme(!darkTheme);
  if (!darkTheme) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
};

return (
  <>
    {notes.map(note => (
      <Post key= {`${note.id}`} post={{ ...note, onDelete: handleDelete, onUpdateContent: handleUpdateContent }} />
    ))}
    <div className="pagination">
    <Pagination
        pagination={{
          currPage: activePage,
          totalPages: totalPages,
          handlePageChange: handlePageChange
        }}
      />
    </div>
    <div  className="add-new-note">
        {showNewNoteForm ? (
          <div className="new-note-form" >
              <input
              type="text"
              name="id"
              placeholder="id"
              value={newNote.id}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={newNote.title}
              onChange={handleInputChange}
            />
            <textarea name="text_input_new_note"
              placeholder="Content"
              value={newNote.content}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="author.name"
              placeholder="Author Name"
              value={newNote.author.name}
              onChange={handleInputChange}
            />
            <input
              type="email"
              name="author.email"
              placeholder="Author Email"
              value={newNote.author.email}
              onChange={handleInputChange}
            />
            <button name="text_input_save_new_note" onClick={handleAddNewNote}>Save</button>
            <button name="text_input_cancel_new_note" onClick={() => setShowNewNoteForm(false)}>Cancel</button>
          </div>
        ) : (
          <button name="add-new-note" onClick={() => setShowNewNoteForm(true)}>Add new note</button>
        )}
      </div>
      <div>
      <button className="theme-button" onClick={handleChangeTheme} name="change_theme">
      Change Theme
      </button>
    </div>
  </>
  
);
}
