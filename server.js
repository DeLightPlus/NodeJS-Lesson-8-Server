require('dotenv').config();
const express = require("express");
const cors = require('cors');
const { doc, setDoc } = require('firebase/firestore');
const multer = require('multer')

const { 
    getEmployees, getEmployeeById, 
    addEmployee, deleteEmployeeById, 
    updateEmployeeById } = require('./controllers/auth');

const app = express();
const port = 8000;

app.use(express.json());

// CORS setup
const allowedOrigins = [
    'https://nodejs-lesson-8-deploy-employee-app.onrender.com/',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
    
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, origin);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

const storage = multer.memoryStorage();
const upload = multer({storage});

// API endpoint to get all employees
app.get('/api/employees', getEmployees);

// API endpoint to get a specific employee by ID
app.get('/api/employees/:id', getEmployeeById);

// API endpoint to create a new employee
app.post('/api/employees', upload.single('image') ,addEmployee);

// DELETE /api/employees/:id - Delete an employee by ID
app.delete('/api/employees/:id', deleteEmployeeById);

// PUT /api/employees/:id - Update an employee by ID
app.put('/api/employees/:id', updateEmployeeById);

// PATCH /api/employees/:id - Partially update an employee by ID
app.patch('/api/employees/:id', upload.single('image'), async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    console.log('trying patch');
    

    if (req.file) 
    {
        console.log('ID:', id, ' ,req.file:', req.file, ' ,data:', req.body);
        
        // Assuming you want to save the image data in a field named 'avatar'
        updatedData.avatar = req.file.buffer; // or handle the image as needed (e.g., save to a storage service)
    }

    try {
        const employeeDoc = doc(db, 'employees', id);
        await setDoc(employeeDoc, req.body, { merge: true });
        res.status(200 ).send({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).send({ message: 'Error updating employee', error });
    }
});

app.listen(port, () => { console.log(`Server is running on port ${port}`); });