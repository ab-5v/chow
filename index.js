var xtnd = require('xtnd');

var chow = {

    /**
     * Creates new hoarder
     *
     * @param {Object} options
     * @param {number} options.ttl
     * @param {number} options.maxsize
     * @param {number} options.maxcount
     * @param {Function} options.size
     * @param {Function} options.save
     *
     * @returns chow
     */
    create: function(options) {

        var inst = xtnd({}, this, options)
            ._empty()
            ._timer()
        ;
        inst.init()
        return inst;
    },

    /**
     * Initializes hoarder
     * @virtual
     */
    init: function() {},

    /**
     * Updates storage
     *
     * @param {String} key
     * @param {Object} val
     */
    update: function(key, val) {
        this._store[key] = val;
        this._update(key, val);
    },

    /**
     * Updates meta info and triggers flush if
     * @private
     */
    _update: function(key, val) {

        if (this.maxsize) {
            this._size += this.size(key, val);
            if (this._size > this.maxsize) {
                process.nextTick(this.flush.bind(this));
            }
        }
        if (this.maxcount) {
            this._count++;
            if (this._count > this.maxcount) {
                process.nextTick(this.flush.bind(this));
            }
        }
    },

    /**
     * Flushes data, calls `save`,
     * can be called automatically
     */
    flush: function() {
        var that = this;
        var data = this._store;

        this._empty();

        this.save(data, this._timer.bind(this));
    },

    /**
     * Describes how to save your data on flush
     *
     * @virtual
     * @param {Object} data
     * @param {Function} onsave
     */
    save: function() {},

    /**
     * Recreates storage and limits
     *
     * @private
     * @return chow
     */
    _empty: function() {
        this._size = 0;
        this._count = 0;
        this._store = {};
        return this;
    },

    /**
     * Setups ttl timer
     *
     * @private
     * @return chow
     */
    _timer: function() {
        var shift = 0;

        if (this.ttl) {
            if (this.ttlshift === true) {
                shift = Math.ceil( Math.random()*this.ttl - this.ttl/2 );
            } else if (this.ttlshift) {
                shift = this.ttlshift;
            }
            setTimeout(this.flush.bind(this), this.ttl + shift);
        }
        return this;
    }
};

module.exports = chow;
