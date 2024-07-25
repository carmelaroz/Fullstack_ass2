"use client";
import React from 'react';
import { useState , useEffect, useRef} from 'react';
import axios from 'axios';
import Post, {PostProps} from '../components/Post';
import Pagination from '../components/Pagination';
import '../css/style.css';

const POSTS_PER_PAGE : number = 10;
const NOTES_URL : string = "//localhost:3001/notes";

interface HomeProps {
  initialNotes: PostProps[];
  initialTotalPages: number;
}

export async function getStaticProps() {
  const response = await axios.get(NOTES_URL, {
    params: {
      _page: 1,
      _per_page: POSTS_PER_PAGE,
    },
  });

  const initialNotes = response.data;
  const totalCount = parseInt(response.headers['x-total-count']);
  const initialTotalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  return {
    props: {
      initialNotes,
      initialTotalPages,
    },
  };
}

export default function Home({ initialNotes, initialTotalPages }: HomeProps) {
  const [notes, setNotes] = useState<PostProps[]>(initialNotes);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [newNote, setNewNote] = useState({ id: '', title: '', content: ''});
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
  const [user, setUserName] = useState('');
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const cache = useRef<Map<number, PostProps[]>>(new Map());

  const fetchAndCachePage = async (p: number, newCache: Map<number, PostProps[]>, page: number) => {
    if (cache.current.has(p)) {
      newCache.set(p, cache.current.get(p)!);
      console.log(`Page ${p} loaded from cache`);
    } else {
      try {
        const response = await axios.get(NOTES_URL, {
          params: { _page: p, _per_page: POSTS_PER_PAGE },
        });
        const fetchedPosts = response.data;
        newCache.set(p, fetchedPosts);
        if (p === page) {
          setNotes(fetchedPosts);
        }
        console.log(`Page ${p} fetched from server`);
      } catch (error) {
        console.error(`Encountered an error while fetching page ${p}:`, error);
      }
    }
  };

  const clearCache = (page: number) => {
    let startPage = Math.max(page - 2, 1);
    let endPage = Math.min(page + 2, totalPages);
    if(activePage > totalPages -2) { 
      startPage = page - 4;
      endPage = totalPages;
    }
    if(activePage == 1 || activePage == 2) {
      startPage = 1;
      endPage = 5;
    }

    cache.current.forEach((_, key) => {
      if (key < startPage || key > endPage) {
        cache.current.delete(key);
      }
    });
  };


  const fetchPosts = async (page: number) => {
    clearCache(page);
    const newCache = new Map<number, PostProps[]>();

    if(totalPages <= 5) {
      for (let p = 1; p <= totalPages; p++) {
        await fetchAndCachePage(p, newCache, page);
      }
    }
    else {
      if(activePage > totalPages -2) {
        for (let p = totalPages - 4; p <= totalPages; p++) {
          await fetchAndCachePage(p, newCache, page);
        }
      } else {
        for (let p = Math.max(activePage - 2, 1); p <= Math.max(activePage + 2, 5); p++) {
          await fetchAndCachePage(p, newCache, page);
        }
      }
    }
    newCache.forEach((value, key) => cache.current.set(key, value));
    if (cache.current.has(page)) {
      setNotes(cache.current.get(page)!);
    }
  };

  useEffect(() => {
    console.log(`Calling fetchPosts for activePage: ${activePage}`);
    fetchPosts(activePage);
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
  console.log('new note was created'); 
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
  console.log('theme has changed');
};

const handleCreateUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setCreateUserForm({ ...createUserForm, [e.target.name]: e.target.value });
};

const handleCreateUserSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:3001/users', {
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
    console.log('resigistration failed');
  }
  console.log('resigister successfully');
};

const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
};

const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:3001/login', {
      username: loginForm.login_form_username,
      password: loginForm.login_form_password,
    });
    setToken(response.data.token);
    setUserName(response.data.name);
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
  setUserName('');
  console.log('Logged out successfully');
};

return (
  <>
    {notes.map(note => (
      <Post key= {`${note.id}`} post={{ ...note, currentUserName: user, onDelete: handleDelete, onUpdateContent: handleUpdateContent, token }} />
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
    {token && (
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
    )}
      <div>
      <button className="theme-button" onClick={handleChangeTheme} name="change_theme">
      Change Theme
      </button>
    </div>
    <div>
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
          <button className="submit-button" type="submit" name="create_user_form_create_user">register</button>
        </form>

      {!token && (
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
          <button name= "login_form_login" className="submit-button" type="submit" >Login</button>
        </form>
      )}

      <button className="logout-button" name="logout" onClick={handleLogout}>Logout</button>
    </div>
  </>
  
);
}
