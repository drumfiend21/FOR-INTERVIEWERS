app.factory('RandomGreetings', function () {

    var getRandomFromArray = function (arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = [
        'Hello, microgreens lover! Buy something or leave.',
        'Broccoli, you can\'t sit with us.',
        'Hello, simple human. I am a superior vegetable.',
        'What a beautiful day! The sun is making me age.',
        'I\'m like any other veggie, except that I am better. :)',
        'ROAR.',
        '私はおいしいmicrogreenです。私を食べます。',
    ];

    return {
        greetings: greetings,
        getRandomGreeting: function () {
            return getRandomFromArray(greetings);
        }
    };

});
