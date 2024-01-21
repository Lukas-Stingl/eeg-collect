const express = require('express');
const app = express();

// Serve static files from 'public' directory
app.use(express.static('public'));

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
