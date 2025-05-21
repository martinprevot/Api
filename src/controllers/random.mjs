import axios from 'axios';

const Random = class Random {
  constructor(app, connect, auth) {
    this.app = app;
    this.auth = auth;
    this.run();
  }

  getRandomProfile() {
    this.app.get('/random-profile', this.auth(), async (req, res, next) => {
      try {
        // 1. Utilisateur de RandomUser
        const randomUser = await axios.get('https://randomuser.me/api');
        const user = randomUser.data.results[0];

        // 2. Données Randommer.io avec headers corrects
        const headers = {
          'X-Api-Key': '255c7783c3094d3e8f38bc5c3b64c204',
          'User-Agent': 'MyApp/1.0 (https://example.com)', // Ajoute un User-Agent personnalisé
          Accept: 'application/json'
        };

        const [phone, iban, creditCard, name, pet] = await Promise.all([
          axios.get('https://randommer.io/api/Phone/Generate', {
            headers,
            params: { countryCode: 'FR', Quantity: 3 } // <-- ici on ajoute Quantity
          }),
          axios.get('https://randommer.io/api/Iban', { headers }), // Vérifie endpoint IBAN exact
          axios.get('https://randommer.io/api/Card', { headers }),
          axios.get('https://randommer.io/api/Name', { headers, params: { nameType: 'fullname', quantity: 1 } }),
          axios.get('https://randommer.io/api/pet-names', { headers })
        ]);

        // 3. APIs open-source externes
        const [quote, joke] = await Promise.all([
          axios.get('https://api.quotable.io/random'),
          axios.get('https://official-joke-api.appspot.com/random_joke')
        ]);

        // 4. Structuration des données
        const profile = {
          user: {
            name: name.data[0],
            email: user.email,
            gender: user.gender,
            location: `${user.location.city}, ${user.location.country}`,
            picture: user.picture.large
          },
          phone_number: phone.data, // Ici tu auras un tableau de 3 numéros
          iban: iban.data,
          credit_card: {
            card_number: creditCard.data.cardNumber || creditCard.data.CardNumber || creditCard.data.card_number || '',
            card_type: creditCard.data.cardType || creditCard.data.CardType || creditCard.data.card_type || '',
            expiration_date: creditCard.data.expirationDate || creditCard.data.ExpirationDate || creditCard.data.expiration_date || '',
            cvv: creditCard.data.cvv || creditCard.data.CVV || ''
          },
          random_name: name.data[0],
          pet: pet.data,
          quote: {
            content: quote.data.content,
            author: quote.data.author
          },
          joke: {
            type: joke.data.type || 'Unknown',
            content: `${joke.data.setup} - ${joke.data.punchline}`
          }
        };

        return res.status(200).json(profile);
      } catch (err) {
        console.error('[ERROR] /random-profile ->', err.response ? err.response.data : err.message);
        return next(err);
      }
    });
  }

  run() {
    this.getRandomProfile();
  }
};

export default Random;
