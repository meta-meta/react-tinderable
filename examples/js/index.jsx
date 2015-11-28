/*global require*/
var React = require('react'),
    Tinderable = require('../../lib/tinderable.js');


var Slideshow = React.createClass({
    getInitialState: function() {
        return {
            cards: [
                {
                    title: 'Face Value',
                    text: '—— - ——— - - - ——— ———— - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— -',
                    image: 'http://www.philcollins-fr.com/Discographie/albums/01facevalue.jpg',
                    id: '0',
                },
                {
                    title: 'No Jacket Required',
                    text: '—— - ——— - - - ——— ———— - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— -',
                    image: 'http://www.philcollins-fr.com/Discographie/albums/03jacket.jpg',
                    id: '1',
                },
                {
                    title: '...But Seriously',
                    text: ' - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— - ————— - - ——— - - - ——— ———— ',
                    image: 'http://www.philcollins-fr.com/Discographie/albums/04butseriously.jpg',
                    id: '2',
                },
                {
                    title: 'Hello, I must be going',
                    text: ' - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— - ————— - - ——— - - - ———',
                    image: 'http://ecx.images-amazon.com/images/I/91hWxUcdXBL._SL1500_.jpg',
                    id: '3',
                },
                {
                    title: 'Greatest Hits',
                    text: ' - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— - ————— - - ——— - - - ———',
                    image: 'http://ecx.images-amazon.com/images/I/71Ijj8VWNeL._SL1000_.jpg',
                    id: '4',
                },
                {
                    title: 'Testify',
                    text: ' - — ——— —— - ————— - - ———— —— - ——— - - - ——— ———— - — ——— —— - ————— - - ——— - - - ———',
                    image: 'http://img.maniadb.com/images/album/117/117460_1_f.jpg',
                    id: '5',
                },
            ],
        }
    },

    render: function() {
        var self = this;

        function removeCard() {
            setTimeout(function() {
                self.setState({cards: self.state.cards.slice(1, self.state.cards.length)});
            }, 300); // animation length for card to flick off screen
        }

        function onNearLeft(amt) {
            console.log('near left ', amt);
        }

        function onNearRight(amt) {
            console.log('near right ', amt);
        }

        return (
            <div className="slideshow">
                <Tinderable
                    cards={this.state.cards}
                    onSwipeLeft={removeCard}
                    onSwipeRight={removeCard}
                    onNearLeft={onNearLeft}
                    onNearRight={onNearRight}
                    stackSize={5}
                    yShift={15}
                />

            </div>
        );
    }
});

React.render(
    <Slideshow />,
    document.getElementById('master-root')
);
