# Notes Management Application
### About:
This project involved building a dynamic web application using Next.js for the front-end and MongoDB for the back-end. We implemented user authentication, ensuring that only registered users could create, edit, or delete notes, while guests could view them. We utilized Static Site Generation (SSG) with Next.js allowed for pre-rendering HTML at build time, ensuring fast load times. Playwright was used for end-to-end testing, Additionally, handling HTTP requests efficiently facilitated communication between the front-end and back-end.

### Setup the project
1. `git clone https://github.com/carmelaroz/notes-management-application.git`

2. `cd https://github.com/carmelaroz/notes-management-application.git`

3. `cd frontend`

4. `npm install`

5. `cd ../backend`

6. `npm install`

7. copy a `.env` file into the backend dir and `frontend` dir.

### Configure the Backend
`cd backend`

`node index.js`

### Configure the Frontend
`cd frontend`

`npm run dev`

### Test the Application
* open http://localhost:3000
* view all notes 
* create new user via the registration form
* log in user via the login form
* logout
* add new note (only when user is logged in)
* edit/delete note (only if user is logged in and the note is created by him)
* change the theme

