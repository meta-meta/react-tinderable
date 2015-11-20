/*global require*/
var React = require('react'),
    Tinderable = require('../../lib/tinderable.js');

var cardsData = [
    {
        title: 'A wonderful day',
        text: '—— - ——— - - - ——— ———— - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— -',
        image: 'images/portrait-1.jpg',
        id: '1'
    },
    {
        title: 'My amazing journey',
        text: ' - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— - ————— - - ——— - - - ——— ———— ',
        image: 'images/portrait-2.jpg',
        id: '2'
    },
    {
        title: 'Three recipes without cocoa',
        text: ' - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— - ————— - - ——— - - - ———',
        image: 'images/portrait-3.jpg',
        id: '3'
    },
    {
        title: 'Generic clickbait title',
        text: ' —— ———— - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— - ————— - - ———— - ——— ',
        image: 'images/portrait-4.jpg',
        id: '4'
    }
];

var onSwipeLeft = function () {
    console.log('swipe left');
};

var onSwipeRight = function () {
    console.log('swipe right');
};

var onNearLeft = function (amt) {
    console.log('near left ', amt);
};

var onNearRight = function (amt) {
    console.log('near right ', amt);
};

React.render(
    <Tinderable
        cards={cardsData}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        onNearLeft={onNearLeft}
        onNearRight={onNearRight}
    />,

    document.getElementById('master-root')
);
