/*global require*/
var React = require('react'),
    Tinderable = require('../../lib/tinderable.js');


var Slideshow = React.createClass({
    getInitialState: function() {
        return {
            swipe: undefined,
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
            self.setState({
                swipe: undefined,
                cards: self.state.cards.slice(1, self.state.cards.length)
            });
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
                    animationLength={300} //TODO: grab this from css animate class or make transition controlled inline style?
                    swipe={this.state.swipe}
                ><span>Testing</span></Tinderable>
                <button disabled={this.state.swipe === 'left' || this.state.swipe === 'right'} onClick={function(){this.setState({swipe: 'left'});}.bind(this)}>Left</button>
                <button disabled={this.state.swipe === 'left' || this.state.swipe === 'right'} onClick={function(){this.setState({swipe: 'right'});}.bind(this)}>Right</button>
            </div>
        );
    }
});

React.render(
    <Slideshow />,
    document.getElementById('master-root')
);
