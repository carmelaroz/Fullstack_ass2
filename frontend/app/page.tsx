"use client";
import React from 'react';
import { useState , useEffect} from 'react';
import axios from 'axios';
import Post, {PostProps} from '../components/Post';
import Pagination from '../components/Pagination';
import './style.css';

const POSTS_PER_PAGE : number = 10;
const NOTES_URL : string = "//localhost:3001/api/notes";

export default function Home() {
  const [notes, setNotes] = useState<PostProps[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newNote, setNewNote] = useState({ id: '', title: '', content: '' });
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  
  const [createUserForm, setCreateUserForm] = useState({
    create_user_form_name: '',
    create_user_form_email: '',
    create_user_form_username: '',
    create_user_form_password: '',
  });

  const [loginForm, setLoginForm] = useState({
    login_form_username: '',
    login_form_password: '',
  });

  const [token, setToken] = useState('');
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

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
  await axios.delete(`${NOTES_URL}/${index}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
    setNotes(notes.filter(note => note.id !== index));
} catch (error) {
    console.log("Encountered an error while deleting:" + error);
}
};
  
const handleUpdateContent = async (index: number, newContent: string) => {
    try {
      await axios.put(`${NOTES_URL}/${index}`, { content: newContent }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
  if (!token) {
    console.error('You must be logged in to create a new note.');
    return;
  }

  try {
    const response = await axios.post(NOTES_URL, {
      id: newNote.id,
      title: newNote.title,
      content: newNote.content,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    setNotes([...notes, response.data]);
    setShowNewNoteForm(false);
    setNewNote({ id: '', title: '', content: '' });
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
        [name]: value
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

const handleCreateUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setCreateUserForm({ ...createUserForm, [e.target.name]: e.target.value });
};

const handleCreateUserSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:3001/api/users/users', {
      name: createUserForm.create_user_form_name,
      email: createUserForm.create_user_form_email,
      username: createUserForm.create_user_form_username,
      password: createUserForm.create_user_form_password,
    });
    console.log('User created:', response.data);
    setShowCreateUserForm(false);
    setCreateUserForm({
      create_user_form_name: '',
      create_user_form_email: '',
      create_user_form_username: '',
      create_user_form_password: '',
    });
  } catch (error) {
    console.error('Error creating user:', error);
  }
};

const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
};

const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:3001/api/users/login', {
      username: loginForm.login_form_username,
      password: loginForm.login_form_password,
    });
    setToken(response.data.token);
    console.log('Logged in successfully');
    setShowLoginForm(false);
    setLoginForm({
      login_form_username: '',
      login_form_password: '',
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error logging in:', error.response?.data || error.message);
    } else {
      console.error('Error logging in:', error);
    }
  }
};

const handleLogout = () => {
  setToken('');
  console.log('Logged out successfully');
};

return (
  <>
    {notes.map(note => (
      <Post key= {`${note.id}`} post={{ ...note, onDelete: handleDelete, onUpdateContent: handleUpdateContent, token }} />
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
              className="input-field"
              type="text"
              name="id"
              placeholder="id"
              value={newNote.id}
              onChange={handleInputChange}
            />
            <input
              className="input-field"
              type="text"
              name="title"
              placeholder="Title"
              value={newNote.title}
              onChange={handleInputChange}
            />
            <textarea 
              className="textarea-field"
              name="text_input_new_note"
              placeholder="Content"
              value={newNote.content}
              onChange={handleInputChange}
            />
            <button className="button save-button" name="text_input_save_new_note" onClick={handleAddNewNote}>Save</button>
            <button className="button cancel-button" name="text_input_cancel_new_note" onClick={() => setShowNewNoteForm(false)}>Cancel</button>
          </div>
        ) : (
          <button className="button add-new-note-button" name="add-new-note" onClick={() => setShowNewNoteForm(true)}>Add new note</button>
        )}
      </div>
      <div>
      <button className="theme-button" onClick={handleChangeTheme} name="change_theme">
      Change Theme
      </button>
    </div>

    <div>
      <button className="create-user-button" onClick={() => setShowCreateUserForm(!showCreateUserForm)}>
        {showCreateUserForm ? 'Close Create User Form' : 'Create User'}
      </button>
      {showCreateUserForm && (
        <form className="user-form" name="create_user_form" onSubmit={handleCreateUserSubmit}>
          <div>
            <label>
              Name:
              <input
                className="input-field"
                type="text"
                name="create_user_form_name"
                value={createUserForm.create_user_form_name}
                onChange={handleCreateUserChange}
              />
            </label>
          </div>
          <div>
            <label>
              Email:
              <input
                className="input-field"
                type="email"
                name="create_user_form_email"
                value={createUserForm.create_user_form_email}
                onChange={handleCreateUserChange}
              />
            </label>
          </div>
          <div>
            <label>
              Username:
              <input
                className="input-field"
                type="text"
                name="create_user_form_username"
                value={createUserForm.create_user_form_username}
                onChange={handleCreateUserChange}
              />
            </label>
          </div>
          <div>
            <label>
              Password:
              <input
                className="input-field"
                type="password"
                name="create_user_form_password"
                value={createUserForm.create_user_form_password}
                onChange={handleCreateUserChange}
              />
            </label>
          </div>
          <button className="submit-button" type="submit" name="create_user_form_create_user">Create User</button>
        </form>
      )}

      <button  className="login-button" onClick={() => setShowLoginForm(!showLoginForm)}>
        {showLoginForm ? 'Close Login Form' : 'Login'}
      </button>
      {showLoginForm && (
        <form className="user-form" name="login_form" onSubmit={handleLoginSubmit}>
          <div>
            <label>
              Username:
              <input
                className="input-field"
                type="text"
                name="login_form_username"
                value={loginForm.login_form_username}
                onChange={handleLoginChange}
              />
            </label>
          </div>
          <div>
            <label>
              Password:
              <input
                className="input-field"
                type="password"
                name="login_form_password"
                value={loginForm.login_form_password}
                onChange={handleLoginChange}
              />
            </label>
          </div>
          <button className="submit-button" type="submit" >Login</button>
        </form>
      )}

      <button className="logout-button" name="logout" onClick={handleLogout}>Logout</button>
    </div>
  </>
  
);
}
