var {EventEmitter} = require('eventemitter3');

class Client {

    /**
     * Initiate the event emitter
     */
    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    /**
     * Adds the @listener function to the end of the listeners array
     * for the event named @eventName
     * Will ensure that only one time the listener added for the event
     *
     * @param {string} eventName
     * @param {function} listener
     */
    on(eventName, listener) {
        this.eventEmitter.on(eventName, listener, this);
    }

    /**
     * Will temove the specified @listener from @eventname list
     *
     * @param {string} eventName
     * @param {function} listener
     */
    removeEventListener(eventName, listener) {
        this.eventEmitter.removeListener(eventName, listener, this);
    }

    /**
     * Will emit the event on the evetn name with the @payload
     * and if its an error set the @error value
     *
     * @param {string} event
     * @param {object} payload
     * @param {boolean} error
     */
    emit(event, payload, error = false) {
        this.eventEmitter.emit(event, payload, error);
    }


    /**
     * Returns the event emitter
     * Used for testing purpose and avoid using this during development
     */
    getEventEmitter() {
        return this.eventEmitter;
    }
}

export default (new Client);