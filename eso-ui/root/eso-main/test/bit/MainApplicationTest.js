/*global define, describe, before, after, beforeEach, afterEach, it, expect */
define([
    'eso-ui/MainApplication'
], function (MainApplication) {
    'use strict';

    describe('MainApplication', function () {

        it('Sample BIT test', function () {
            expect(MainApplication).not.to.be.undefined;
        });

    });

});
