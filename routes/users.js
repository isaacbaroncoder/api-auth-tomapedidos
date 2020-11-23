var express = require('express');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const app = require('../app');
var router = express.Router();

// Config 
dotenv.config();

// Enviroment Variables
const {PATH_CREDENCIALS, DATA_URL} = process.env


// Initialize FirebaseAdmin
const serviceAccount = require(PATH_CREDENCIALS);

const adminFirebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: DATA_URL
});

// Routes Methods

// GET METHOD

// GET USER FOR ID 
router.get('/getUser/:id', async(request, response)=>{
  const user = await adminFirebase.auth().getUser(request.params.id);
  response.end(JSON.stringify(user));
})

// GET ALL USERS 
router.get('/getAllUsers', async(request, response)=>{

  try{
      const userRecords = await adminFirebase.auth().listUsers(100);

      const dataUsers = [];

      userRecords.users.forEach((user)=>{
          dataUsers.push(user);
      });

      console.log(dataUsers);
      response.send(JSON.stringify(dataUsers));
      response.end();
  }
  catch(error){
      console.log(error);
      response.send('Error en la consola');
  }

});

// POST METHOD

// CREATE USER 
router.post('/createUser', async(request, response)=>{
  const data = request.body;
  try{
     const userRecord = await adminFirebase.auth().createUser({
          email: data.form.email,
          displayName: data.form.name,
          password: data.form.password,
      });

      await adminFirebase.auth().setCustomUserClaims(userRecord.uid, {
          role: data.sidebar.role
      });
      
      response.end('success');
  }
  catch(error){

      if(error.code === 'auth/invalid-email'){
          response.end('El correo electróico tiene un formato inconrrecto');
      }

      if(error.code === 'auth/user-not-found'){
          response.end('Este correo electrónico no esta asignado a ningun usuario registrado');
      }
      
      if(error.code === 'auth/wrong-password'){
          response.end('Contraseña incorrecta');
      }

      if(error.code === 'auth/email-already-exists'){
          response.end('Este correo ya esta asignado a otro usuario');
      }

      response.end(error.code);
  }
});

// DELETE METHOD

// DELETE USER 
router.delete('/deleteUser/:id', async(request, response)=>{
  try{
    await adminFirebase.auth().deleteUser(request.params.id);
    response.end('usuario eliminado');
  }
  catch(error){
    response.end('error');
  }
});

// PUT METHOD

// UPDATE USER 
router.put('/updateUser/:id', async(request, response)=>{
  try{
    const infoForUpdated = request.body
    await adminFirebase.auth().updateUser(request.params.id, {
      ...infoForUpdated
    });
    response.end('usuario actualizado');
  }
  catch(error){
    response.end('error');
  }
});



module.exports = router;
