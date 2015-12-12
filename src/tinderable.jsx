/*global require,module,setTimeout*/
var React = require('react'),
    ReactDOM  = require('react-dom'),
    classNames = require('classnames'),
    Hammer = require('hammerjs'),
    merge = require('merge');

function calculateInitialPosition(instance) {
    //var card = ReactDOM.findDOMNode(instance);
    //var container = card.parentElement;
    return {
        x: 0,
        y: 0
        //x: Math.round((container.offsetWidth - card.offsetWidth) / 2),
        //y: Math.round((container.offsetHeight - card.offsetHeight) / 2)
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
        var scale = this.props.scale;

        var initialTranslate = ''.concat(
            'translate3d(',
            this.state.initialPosition.x + 'px,',
            this.props.yShift + '%,',
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

        return <div style={style} className={classes}>{this.props.children}</div>;
    }
});

var DraggableCard = React.createClass({
    getInitialState: function() {
        return {
            x: 0,
            y: 0,
            rotation: 0,
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
                this.swipeLeft(true);
            } else if(nextProps.swipe === 'right') {
                this.swipeRight(true);
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
                rotation: 0,
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

    swipeLeft: function(triggeredExternally) {
        this.props.onOutScreenLeft(triggeredExternally);
        this.setState({
            animation: true,
            x: this.state.x - 5 * this.props.pixelsToSwipeOff /* this is arbitrary but pixelsToSwipeOff cues us into the size of the card */
        });
    },

    swipeRight: function(triggeredExternally) {
        this.props.onOutScreenRight(triggeredExternally);
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
            var nextState = this.calculatePosition(ev.deltaX, ev.deltaY);

            var pointerPosition = ev.center;
            var rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
            var rectCenter = {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
            nextState.rotation = ((pointerPosition.y - rectCenter.y) / rect.height) * (ev.deltaX / rect.width) * -this.props.rotationMultiplier;

            function constrain(n) {
                return Math.min(1, 1 - n);
            }

            if(nextState.x < 0) {
                this.props.onNearLeft(constrain((this.props.pixelsToSwipeOff + nextState.x) / this.props.pixelsToSwipeOff));
            } else {
                var distToRightEdge = this.getDistanceToRightEdge();
                if(distToRightEdge < this.props.pixelsToSwipeOff) {
                    this.props.onNearRight(constrain(distToRightEdge / this.props.pixelsToSwipeOff));
                }
            }

            this.setState(nextState);
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
        var angle = this.state.rotation;

        var translate = ''.concat(
            'translate3d(',
            this.state.x + 'px,',
            'calc(' + this.state.y + 'px + ' + this.props.yShift + '%),',
            '0px)',
            ' ',
            'rotate3d(0, 0, 1,',
            angle + 'rad)',
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
        onNearRight: React.PropTypes.func,
        stackSize: React.PropTypes.number,
        yShift: React.PropTypes.number,
        scale: React.PropTypes.number,
        swipe: React.PropTypes.string,
        isTopCardSeparate: React.PropTypes.bool,
        rotationMultiplier: React.PropTypes.number
    },

    getDefaultProps: function () {
        return {
            stackSize: 2,
            yShift: 5,
            scale: 0.02,
            rotationMultiplier: 2.5
        }
    },

    onSwipeLeft: function (triggeredExternally) {
        setTimeout(this.props.onSwipeLeft(triggeredExternally), this.props.animationLength); // animation length for card to flick off screen
    },

    onSwipeRight: function (triggeredExternally) {
        setTimeout(this.props.onSwipeRight(triggeredExternally), this.props.animationLength); // animation length for card to flick off screen
    },

    render: function() {
        var cards = this.props.cards
            .slice(0, this.props.stackSize) // no need to display more than 2 cards at once
            .map(function (c, index, coll) {
                var ignoreTransform = index == 0 && this.props.isTopCardSeparate;

                var props = {
                    index: index,
                    onOutScreenLeft: this.onSwipeLeft,
                    onOutScreenRight: this.onSwipeRight,
                    onNearLeft: this.props.onNearLeft,
                    onNearRight: this.props.onNearRight,
                    pixelsToSwipeOff: this.props.pixelsToSwipeOff || 100,
                    image: c.image,
                    zIndex: this.props.stackSize - index,
                    scale: ignoreTransform ? 1 : 1 - (this.props.stackSize - (coll.length - index)) * this.props.scale,
                    yShift: ignoreTransform ? 0 : (this.props.stackSize - (coll.length - index)) * this.props.yShift,
                    key: 'card-' + c.id,
                    swipe: this.props.swipe,
                    rotationMultiplier: this.props.rotationMultiplier,
                    children: index === 0 ? this.props.children : null
                };

                var component = (index === 0) ?
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
