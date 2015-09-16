module.exports = {
  "DATABASE_URI": "mongodb://localhost:27017/fsg-app",
  "SESSION_SECRET": "Optimus Prime is my real dad",
  "TWITTER": {
    "consumerKey": "IAwYKh3ly6sdHEqNAlIYWDCR9v",
    "consumerSecret": "vRMLMyEV1Xn2hqgsRfC4MfHpbbwRYEg8KDl3zlAQ5XlbI55CLi",
    "callbackUrl": "http://127.0.0.1:1337/auth/twitter/callback"
  },
  "FACEBOOK": {
    "clientID": "849259408482825",
    "clientSecret": "b98fa4ebba68ccc03ec5200940603cb8",
    "callbackURL": "http://localhost:1337/auth/facebook/callback"
  },
  "GOOGLE": {
    "clientID": "735156327397-4eg868a6794hl5n7v5vb127jqesplfpk.apps.googleusercontent.com",
    "clientSecret": "AcNTUvrCvgGrNLqQtohNd6qL",
    "callbackURL": "http://127.0.0.1:1337/auth/google/callback"
  }
};