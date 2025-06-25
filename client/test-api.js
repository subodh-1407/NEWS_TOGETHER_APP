   const axios = require('axios');

   const validateApiKey = async (apiKey) => {
       const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

       try {
           const response = await axios.get(url);
           if (response.status === 200) {
               console.log('API key is valid');
               return true; // API key is valid
           }
       } catch (error) {
           if (error.response) {
               if (error.response.status === 401) {
                   console.error('Invalid API key');
               } else {
                   console.error('Error fetching data:', error.response.data);
               }
           } else {
               console.error('Error:', error.message);
           }
       }
       return false; // API key is invalid
   };

   // Usage
   const apiKey = 'aa2c7282bcd749e68c22b3ff5df8a0ad';
   validateApiKey(apiKey).then(isValid => {
       if (isValid) {
           console.log('Proceed with API calls');
       } else {
           console.log('Handle invalid API key scenario');
       }
   });
   