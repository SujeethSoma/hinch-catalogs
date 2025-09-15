// Simple test script to verify the PDF thumbnail API
const fetch = require('node-fetch');

async function testAPI() {
  try {
    const url = 'http://localhost:3000/api/pdf-thumbnail?url=' + encodeURIComponent('https://drive.google.com/file/d/1ozRRnwuCTJ5ddjLPbdBdg9MZAsWO-DwL/preview');
    console.log('Testing URL:', url);
    
    const response = await fetch(url);
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const buffer = await response.buffer();
      console.log('Image size:', buffer.length, 'bytes');
      console.log('✅ API is working!');
    } else {
      const text = await response.text();
      console.log('❌ API error:', text);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
