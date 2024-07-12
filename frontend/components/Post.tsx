import React, {useState, useEffect} from "react";
import './Post.css';

export type PostProps = {
    id: number;
    title: string;
    author: {
      name: string;
      email: string;
    } | null;
    content: string;
    onDelete: (id: number) => void;
    onUpdateContent: (id: number, newContent: string) => void;
    token: string;
  };
  

  const Post: React.FC<{ post: PostProps }> = ({ post }) => {
    const [editMode, setEditMode] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);

    useEffect(() => {
      if (!editMode) {
        setEditedContent(post.content);
      }
    }, [post.content, editMode]);

    const handleDelete = async () => {
      if (post.token) {
        post.onDelete(post.id);
    } else {
        alert("You must be logged in to delete a post.");
    }
    };

    const handleEditToggle = () => {
      if (post.token) {
        setEditMode(!editMode);
        setEditedContent(post.content);
    } else {
        alert("You must be logged in to edit a post.");
    }
    };
  
    const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditedContent(event.target.value);
    };
  
    const handleUpdate = async () => {
      if (post.token) {
        console.log(`Updating post ID ${post.id} with content:`, editedContent);
        await post.onUpdateContent(post.id, editedContent);
        setEditMode(false);
    } else {
        alert("You must be logged in to update a post.");
    }
    };

    return (
      <div className="note" id={`${post.id}`}>
      <h2>{post.title}</h2>
      <small>By {post.author?.name}</small>
      <br></br>
      <small>{post.author?.email}</small>
      {editMode ? (
        <textarea name={`text_input-${post.id}`}
          value={editedContent}
          onChange={handleContentChange}
          rows={4}
          cols={50}
        />
      ) : (
        <p>{post.content}</p>
      )}
      <div>
        {editMode ? (
          <>
            <button name={`text_input_save-${post.id}`} className="save-button" onClick={handleUpdate}>Save</button>
            <button name={`text_input_cancel-${post.id}`} className="cancel-button" onClick={handleEditToggle}>Cancel</button>
          </>
        ) : (
          <button name={`edit-${post.id}`} className="edit-button" onClick={handleEditToggle}>Edit</button>
        )}
        <button name={`delete-${post.id}`} className="delete-button" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
  };

  export default Post;