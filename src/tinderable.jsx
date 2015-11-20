/*global require,module,setTimeout*/
var React = require('react'),
    ReactDOM  = require('react-dom'),
    classNames = require('classnames'),
    Hammer = require('hammerjs'),
    merge = require('merge');

function calculateInitialPosition(instance) {
    var card = ReactDOM.findDOMNode(instance);
    var container = card.parentElement;
    return {
        x: Math.round((container.offsetWidth - card.offsetWidth) / 2),
        y: Math.round((container.offsetHeight - card.offsetHeight) / 2)
    };
}

var Card = React.createClass({
    getInitialState: function() {
        return {
            initialPosition: {
                x: 0,
                y: 0
            }
        };
    },

    setInitialPosition: function() {
        this.setState({
            initialPosition: calculateInitialPosition(this)
        });
    },

    componentDidMount: function() {
        this.setInitialPosition();

        window.addEventListener('resize', this.setInitialPosition);
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.setInitialPosition);
    },

    render: function() {
        var initialTranslate = ''.concat(
            'translate3d(',
            this.state.initialPosition.x + 'px,',
            this.state.initialPosition.y + 'px,',
            '0px)'
        );

        var style = merge({
            msTransform: initialTranslate,
            WebkitTransform: initialTranslate,
            transform: initialTranslate,
            zIndex: this.props.index,
            backgroundImage: 'url("' + this.props.image + '")'
        }, this.props.style);

        var classes = classNames(merge(
            {
                card: true
            },
            this.props.classes
        ));

        return <div style={style} className={classes}/>;
    }
});

var DraggableCard = React.createClass({
    getInitialState: function() {
        return {
            x: 0,
            y: 0,
            initialPosition: {
                x: 0,
                y: 0
            },
            startPosition: {
                x: 0,
                y: 0
            },
            animation: null
        };
    },

    resetPosition: function() {
        var initialPosition = calculateInitialPosition(this);

        this.props.onNearLeft(0);
        this.props.onNearRight(0);

        var initialState = this.getInitialState();
        this.setState(
            {
                x: initialPosition.x,
                y: initialPosition.y,
                initialPosition: initialPosition,
                startPosition: initialState.startPosition
            }
        );
    },

    getDistanceToRightEdge: function() {
        var card = ReactDOM.findDOMNode(this);
        var container = card.parentElement;

        return container.offsetWidth - (this.state.x + (card.offsetWidth - 50));
    },

    panHandlers: {
        panstart: function() {
            this.setState({
                animation: false,
                startPosition: {
                    x: this.state.x,
                    y: this.state.y
                }
            });
        },
        panend: function() {
            if (this.state.x < -50) {
                this.props.onOutScreenLeft();
            } else if (this.getDistanceToRightEdge() < 0) {
                this.props.onOutScreenRight();
            } else {
                this.resetPosition();
                this.setState({
                    animation: true
                });
            }
        },
        panmove: function(ev) {
            var position = this.calculatePosition(ev.deltaX, ev.deltaY);

            function constrain(n) {
                return Math.min(1, 1 - n);
            }

            if(position.x < 0) {
                this.props.onNearLeft(constrain((50 + position.x) / 50));
            } else {
                var distToRightEdge = this.getDistanceToRightEdge();
                if(distToRightEdge < 50) {
                    this.props.onNearRight(constrain(distToRightEdge / 50));
                }
            }

            this.setState(position);
        },
        pancancel: function(ev) {
            console.log(ev.type);
        }
    },

    handlePan: function(ev) {
        ev.preventDefault();
        this.panHandlers[ev.type].call(this, ev);
        return false;
    },

    handleSwipe: function(ev) {
        console.log(ev.type);
    },

    calculatePosition: function(deltaX, deltaY) {
        return {
            x: (this.state.initialPosition.x + deltaX),
            y: (this.state.initialPosition.y + deltaY)
        };
    },

    componentDidMount: function() {
        this.hammer = new Hammer.Manager(ReactDOM.findDOMNode(this));
        this.hammer.add(new Hammer.Pan({threshold: 0}));

        var events = [
            ['panstart panend pancancel panmove', this.handlePan],
            ['swipestart swipeend swipecancel swipemove',
             this.handleSwipe]
        ];

        events.forEach(function(data) {
            if (data[0] && data[1]) {
                this.hammer.on(data[0], data[1]);
            }
        }, this);

        this.resetPosition();
        window.addEventListener('resize', this.resetPosition);
    },

    componentWillUnmount: function () {
        this.hammer.stop();
        this.hammer.destroy();
        this.hammer = null;
        window.removeEventListener('resize', this.resetPosition);
    },

    render: function() {
        var translate = ''.concat(
            'translate3d(',
            this.state.x + 'px,',
            this.state.y + 'px,',
            '0px)'
        );

        var style = {
            msTransform: translate,
            WebkitTransform: translate,
            transform: translate
        };

        var classes = {
            animate: this.state.animation,
            'card-draggable': true
        };

        return (<Card {...this.props}
                style={style}
                classes={classes}/>);
    }
});

var Tinderable = React.createClass({
    propTypes: {
        cards: React.PropTypes.array.isRequired,
        onSwipeLeft: React.PropTypes.func.isRequired,
        onSwipeRight: React.PropTypes.func.isRequired,
        onNearLeft: React.PropTypes.func,
        onNearRight: React.PropTypes.func
    },

    render: function() {
        var cards = this.props.cards
            .slice(this.props.cards.length - 2) // no need to display more than 2 cards at once
            .map(function (c, index, coll) {
                var props = {
                    index: index,
                    onOutScreenLeft: this.props.onSwipeLeft,
                    onOutScreenRight: this.props.onSwipeRight,
                    onNearLeft: this.props.onNearLeft,
                    onNearRight: this.props.onNearRight,
                    image: c.image
                };

                var component = (index === (coll.length - 1)) ?
                    DraggableCard :
                    Card;

                return React.createElement(component, props);
            }, this);

        return (
            <div className="cards">
                {cards}
            </div>
        );
    }
});

module.exports = Tinderable;
