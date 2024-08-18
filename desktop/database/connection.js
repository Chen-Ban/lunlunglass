const mongoose = require('mongoose')

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Connected to MongoDB!')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message)
  })
