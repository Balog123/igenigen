const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const path = require('path');
const cookieParser = require('cookie-parser')
const dbService = require('./db-config')
const jwt = require('jsonwebtoken')

const app = express()
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended : false }))
app.use(express.static(path.join(__dirname, '../client')));


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../client','index.html'));
  });


app.post('/regisztracio', (request, response) => {
    const { keresztnev, vezeteknev, email, jelszo } = request.body
    const db = dbService.getDbServiceInstance()

    const result = db.felhasznaloRegisztralas(keresztnev, vezeteknev, email, jelszo)

    result
    .then(data => response.json({ data: data }))
    .catch(err => console.log(err))
})



// function signJWT(felhasznalo) {
// const token = jwt.sign(felhasznalo, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES })
//    return token
//  }

// app.post('/bejelentkezes', async (request, response) => {
//    const { email, jelszo } = request.body
//    const db = dbService.getDbServiceInstance()
 
//    try {
//      const felhasznalo = await db.felhasznaloBejelentkezes(email, jelszo)
 
//      const token = signJWT(felhasznalo)
 
//      response.cookie('authToken', token, { httpOnly: true, maxAge: process.env.COOKIE_EXPIRES })
 
//      response.json({ success: true, data: felhasznalo })
//    } catch (err) {
//      response.json({ success: false, error: err.message })
//    }
// })

app.use((req, res, next) => {
    const token = req.cookies.token
  
    if (!token) {
      req.isLogged = false
      req.userData = null
      next()
    } else {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          req.isLogged = false
          req.userData = null
        } else {
          req.isLogged = true
          req.userData = decoded
        }
        next()
      })
    }
  })

app.post('/bejelentkezes', (request, response) => {
    const { email, jelszo } = request.body
    const db = dbService.getDbServiceInstance()

    const result = db.felhasznaloBejelentkezes(email, jelszo)

    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    })
    
    response.cookie('token', token, { httpOnly: true })
    result
    .then(data => response.json({ success: true, data }))
   // result
   // .then(data => response.json({ success: true, data }))
   // .catch(err => response.json({ success: false, error: err.message }))
   //// .then(data => response.json({ data: data }))
   //// .catch(err => console.log(err))

})



app.get('/termek', async (req, res) => {
    const db = dbService.getDbServiceInstance()
    const termekInformacio = await db.getTermekInformacio()
    res.json({ termekInformacio })
})


app.listen(process.env.PORT, () => console.log('Fut az app'))