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

var Card = React.createClass({displayName: "Card",
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
        var scale = this.props.scale;

        var initialTranslate = ''.concat(
            'translate3d(',
            this.state.initialPosition.x + 'px,',
            (this.state.initialPosition.y + this.props.yShift) + 'px,',
            '14px)',
            ' ',
            'scale3d(',
            scale + ',',
            scale + ',',
            scale + ')'
        );

        var style = merge({
            msTransform: initialTranslate,
            WebkitTransform: initialTranslate,
            transform: initialTranslate,
            zIndex: this.props.zIndex,
            backgroundImage: 'url("' + this.props.image + '")'
        }, this.props.style);

        var classes = classNames(merge(
            {
                card: true
            },
            this.props.classes
        ));

        return React.createElement("div", {style: style, className: classes}, this.props.children);
    }
});

var DraggableCard = React.createClass({displayName: "DraggableCard",
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
            animation: null,
            pressed: false
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if(nextProps.swipe !== this.props.swipe) {
            if(nextProps.swipe === 'left') {
                this.swipeLeft();
            } else if(nextProps.swipe === 'right') {
                this.swipeRight();
            } /*else if(nextProps.swipe === 'undo') {
                this.swipeUndo();
            }*/

        }
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

        return container.offsetWidth - (this.state.x + (card.offsetWidth - this.props.pixelsToSwipeOff));
    },

    swipeLeft: function() {
        this.props.onOutScreenLeft();
        this.setState({
            animation: true,
            x: this.state.x - 5 * this.props.pixelsToSwipeOff /* this is arbitrary but pixelsToSwipeOff cues us into the size of the card */
        });
    },

    swipeRight: function() {
        this.props.onOutScreenRight();
        this.setState({
            animation: true,
            x: this.state.x + 5 * this.props.pixelsToSwipeOff /* this is arbitrary but pixelsToSwipeOff cues us into the size of the card */
        });
    },

    //swipeUndo: function() {
    //    this.props.onSwipeUndo();
    //    this.setState({
    //        animation: true
    //    });
    //
    //    this.resetPosition();
    //},

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
            if (this.state.x < -this.props.pixelsToSwipeOff) {
                this.swipeLeft();
            } else if (this.getDistanceToRightEdge() < 0) {
                this.swipeRight();
            } else {
                this.resetPosition();
            }

            this.setState({
                animation: true,
                pressed: false
            });
        },
        panmove: function(ev) {
            var position = this.calculatePosition(ev.deltaX, ev.deltaY);

            function constrain(n) {
                return Math.min(1, 1 - n);
            }

            if(position.x < 0) {
                this.props.onNearLeft(constrain((this.props.pixelsToSwipeOff + position.x) / this.props.pixelsToSwipeOff));
            } else {
                var distToRightEdge = this.getDistanceToRightEdge();
                if(distToRightEdge < this.props.pixelsToSwipeOff) {
                    this.props.onNearRight(constrain(distToRightEdge / this.props.pixelsToSwipeOff));
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

    handlePress: function(ev) {
        this.setState({
            pressed: true,
            animation: true
        });
    },

    handlePressUp: function(ev) {
        this.setState({
            pressed: false
        });
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
        this.hammer.add(new Hammer.Press({time: 0}));

        var events = [
            ['panstart panend pancancel panmove', this.handlePan],
            ['swipestart swipeend swipecancel swipemove',
             this.handleSwipe],
            ['press', this.handlePress],
            ['pressup', this.handlePressUp]
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
        var scale = this.state.pressed ? 1.05 : this.props.scale;

        var translate = ''.concat(
            'translate3d(',
            this.state.x + 'px,',
            this.state.y + this.props.yShift + 'px,',
            '0px)',
            ' ',
            'scale3d(',
            scale + ',',
            scale + ',',
            scale + ')'
        );

        var style = {
            msTransform: translate,
            WebkitTransform: translate,
            transform: translate
        };

        var classes = {
            animate: this.state.animation,
            pressed: this.state.pressed,
            'card-draggable': true
        };

        return (React.createElement(Card, React.__spread({},  this.props, 
                {style: style, 
                classes: classes})));
    }
});

var Tinderable = React.createClass({displayName: "Tinderable",
    propTypes: {
        cards: React.PropTypes.array.isRequired,
        onSwipeLeft: React.PropTypes.func.isRequired,
        onSwipeRight: React.PropTypes.func.isRequired,
        onNearLeft: React.PropTypes.func,
        onNearRight: React.PropTypes.func,
        stackSize: React.PropTypes.number,
        yShift: React.PropTypes.number,
        swipe: React.PropTypes.string
    },

    getDefaultProps: function () {
        return {
            stackSize: 2,
            yShift: 5
        }
    },

    onSwipeLeft: function () {
        setTimeout(this.props.onSwipeLeft, this.props.animationLength); // animation length for card to flick off screen
    },

    onSwipeRight: function () {
        setTimeout(this.props.onSwipeRight, this.props.animationLength); // animation length for card to flick off screen
    },

    render: function() {
        var cards = this.props.cards
            .slice(0, this.props.stackSize) // no need to display more than 2 cards at once
            .map(function (c, index, coll) {
                var props = {
                    index: index,
                    onOutScreenLeft: this.onSwipeLeft,
                    onOutScreenRight: this.onSwipeRight,
                    onNearLeft: this.props.onNearLeft,
                    onNearRight: this.props.onNearRight,
                    pixelsToSwipeOff: this.props.pixelsToSwipeOff || 100,
                    image: c.image,
                    zIndex: this.props.stackSize - index,
                    scale: 1 - (this.props.stackSize - (coll.length - index)) * 0.01,
                    yShift: (this.props.stackSize - (coll.length - index)) * this.props.yShift,
                    key: 'card-' + c.id,
                    swipe: this.props.swipe,
                    children: index === 0 ? this.props.children : null
                };

                var component = (index === 0) ?
                    DraggableCard :
                    Card;

                return React.createElement(component, props);
            }, this);

        return (
            React.createElement("div", {className: "cards"}, 
                cards
            )
        );
    }
});

module.exports = Tinderable;
